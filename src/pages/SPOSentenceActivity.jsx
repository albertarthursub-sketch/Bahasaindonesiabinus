import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import SPOSentenceBuilder from '../components/SPOSentenceBuilder';
import CompletionTrophy from '../components/CompletionTrophy';

const SPOSentenceActivity = () => {
  const { classId, listId } = useParams();
  const navigate = useNavigate();
  const [listName, setListName] = useState('');
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [showFinalTrophy, setShowFinalTrophy] = useState(false);

  useEffect(() => {
    loadListData();
  }, [listId]);

  const loadListData = async () => {
    try {
      if (listId) {
        const listDoc = await getDoc(doc(db, 'lists', listId));
        if (listDoc.exists()) {
          setListName(listDoc.data().name);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading list:', error);
      setLoading(false);
    }
  };

  const handleSentenceComplete = () => {
    setCompletedCount(prev => prev + 1);
    if (completedCount >= 4) {
      setShowFinalTrophy(true);
    }
  };

  const handleReturnToClass = () => {
    navigate(`/student/learn/${classId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🎯 SPO Writing Practice</h1>
            <p className="text-gray-600">Master Subject-Predicate-Object sentence structure</p>
            {listName && (
              <p className="text-sm text-gray-500 mt-2">Vocabulary: <span className="font-semibold">{listName}</span></p>
            )}
          </div>
          <button
            onClick={handleReturnToClass}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Progress */}
      {completedCount > 0 && (
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-700">Sentences Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500"
                style={{ width: `${Math.min((completedCount / 5) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Activity */}
      {loading ? (
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-gray-600">Loading activity...</p>
        </div>
      ) : (
        <SPOSentenceBuilder listId={listId} listName={listName} />
      )}

      {/* Final Trophy */}
      {showFinalTrophy && (
        <CompletionTrophy
          accuracy={100}
          timeSpent="Great effort!"
          wordCount={5}
          onContinue={handleReturnToClass}
        />
      )}
    </div>
  );
};

export default SPOSentenceActivity;
