import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Loader, CheckCircle } from 'lucide-react';

const EditSPOActivity = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const docSnap = await getDoc(doc(db, 'spoActivities', activityId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActivity(data);
        setQuestions(data.questions || []);
        setSelectedQuestions((data.questions || []).map((_, idx) => idx));
      } else {
        alert('Activity not found');
        navigate('/teacher');
      }
    } catch (error) {
      console.error('Error loading activity:', error);
      alert('Error loading activity: ' + error.message);
      navigate('/teacher');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (index) => {
    setSelectedQuestions(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const moveQuestion = (index, direction) => {
    const newQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newQuestions.length) return;
    
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    setQuestions(newQuestions);
    
    // Update selected indices
    const newSelected = selectedQuestions.map(i => {
      if (i === index) return newIndex;
      if (i === newIndex) return index;
      return i;
    });
    setSelectedQuestions(newSelected);
  };

  const deleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    setSelectedQuestions(selectedQuestions.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      const selectedQuestionsList = selectedQuestions.map(idx => questions[idx]);
      
      if (selectedQuestionsList.length === 0) {
        alert('Please select at least one question');
        return;
      }

      await updateDoc(doc(db, 'spoActivities', activityId), {
        questions: selectedQuestionsList,
        totalQuestions: selectedQuestionsList.length,
        updatedAt: new Date().toISOString(),
      });

      setSuccessMessage('✅ Activity updated successfully!');
      setTimeout(() => {
        navigate('/teacher');
      }, 2000);
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Error saving activity: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-purple-600" size={48} />
          <p className="text-gray-600 text-lg">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Activity not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-4xl font-bold text-gray-900">Edit SPO Activity</h1>
            <p className="text-gray-600 mt-2">{activity.title || 'SPO Activity'}</p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-center gap-3">
            <CheckCircle size={24} />
            {successMessage}
          </div>
        )}

        {/* Activity Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Difficulty Level</p>
              <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-lg capitalize font-semibold">
                {activity.difficulty}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Questions</p>
              <p className="text-lg font-semibold text-gray-900">{questions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Selected</p>
              <p className="text-lg font-semibold text-gray-900">{selectedQuestions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Created</p>
              <p className="text-gray-900">{new Date(activity.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Questions</h2>
          
          {questions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No questions in this activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedQuestions.includes(index)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(index)}
                      onChange={() => toggleQuestion(index)}
                      className="w-5 h-5 mt-1 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-2">
                        {index + 1}. {question.text || question.sentence || 'Untitled'}
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Subject: </span>
                          <span className="font-medium text-gray-900">{question.subject || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Predicate: </span>
                          <span className="font-medium text-gray-900">{question.predicate || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Object: </span>
                          <span className="font-medium text-gray-900">{question.object || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {index > 0 && (
                        <button
                          onClick={() => moveQuestion(index, 'up')}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm transition-all"
                          title="Move up"
                        >
                          ↑
                        </button>
                      )}
                      {index < questions.length - 1 && (
                        <button
                          onClick={() => moveQuestion(index, 'down')}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm transition-all"
                          title="Move down"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={() => deleteQuestion(index)}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm transition-all"
                        title="Delete question"
                      >
                        ✕
                      </button>
                    </div>
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
            Cancel
          </button>
          <button
            onClick={saveChanges}
            disabled={saving || selectedQuestions.length === 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Save Changes ({selectedQuestions.length} selected)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSPOActivity;
