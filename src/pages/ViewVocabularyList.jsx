import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, Loader, Image as ImageIcon, Trash2, Edit } from 'lucide-react';

const ViewVocabularyList = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadList();
  }, [listId]);

  const loadList = async () => {
    try {
      setLoading(true);
      const docSnap = await getDoc(doc(db, 'lists', listId));
      if (docSnap.exists()) {
        setList(docSnap.data());
      } else {
        alert('Vocabulary list not found');
        navigate('/teacher');
      }
    } catch (error) {
      console.error('Error loading list:', error);
      alert('Error loading list: ' + error.message);
      navigate('/teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this vocabulary list? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteDoc(doc(db, 'lists', listId));
      navigate('/teacher');
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Error deleting list: ' + error.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-green-600" size={48} />
          <p className="text-gray-600 text-lg">Loading vocabulary list...</p>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Vocabulary list not found</p>
      </div>
    );
  }

  const isImageMode = list.mode === 'image-vocabulary';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/teacher')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
            title="Back to dashboard"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900">📖 View Vocabulary List</h1>
            <p className="text-gray-600 mt-2">{list.title}</p>
          </div>
        </div>

        {/* List Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Type</p>
              <span className={`inline-block px-3 py-1 rounded-lg capitalize font-semibold ${
                isImageMode 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {isImageMode ? 'Image-Based' : 'Syllable'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Words</p>
              <p className="text-lg font-semibold text-gray-900">{list.words?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Learning Area</p>
              <p className="text-gray-900">{list.learningArea || 'General'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Created</p>
              <p className="text-gray-900">{new Date(list.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {list.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-900">{list.description}</p>
            </div>
          )}
        </div>

        {/* Words/Vocabulary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Vocabulary Items</h2>
          
          {!list.words || list.words.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No words in this list</p>
            </div>
          ) : isImageMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.words.map((word, index) => (
                <div key={index} className="bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all">
                  {word.imageUrl ? (
                    <img 
                      src={word.imageUrl} 
                      alt={word.word}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                      <ImageIcon size={40} className="text-gray-400" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-bold text-gray-900 text-lg">{word.word}</p>
                    <p className="text-sm text-gray-600 mt-1">{word.meaning}</p>
                    {word.example && (
                      <p className="text-xs text-gray-500 mt-2 italic">"{word.example}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {list.words.map((word, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:bg-gray-100 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{word.word}</p>
                      <p className="text-sm text-gray-600 mt-1">{word.meaning}</p>
                      {word.example && (
                        <p className="text-xs text-gray-500 mt-2 italic">Example: {word.example}</p>
                      )}
                    </div>
                    <span className="text-3xl">{word.syllables || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 sticky bottom-6">
          <button
            onClick={() => navigate('/teacher')}
            className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition-all"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/teacher')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Edit size={20} />
            Edit List
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <Loader className="animate-spin" size={20} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={20} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewVocabularyList;
