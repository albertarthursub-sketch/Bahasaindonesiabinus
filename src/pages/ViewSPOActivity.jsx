import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Loader } from 'lucide-react';

const ViewSPOActivity = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const docSnap = await getDoc(doc(db, 'spoActivities', activityId));
      if (docSnap.exists()) {
        setActivity(docSnap.data());
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
            <h1 className="text-4xl font-bold text-gray-900">📖 View Activity</h1>
            <p className="text-gray-600 mt-2">{activity.title || 'SPO Activity'}</p>
          </div>
        </div>

        {/* Activity Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Difficulty Level</p>
              <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-lg capitalize font-semibold">
                {activity.difficulty}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Questions</p>
              <p className="text-lg font-semibold text-gray-900">{activity.questions?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Created</p>
              <p className="text-gray-900">{new Date(activity.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Updated</p>
              <p className="text-gray-900">{new Date(activity.updatedAt || activity.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions</h2>
          
          {!activity.questions || activity.questions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No questions in this activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activity.questions.map((question, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  <p className="font-semibold text-gray-900 mb-3">
                    {index + 1}. {question.text || question.sentence || 'Untitled'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-xs font-bold text-red-600 mb-1">SUBJECT</p>
                      <p className="text-gray-900">{question.subject || 'N/A'}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <p className="text-xs font-bold text-yellow-600 mb-1">PREDICATE</p>
                      <p className="text-gray-900">{question.predicate || 'N/A'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs font-bold text-blue-600 mb-1">OBJECT</p>
                      <p className="text-gray-900">{question.object || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/teacher')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSPOActivity;
