import { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AIVocabularyGenerator = ({ onClose, onSave, teacherId, classes = [] }) => {
  // Step states
  const [step, setStep] = useState(1); // 1: Input, 2: Build items
  const [listTitle, setListTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [numItems, setNumItems] = useState('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  
  // Items being built sequentially
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [generatedItems, setGeneratedItems] = useState([]);
  const [generatingImage, setGeneratingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Step 1: Generate vocabulary
  const generateVocabularyWithAI = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!listTitle.trim()) {
      setError('Please enter a list title');
      return;
    }
    
    if (!theme.trim()) {
      setError('Please enter a theme (e.g., "kitchen items", "animals", "colors")');
      return;
    }

    const count = parseInt(numItems) || 5;
    if (count < 1 || count > 20) {
      setError('Number of items must be between 1 and 20');
      return;
    }

    setLoading(true);

    try {
      const requestPayload = { theme: theme.trim(), count };
      console.log('📝 Calling Cloud Function with payload:', requestPayload);
      const functionUrl = 'https://us-central1-bahasa-indonesia-73d67.cloudfunctions.net/generateVocabularyWithClaude';
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.items) {
        throw new Error('Invalid response from server');
      }

      console.log(`✅ Generated ${data.items.length} items for theme "${theme}"`);
      
      // Add ID to each item for tracking
      const itemsWithId = data.items.map((item, idx) => ({
        bahasa: item.bahasa,
        english: item.english,
        options: item.options || [],
        correctAnswer: item.correctAnswer || item.bahasa,
        id: idx,
        imageUrl: null,
        imageGenerated: false
      }));
      
      setGeneratedItems(itemsWithId);
      setCurrentItemIndex(0);
      setStep(2); // Move to build step
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to generate vocabulary');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Generate image for current item
  const generateImageForCurrentItem = async () => {
    if (currentItemIndex >= generatedItems.length) return;
    
    const currentItem = generatedItems[currentItemIndex];
    setGeneratingImage(true);
    setError('');

    try {
      const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
      if (!apiKey) {
        throw new Error('Stability AI key not configured. Check VITE_STABILITY_API_KEY in .env');
      }

      console.log(`🎨 Generating image for: ${currentItem.bahasa} (${currentItem.english})`);

      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: `A clear, simple illustration of a ${currentItem.bahasa} (${currentItem.english}). Simple, clean style, white background, centered, professional quality, suitable for children's learning materials.`,
              weight: 1
            }
          ],
          negative_prompts: [{ text: 'text, watermark, blurry, low quality, distorted', weight: -1 }],
          steps: 30,
          width: 1024,
          height: 1024,
          guidance_scale: 7,
          seed: Math.floor(Math.random() * 1000000)
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stability API error response:', response.status, errorText);
        throw new Error(`Stability API error ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      
      if (data.artifacts && data.artifacts[0]) {
        const dataUrl = `data:image/png;base64,${data.artifacts[0].base64}`;
        
        // Update current item with image
        setGeneratedItems(prev => prev.map((item, idx) =>
          idx === currentItemIndex 
            ? { ...item, imageUrl: dataUrl, imageGenerated: true }
            : item
        ));

        console.log(`✅ Image generated for ${currentItem.bahasa}`);
      } else {
        throw new Error('No image data in response');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError(`Failed to generate image: ${err.message}`);
    } finally {
      setGeneratingImage(false);
    }
  };

  // Step 2: Manual image upload for current item
  const handleManualImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      
      setGeneratedItems(prev => prev.map((item, idx) =>
        idx === currentItemIndex 
          ? { ...item, imageUrl: dataUrl, imageGenerated: true }
          : item
      ));

      console.log(`✅ Image uploaded for ${generatedItems[currentItemIndex]?.bahasa}`);
    };
    reader.readAsDataURL(file);
  };

  // Step 2: Skip image for current item
  const skipImageForCurrentItem = () => {
    setGeneratedItems(prev => prev.map((item, idx) =>
      idx === currentItemIndex 
        ? { ...item, imageGenerated: true }
        : item
    ));
  };

  // Move to next item
  const goToNextItem = () => {
    if (currentItemIndex < generatedItems.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setError('');
    }
  };

  // Move to previous item
  const goToPreviousItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
      setError('');
    }
  };

  // Finish and save list
  const finishAndSave = async () => {
    setError('');
    
    if (generatedItems.length === 0) {
      setError('No items to save');
      return;
    }

    setLoading(true);

    try {
      // Upload images to Cloud Storage and get URLs
      const wordsForFirestore = await Promise.all(
        generatedItems.map(async (item) => {
          let imageUrl = '';

          // If image is a data URL (base64), upload it to Cloud Storage
          if (item.imageUrl && item.imageUrl.startsWith('data:')) {
            try {
              const blob = await fetch(item.imageUrl).then(res => res.blob());
              const fileName = `ai-vocabulary/${Date.now()}-${item.bahasa || 'image'}.png`;
              const storageRef = ref(storage, fileName);
              await uploadBytes(storageRef, blob);
              imageUrl = await getDownloadURL(storageRef);
              console.log(`✅ Uploaded image for ${item.bahasa} to Cloud Storage: ${imageUrl}`);
            } catch (err) {
              console.error(`Error uploading image for ${item.bahasa}:`, err);
              // Continue without image if upload fails
            }
          } else if (item.imageUrl) {
            imageUrl = item.imageUrl;
          }

          return {
            name: item.bahasa,
            word: item.bahasa,
            english: item.english,
            imageUrl: imageUrl || ''
          };
        })
      );

      console.log('📤 Saving AI-generated list with words:', wordsForFirestore);

      const listDoc = await addDoc(collection(db, 'lists'), {
        title: listTitle,
        description: `Auto-generated vocabulary list about ${theme}`,
        learningArea: 'image-vocabulary',
        mode: 'image-vocabulary',
        teacherId: teacherId,
        words: wordsForFirestore,
        createdAt: new Date().toISOString(),
        generatedByAI: true,
        theme: theme
      });

      // Create assignments for selected classes
      if (selectedClasses.length > 0) {
        const assignmentsPromises = selectedClasses.map(classId =>
          addDoc(collection(db, 'assignments'), {
            listId: listDoc.id,
            classId: classId,
            teacherId: teacherId,
            assignedAt: new Date().toISOString(),
            dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          })
        );
        await Promise.all(assignmentsPromises);
        console.log('✅ Assignments created for', selectedClasses.length, 'classes');
      }

      console.log('✅ AI-generated vocabulary list saved!');
      onSave();
    } catch (err) {
      console.error('Error saving list:', err);
      setError(`Failed to save list: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentItem = generatedItems[currentItemIndex];
  const allItemsProcessed = generatedItems.every(item => item.imageGenerated);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            🤖 AI Vocabulary Generator
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* STEP 1: Input Form */}
        {step === 1 && (
          <form onSubmit={generateVocabularyWithAI} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 List Title
              </label>
              <input
                type="text"
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                placeholder="e.g., Kitchen Vocabulary"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏷️ Theme
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., kitchen items, animals, colors"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Number of Items
              </label>
              <input
                type="number"
                value={numItems}
                onChange={(e) => setNumItems(e.target.value)}
                min="1"
                max="20"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {classes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🎓 Assign to Classes (Optional)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-lg border-2 border-gray-300">
                  {classes.map((classItem) => (
                    <label key={classItem.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(classItem.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClasses([...selectedClasses, classItem.id]);
                          } else {
                            setSelectedClasses(selectedClasses.filter(id => id !== classItem.id));
                          }
                        }}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-800 font-medium">{classItem.name || classItem.className}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
            >
              {loading ? '⏳ Generating...' : '✨ Generate Vocabulary'}
            </button>
          </form>
        )}

        {/* STEP 2: Build Items with Images */}
        {step === 2 && currentItem && (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Item {currentItemIndex + 1} of {generatedItems.length}
                </span>
                <span className="text-xs text-gray-500">
                  {generatedItems.filter(i => i.imageGenerated).length} complete
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentItemIndex + 1) / generatedItems.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Current item display */}
            <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Bahasa Indonesia</p>
                  <p className="text-2xl font-bold text-gray-800">{currentItem.bahasa}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">English</p>
                  <p className="text-2xl font-bold text-blue-600">{currentItem.english}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Options</p>
                <div className="flex flex-wrap gap-2">
                  {currentItem.options?.map((opt, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        opt === currentItem.correctAnswer
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Image section */}
            <div className="border-2 border-gray-200 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-800">🖼️ Add Image</h3>

              {currentItem.imageUrl ? (
                <div className="space-y-3">
                  <div className="w-full bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                    <img
                      src={currentItem.imageUrl}
                      alt={currentItem.bahasa}
                      className="max-w-full max-h-64 object-contain rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-green-600 font-medium">✅ Image added for this word</p>
                  <button
                    onClick={() => setGeneratedItems(prev => prev.map((item, idx) =>
                      idx === currentItemIndex 
                        ? { ...item, imageUrl: null, imageGenerated: false }
                        : item
                    ))}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Change image
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={generateImageForCurrentItem}
                    disabled={generatingImage}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
                  >
                    {generatingImage ? '⏳ Generating Image...' : '🎨 Generate Image with AI'}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 hover:border-purple-500 text-gray-600 hover:text-purple-600 font-bold py-3 rounded-lg transition"
                    >
                      📤 Upload Image from Computer
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleManualImageUpload}
                      className="hidden"
                    />
                  </div>

                  <button
                    onClick={skipImageForCurrentItem}
                    className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    ⏭️ Skip Image for This Word
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={goToPreviousItem}
                disabled={currentItemIndex === 0}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-bold py-2 rounded-lg transition"
              >
                ← Previous
              </button>

              {currentItemIndex < generatedItems.length - 1 ? (
                <button
                  onClick={goToNextItem}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={finishAndSave}
                  disabled={loading || !allItemsProcessed}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition"
                >
                  {loading ? '💾 Saving...' : '✅ Save List'}
                </button>
              )}
            </div>

            {!allItemsProcessed && currentItemIndex === generatedItems.length - 1 && (
              <p className="text-sm text-gray-600 text-center">
                ℹ️ Please process all items before saving
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIVocabularyGenerator;
