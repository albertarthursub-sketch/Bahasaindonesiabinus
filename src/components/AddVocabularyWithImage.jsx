import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const AddVocabularyWithImage = ({ onClose, onSave, teacherId }) => {
  const [listTitle, setListTitle] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [words, setWords] = useState([]);
  const [currentItemName, setCurrentItemName] = useState('');
  const [currentImageFile, setCurrentImageFile] = useState(null);
  const [currentImagePreview, setCurrentImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingList, setSavingList] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentItemName.trim()) {
      setError('Please enter the item name');
      return;
    }

    if (!currentImageFile) {
      setError('Please upload an image');
      return;
    }

    setLoading(true);

    try {
      // Upload image to Firebase Storage
      const storage = getStorage();
      const fileName = `vocab-${Date.now()}-${currentImageFile.name}`;
      const storageRef = ref(storage, `vocabularies/${fileName}`);
      
      await uploadBytes(storageRef, currentImageFile);
      const imageUrl = await getDownloadURL(storageRef);

      // Add to local state
      setWords([
        ...words,
        {
          id: Date.now(),
          name: currentItemName.trim(),
          imageUrl
        }
      ]);

      // Reset form
      setCurrentItemName('');
      setCurrentImageFile(null);
      setCurrentImagePreview(null);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeWord = (id) => {
    setWords(words.filter(w => w.id !== id));
  };

  const handleSaveList = async () => {
    setError('');

    if (!listTitle.trim()) {
      setError('Please enter a list title');
      return;
    }

    if (words.length === 0) {
      setError('Please add at least one image vocabulary item');
      return;
    }

    setSavingList(true);

    try {
      // Save list to Firestore
      await addDoc(collection(db, 'lists'), {
        title: listTitle.trim(),
        description: listDescription.trim(),
        learningArea: 'image-vocabulary',
        mode: 'image-vocabulary',
        teacherId: teacherId,
        words: words,
        createdAt: new Date().toISOString(),
      });

      console.log('✅ Image vocabulary list saved!');
      onSave();
    } catch (err) {
      console.error('Error saving list:', err);
      setError('Failed to save list. Please try again.');
    } finally {
      setSavingList(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            🖼️ Create Image Vocabulary List
          </h2>
          <button
            onClick={onClose}
            disabled={loading || savingList}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* List Title & Description */}
        <div className="mb-8 pb-6 border-b-2 border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              List Title
            </label>
            <input
              type="text"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              placeholder="e.g., Daily Objects, Colors, Animals"
              disabled={savingList}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              placeholder="e.g., Learn common household items..."
              disabled={savingList}
              rows="2"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="mb-8 pb-8 border-b-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Add Items to List</h3>

          <div className="space-y-4 mb-4">
            {/* Item Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item Name (Bahasa Indonesia)
              </label>
              <input
                type="text"
                value={currentItemName}
                onChange={(e) => setCurrentItemName(e.target.value)}
                placeholder="e.g., sepatu (shoe)"
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Image
              </label>
              
              {/* Preview */}
              {currentImagePreview ? (
                <div className="relative mb-4">
                  <img
                    src={currentImagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border-2 border-purple-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentImagePreview(null);
                      setCurrentImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 w-8 h-8 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="hidden"
                    id="image-input"
                  />
                  <label
                    htmlFor="image-input"
                    className="flex items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition"
                  >
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">📸</span>
                      <span className="text-sm font-semibold text-gray-600">
                        Click to upload image
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Add Item Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition"
          >
            {loading ? '⏳ Uploading...' : '➕ Add Item to List'}
          </button>
        </form>

        {/* Current Items in List */}
        {words.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Items in List ({words.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {words.map(word => (
                <div key={word.id} className="relative">
                  <img
                    src={word.imageUrl}
                    alt={word.name}
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <div className="mt-2 text-sm font-semibold text-gray-700 truncate">
                    {word.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeWord(word.id)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm font-semibold mb-4">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading || savingList}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveList}
            disabled={loading || savingList}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition"
          >
            {savingList ? '⏳ Saving...' : '✅ Save List'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVocabularyWithImage;
