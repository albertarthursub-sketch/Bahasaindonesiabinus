import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import LearningModeSelector from '../components/LearningModeSelector';
import AddVocabularyWithImage from '../components/AddVocabularyWithImage';
import AIVocabularyGenerator from '../components/AIVocabularyGenerator';
import AssignActivityModal from '../components/AssignActivityModal';
import SPOActivityGenerator from '../components/SPOActivityGenerator';

function TeacherDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState('lists');
  const [lists, setLists] = useState([]);
  const [students, setStudents] = useState([]);
  const [showCreateList, setShowCreateList] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showImageVocab, setShowImageVocab] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    // Check if teacher is authenticated
    const email = sessionStorage.getItem('teacherEmail');
    const token = sessionStorage.getItem('authToken');
    
    if (!token || !email) {
      navigate('/teacher-login');
      return;
    }
    
    setTeacherEmail(email);
    setTeacherId(token); // Use token as teacher ID (Firebase UID)
    loadLists(token);
    loadStudents(token);
  }, [navigate]);

  const loadLists = async (teacherId) => {
    try {
      // Load only lists created by this teacher
      const q = query(collection(db, 'lists'), where('teacherId', '==', teacherId));
      const snapshot = await getDocs(q);
      setLists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      console.log('✅ Loaded teacher lists:', snapshot.docs.length);
    } catch (error) {
      console.error('❌ Error loading lists:', error);
    }
  };

  const handleCreateListClick = () => {
    // Show mode selector to choose between syllable or image-based learning
    setShowModeSelector(true);
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setShowModeSelector(false);
    
    if (mode === 'image-vocabulary') {
      // Show image vocabulary creation modal
      setShowImageVocab(true);
    } else {
      // Show traditional syllable mode
      setShowCreateList(true);
    }
  };

  const loadStudents = async (teacherId) => {
    try {
      // Load only classes created by this teacher
      const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
      const snapshot = await getDocs(q);
      const loadedClasses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('✅ Loaded teacher classes:', loadedClasses);
      setStudents(loadedClasses);
    } catch (error) {
      console.error('❌ Error loading classes:', error);
    }
  };

  const deleteList = async (id) => {
    if (confirm('Delete this list?')) {
      await deleteDoc(doc(db, 'lists', id));
      loadLists(teacherId);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('teacherEmail');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
              <p className="text-gray-600">👋 Welcome, {teacherEmail}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleLogout} className="btn btn-red">🚪 Logout</button>
              <a href="/" className="btn btn-gray">← Home</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setView('lists')}
            className={`btn ${view === 'lists' ? 'btn-blue' : 'btn-gray'}`}
          >
            📚 Vocabulary Lists ({lists.length})
          </button>
          <button
            onClick={() => setView('students')}
            className={`btn ${view === 'students' ? 'btn-blue' : 'btn-gray'}`}
          >
            🏫 Classes ({students.length})
          </button>
          <button
            onClick={() => setView('spo')}
            className={`btn ${view === 'spo' ? 'btn-green' : 'btn-gray'}`}
          >
            ✍️ SPO Activities
          </button>
          <a href="/classes" className="btn btn-cyan">
            🏫 Manage Classes
          </a>
          <a href="/teacher-analytics" className="btn btn-purple">
            📊 Analytics
          </a>
          <a href="/teacher-resources" className="btn btn-green">
            📚 Resources
          </a>
        </div>

        {view === 'lists' && (
          <div>
            <div className="mb-6 flex gap-3 flex-wrap">
              <button onClick={handleCreateListClick} className="btn btn-blue">
                + Create New List
              </button>
              <button onClick={() => setShowAIGenerator(true)} className="btn btn-purple">
                🤖 AI Generate Vocabulary
              </button>
            </div>

            {lists.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">No vocabulary lists created yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {lists.map(list => (
                  <div key={list.id} className="card">
                    <h3 className="text-xl font-bold mb-2">{list.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {list.learningArea} • {list.words?.length || 0} words
                    </p>
                    <div className="flex gap-2 flex-col">
                      <div className="flex gap-2">
                        <button className="btn btn-blue flex-1">Edit</button>
                        <button onClick={() => deleteList(list.id)} className="btn btn-gray">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'students' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Classes Overview</h2>
              <p className="text-gray-600 mb-6">View and manage students by class. Click on a class to edit or delete students.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500 text-lg mb-4">📭 No classes created yet</p>
                  <p className="text-gray-600 mb-6">Create your first class in "Manage Classes" to get started</p>
                  <a href="/classes" className="btn btn-blue inline-block">
                    🏫 Go to Manage Classes
                  </a>
                </div>
              ) : (
                students.map(cls => (
                  <div key={cls.id || Math.random()} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 border-2 border-blue-200 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">🎓 {cls.name || cls.className || 'Class'}</h3>
                      <span className="text-sm font-semibold bg-blue-200 text-blue-800 px-3 py-1 rounded-full">
                        {cls.gradeLevel || 'Grade 1'}
                      </span>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-2">👥 Students</p>
                      <p className="text-3xl font-bold text-blue-600">{cls.studentCount || 0}</p>
                    </div>

                    <div className="space-y-2">
                      <a href="/classes" className="block w-full text-center btn btn-blue text-sm py-2">
                        👉 Manage Students
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'spo' && students.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">✍️ SPO Writing Practice Activities</h2>
              <p className="text-gray-600 mb-6">
                Create and assign Subject-Predicate-Object sentence building activities to your classes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {students.map(cls => (
                <div key={cls.id} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">🎓 {cls.name || cls.className}</h3>
                  <SPOActivityGenerator teacherId={teacherId} classId={cls.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'spo' && students.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">📭 No classes created</p>
            <p className="text-gray-600 mb-6">You need to create a class first before creating SPO activities</p>
            <a href="/classes" className="btn btn-blue inline-block">
              🏫 Create a Class
            </a>
          </div>
        )}
      </div>

      {showModeSelector && (
        <LearningModeSelector
          onClose={() => setShowModeSelector(false)}
          onSelect={handleModeSelect}
        />
      )}

      {showImageVocab && (
        <AddVocabularyWithImage
          onClose={() => {
            setShowImageVocab(false);
            setSelectedMode(null);
          }}
          onSave={() => {
            setShowImageVocab(false);
            setSelectedMode(null);
            loadLists(teacherId);
          }}
          teacherId={teacherId}
        />
      )}

      {showCreateList && (
        <CreateListModal
          onClose={() => setShowCreateList(false)}
          onSave={() => {
            setShowCreateList(false);
            loadLists(teacherId);
          }}
          teacherId={teacherId}
          classes={students}
        />
      )}

      {showQuickAdd && (
        <QuickAddModal
          onClose={() => setShowQuickAdd(false)}
          onSave={() => {
            setShowQuickAdd(false);
            loadLists();
          }}
        />
      )}

      {showAIGenerator && (
        <AIVocabularyGenerator
          onClose={() => setShowAIGenerator(false)}
          onSave={() => {
            setShowAIGenerator(false);
            loadLists(teacherId);
          }}
          teacherId={teacherId}
        />
      )}
    </div>
  );
}

function CreateListModal({ onClose, onSave, teacherId, classes = [] }) {
  const [title, setTitle] = useState('');
  const [words, setWords] = useState([]);
  const [english, setEnglish] = useState('');
  const [bahasa, setBahasa] = useState('');
  const [syllables, setSyllables] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCategoryMode, setShowCategoryMode] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [generatingCategory, setGeneratingCategory] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [generatedWords, setGeneratedWords] = useState([]);
  const [editingWordIndex, setEditingWordIndex] = useState(null);
  const [imageGenerationProgress, setImageGenerationProgress] = useState(0);
  const [selectedClasses, setSelectedClasses] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target.result);
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (event) => {
          setAudioUrl(event.target.result);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      alert('Microphone access denied');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const addWord = () => {
    if (!english.trim() || !bahasa.trim() || !syllables.trim()) {
      alert('Please fill in English word, Bahasa word, and syllables');
      return;
    }

    // Parse syllables - split by hyphen or space
    const syllableArray = syllables
      .trim()
      .split(/[\s-]+/)
      .filter(s => s.length > 0);
    
    if (syllableArray.length === 0) {
      alert('Please enter valid syllables (e.g., Ku-cing or Ku cing)');
      return;
    }

    setWords([...words, {
      word: bahasa.trim(),
      english: english.trim(),
      translation: english.trim(),
      syllables: syllableArray,
      imageUrl: imageUrl || '',
      audioUrl: audioUrl || '',
      pronunciation: audioUrl || ''
    }]);

    // Reset form
    setEnglish('');
    setBahasa('');
    setSyllables('');
    setImageUrl('');
    setImagePreview('');
    setAudioUrl('');
  };

  const removeWord = (index) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const generateImage = async () => {
    const englishWord = english.trim();
    const bahasaWord = bahasa.trim();
    
    if (!englishWord && !bahasaWord) {
      alert('Please enter an English or Bahasa word to generate an image for');
      return;
    }

    setGeneratingImage(true);
    try {
      const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
      if (!apiKey) {
        throw new Error('Stability AI key not configured. Check VITE_STABILITY_API_KEY in .env');
      }

      // Use English word first, then fall back to Bahasa word
      const basePrompt = englishWord || bahasaWord;
      console.log('🎨 Generating image for:', basePrompt);
      
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: `A clear, simple illustration of ${basePrompt}. Simple, clean style, white background, centered, professional quality, suitable for children's learning materials.`,
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
        console.error('Stability API error:', response.status, errorText);
        throw new Error(`Stability API error ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      
      if (data.artifacts && data.artifacts[0]) {
        const dataUrl = `data:image/png;base64,${data.artifacts[0].base64}`;
        setImageUrl(dataUrl);
        setImagePreview(dataUrl);
        alert('✅ Image generated successfully!');
      } else {
        throw new Error('No image data in response');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert(`❌ Error: ${error.message}`);
    }
    setGeneratingImage(false);
  };

  const generateFromCategory = async () => {
    if (!categoryInput.trim()) {
      alert('Please enter a category (e.g., Animals, Food, Colors)');
      return;
    }

    setGeneratingCategory(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log('API URL:', apiUrl);
      
      if (!apiUrl) {
        throw new Error('VITE_API_URL environment variable not configured. Check your .env file.');
      }
      
      console.log('Full URL:', `${apiUrl}/api/generate-category`);
      
      const response = await fetch(`${apiUrl}/api/generate-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryInput.trim() })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate category');
      }

      const data = await response.json();
      setGeneratedWords(data.words);
      setShowReviewModal(true);
      setImageGenerationProgress(0);
      
      // Start generating images for all words
      await generateImagesForWords(data.words);
    } catch (error) {
      console.error('Error generating from category:', error);
      alert(`❌ Error: ${error.message}`);
    }
    setGeneratingCategory(false);
  };

  const generateImagesForWords = async (wordsList) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      console.error('VITE_API_URL not configured');
      alert('API configuration missing. Check your .env file for VITE_API_URL');
      return wordsList;
    }

    const updated = [...wordsList];
    for (let i = 0; i < updated.length; i++) {
      try {
        const response = await fetch(`${apiUrl}/api/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: updated[i].english,
            customPrompt: ''
          })
        });

        if (response.ok) {
          const data = await response.json();
          updated[i].imageUrl = data.imageUrl;
          updated[i].status = 'generated';
          setGeneratedWords([...updated]);
        }
      } catch (error) {
        console.error(`Error generating image for ${updated[i].english}:`, error);
        updated[i].status = 'failed';
      }
      setImageGenerationProgress(Math.round((i + 1) / updated.length * 100));
    }
  };

  const acceptGeneratedWords = () => {
    // Convert generated words to the format needed for saving
    const convertedWords = generatedWords.map(w => ({
      word: w.bahasa.trim(),
      english: w.english.trim(),
      translation: w.english.trim(),
      syllables: (w.syllables || w.bahasa).split(/[\s-]+/).filter(s => s.length > 0),
      imageUrl: w.imageUrl || '',
      audioUrl: '',
      pronunciation: ''
    }));
    
    setWords([...words, ...convertedWords]);
    setGeneratedWords([]);
    setShowReviewModal(false);
    setCategoryInput('');
    setShowCategoryMode(false);
  };

  const saveList = async () => {
    if (!title.trim()) {
      alert('Please enter a list title');
      return;
    }
    if (words.length === 0) {
      alert('Please add at least one word');
      return;
    }

    setSaving(true);
    
    try {
      // Create a timeout promise that rejects after 30 seconds
      const savePromise = new Promise(async (resolve, reject) => {
        try {
          // Upload images to Cloud Storage and get URLs
          const wordsForFirestore = await Promise.all(
            words.map(async (w) => {
              let imageUrl = '';

              // If image is a data URL (base64), upload it to Cloud Storage
              if (w.imageUrl && w.imageUrl.startsWith('data:')) {
                try {
                  const blob = await fetch(w.imageUrl).then(res => res.blob());
                  const fileName = `vocabulary/${Date.now()}-${w.word || 'image'}.png`;
                  const storageRef = ref(storage, fileName);
                  await uploadBytes(storageRef, blob);
                  imageUrl = await getDownloadURL(storageRef);
                  console.log(`✅ Uploaded image for ${w.word} to Cloud Storage: ${imageUrl}`);
                } catch (err) {
                  console.error(`Error uploading image for ${w.word}:`, err);
                  // Continue without image if upload fails
                }
              } else if (w.imageUrl) {
                imageUrl = w.imageUrl;
              }

              return {
                word: w.word || '',
                english: w.english || '',
                translation: w.translation || '',
                syllables: Array.isArray(w.syllables) ? w.syllables.join('-') : (w.syllables || ''),
                imageUrl: imageUrl || '',
                audioUrl: w.audioUrl ? w.audioUrl.substring(0, 500) : '',
                pronunciation: w.pronunciation ? w.pronunciation.substring(0, 500) : ''
              };
            })
          );

          console.log('📤 Saving list with words:', wordsForFirestore);

          // Create the list
          const listRef = await addDoc(collection(db, 'lists'), {
            title: title.trim(),
            description: 'Teacher-created vocabulary list',
            teacherId: teacherId,
            learningArea: 'vocabulary',
            words: wordsForFirestore,
            createdAt: new Date().toISOString()
          });

          // Create assignments for selected classes
          const assignmentsCollection = collection(db, 'assignments');
          for (const classId of selectedClasses) {
            const selectedClassData = classes.find(c => c.id === classId);
            await addDoc(assignmentsCollection, {
              listId: listRef.id,
              classId: classId,
              className: selectedClassData?.name || selectedClassData?.className || 'Unknown',
              teacherId: teacherId,
              assignedAt: new Date().toISOString(),
              listTitle: title.trim()
            });
            console.log(`✅ Assigned list to class: ${selectedClassData?.name || classId}`);
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });

      // Race the promise against a 30-second timeout
      await Promise.race([
        savePromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Save operation timed out (30s). Please check your internet connection and try again.')), 30000)
        )
      ]);

      alert(`✅ List saved${selectedClasses.length > 0 ? ` and assigned to ${selectedClasses.length} class(es)` : ''}!`);
      onSave();
      onClose();
    } catch (error) {
      console.error('❌ Error saving list:', error);
      console.error('Error details:', error.message);
      alert(`Error saving list: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">📚 Create Vocabulary List</h2>
            <p className="text-sm text-gray-600">Add words with images and audio pronunciations</p>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
        </div>

        {/* Mode Toggle - REMOVED FOR SIMPLICITY */}

        {/* Manual Entry Mode - Always Shown */}
        <div>
            {/* List Title */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">List Title</label>
              <input
                type="text"
                className="input w-full border-2 border-gray-200 focus:border-blue-400"
            placeholder="e.g., Animals, Colors, Food"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
          />
        </div>

            {/* Class Selection */}
            {classes && classes.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📚 Assign to Classes (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {classes.map(cls => (
                    <label key={cls.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-green-100 rounded transition">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClasses([...selectedClasses, cls.id]);
                          } else {
                            setSelectedClasses(selectedClasses.filter(id => id !== cls.id));
                          }
                        }}
                        className="w-4 h-4 cursor-pointer"
                        disabled={saving}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {cls.name || cls.className} ({cls.studentCount || 0} students)
                      </span>
                    </label>
                  ))}
                </div>
                {selectedClasses.length > 0 && (
                  <div className="mt-2 text-xs text-green-700 font-semibold">
                    ✓ Assigned to {selectedClasses.length} class{selectedClasses.length !== 1 ? 'es' : ''}
                  </div>
                )}
              </div>
            )}

        {/* Add Word Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-5 mb-6">
          <p className="text-sm font-bold text-blue-900 mb-4">➕ Add New Word</p>

          {/* English & Bahasa & Syllables Fields */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">English Word</label>
              <input
                type="text"
                className="input w-full text-sm border-2 border-blue-200"
                placeholder="e.g., Cat"
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Bahasa Word</label>
              <input
                type="text"
                className="input w-full text-sm border-2 border-blue-200"
                placeholder="e.g., Kucing"
                value={bahasa}
                onChange={(e) => setBahasa(e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Syllables</label>
              <input
                type="text"
                className="input w-full text-sm border-2 border-green-200"
                placeholder="e.g., Ku-cing"
                value={syllables}
                onChange={(e) => setSyllables(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Syllables Preview */}
          {syllables && (
            <div className="mb-4 p-3 bg-white border border-green-300 rounded">
              <p className="text-xs text-gray-600 mb-1">Syllables Preview:</p>
              <p className="text-lg font-semibold text-green-600">
                {syllables.split(/[\s-]+/).filter(s => s.length > 0).join(' - ')}
              </p>
            </div>
          )}

          {/* Custom Prompt for Image Generation */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">✏️ Custom Image Prompt (Optional)</label>
            <input
              type="text"
              className="input w-full text-sm border-2 border-purple-200"
              placeholder="e.g., 'a yellow cat sitting on a book' - Leave empty to use the word"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={saving || generatingImage}
            />
            <p className="text-xs text-gray-500 mt-1">💡 Tip: Use this for more specific image descriptions if the default doesn't match what you want</p>
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">📷 Add Image</label>
            
            {imagePreview && (
              <div className="mb-3 text-center">
                <img src={imagePreview} alt="Preview" className="max-h-24 mx-auto rounded-lg border-2 border-blue-300" />
              </div>
            )}
            
            <div className="flex gap-2 mb-3">
              <input
                type="file"
                accept="image/*"
                className="flex-1 text-xs border-2 border-dashed border-blue-300 rounded p-2"
                onChange={handleImageUpload}
                disabled={saving || generatingImage}
              />
              <button
                onClick={generateImage}
                disabled={generatingImage || (!english.trim() && !bahasa.trim())}
                className="btn bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs py-2 px-3 rounded-lg font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                title={english.trim() || bahasa.trim() ? `Generate image for "${english.trim() || bahasa.trim()}"` : "Enter a word first to generate image"}
              >
                {generatingImage ? '⏳ Generating...' : '✨ Generate'}
              </button>
            </div>
          </div>

          {/* Audio Recording */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">🎤 Record Audio (Optional)</label>
            
            {isRecording && (
              <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded flex items-center gap-2">
                <span className="animate-pulse text-red-600">● Recording</span>
              </div>
            )}

            {audioUrl && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">✓ Audio recorded</p>
                <audio controls className="w-full h-7 text-xs">
                  <source src={audioUrl} type="audio/webm" />
                </audio>
              </div>
            )}

            <div className="flex gap-2">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="btn btn-blue flex-1 text-xs py-2"
                  disabled={saving}
                >
                  🎤 Record
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="btn bg-red-500 hover:bg-red-600 text-white flex-1 text-xs py-2"
                >
                  ⏹ Stop
                </button>
              )}
              {audioUrl && (
                <button
                  onClick={() => setAudioUrl('')}
                  className="btn btn-gray text-xs py-2"
                  disabled={saving}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <button
            onClick={addWord}
            disabled={saving || !english || !bahasa}
            className="btn btn-green w-full text-sm"
          >
            ✅ Add This Word
          </button>
        </div>

        {/* Words List */}
        {words.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              ✓ Words Added ({words.length}):
            </p>
            <div className="space-y-2">
              {words.map((w, i) => (
                <div key={i} className="bg-white p-3 rounded border border-gray-300 flex items-start justify-between gap-3">
                  <div className="flex-1 text-sm">
                    <div className="flex items-center gap-2">
                      {w.imageUrl && <img src={w.imageUrl} alt="thumb" className="w-10 h-10 rounded object-cover" />}
                      <div>
                        <p className="font-bold text-gray-800">{w.english}</p>
                        <p className="text-blue-600 font-semibold">{w.word}</p>
                        <p className="text-xs text-gray-500">{w.syllables.join(' - ')}</p>
                        {w.audioUrl && <p className="text-xs text-green-600 mt-1">🎤 Audio</p>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeWord(i)}
                    className="text-red-500 hover:text-red-700 font-bold text-lg"
                    disabled={saving}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving || generatingCategory}
            className="btn btn-gray flex-1"
          >
            Cancel
          </button>
          <button
            onClick={saveList}
            disabled={!title.trim() || words.length === 0 || saving || generatingCategory}
            className="btn btn-blue flex-1"
          >
            {saving ? '⏳ Saving...' : `💾 Save List (${words.length})`}
          </button>
        </div>
        </div>

        {/* Review Modal for Generated Words - REMOVED */}
      </div>
    </div>
  );
}

// Quick add modal for fast list creation
function QuickAddModal({ onClose, onSave }) {
  const [listName, setListName] = useState('Test Vocabulary List');
  const [creating, setCreating] = useState(false);

  const handleQuickCreate = async () => {
    if (!listName.trim()) {
      alert('Please enter a list name');
      return;
    }

    setCreating(true);

    try {
      // Create a simple test vocabulary list with basic words
      const testWords = [
        {
          word: 'Kucing',
          syllables: ['Ku', 'cing'],
          translation: 'Cat',
          pronunciation: 'koo-ching',
          category: 'animals',
          imageUrl: '',
          audioUrl: ''
        },
        {
          word: 'Anjing',
          syllables: ['An', 'jing'],
          translation: 'Dog',
          pronunciation: 'ahn-jing',
          category: 'animals',
          imageUrl: '',
          audioUrl: ''
        },
        {
          word: 'Apel',
          syllables: ['A', 'pel'],
          translation: 'Apple',
          pronunciation: 'ah-pell',
          category: 'fruits',
          imageUrl: '',
          audioUrl: ''
        },
        {
          word: 'Pisang',
          syllables: ['Pi', 'sang'],
          translation: 'Banana',
          pronunciation: 'pee-sahng',
          category: 'fruits',
          imageUrl: '',
          audioUrl: ''
        },
        {
          word: 'Merah',
          syllables: ['Me', 'rah'],
          translation: 'Red',
          pronunciation: 'muh-rah',
          category: 'colors',
          imageUrl: '',
          audioUrl: ''
        }
      ];

      const docRef = await addDoc(collection(db, 'lists'), {
        title: listName,
        description: 'Quick test vocabulary list for learning',
        teacherId: teacherId,
        learningArea: 'vocabulary',
        words: testWords,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('✅ Quick list created:', docRef.id);
      alert(`✅ List "${listName}" created with 5 test words!`);
      onSave();
      onClose();
    } catch (error) {
      console.error('❌ Error creating list:', error);
      alert('Error creating list. Check console.');
    }

    setCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">⚡ Quick Add Test List</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-2">List Name</label>
            <input
              type="text"
              className="input w-full"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g., Animals, Colors, Food"
              disabled={creating}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded text-sm text-blue-900">
            <p className="font-semibold mb-2">📝 This will create a list with:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Kucing (Cat)</li>
              <li>Anjing (Dog)</li>
              <li>Apel (Apple)</li>
              <li>Pisang (Banana)</li>
              <li>Merah (Red)</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={creating}
            className="flex-1 btn btn-gray disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleQuickCreate}
            disabled={creating}
            className="flex-1 btn btn-blue disabled:opacity-50"
          >
            {creating ? '⏳ Creating...' : '✅ Create List'}
          </button>
        </div>
      </div>

      <AssignActivityModal
        isOpen={showAssignModal}
        list={selectedList}
        classes={students}
        teacherId={teacherId}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedList(null);
        }}
        onAssignSuccess={() => {
          // Refresh data if needed
        }}
      />
    </div>
  );
}

export default TeacherDashboard;
