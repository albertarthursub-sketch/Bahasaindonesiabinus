import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function AssignActivityModal({ isOpen, list, classes, teacherId, onClose, onAssignSuccess }) {
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !list) return null;

  const handleAssign = async () => {
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if already assigned
      const assignmentsRef = collection(db, 'assignments');
      const q = query(
        assignmentsRef,
        where('listId', '==', list.id),
        where('classId', '==', selectedClass)
      );
      const existingAssignments = await getDocs(q);

      if (!existingAssignments.empty) {
        setError('This activity is already assigned to this class');
        setLoading(false);
        return;
      }

      // Get the selected class name for reference
      const selectedClassData = classes.find(c => c.id === selectedClass);

      // Add assignment
      await addDoc(assignmentsRef, {
        listId: list.id,
        classId: selectedClass,
        className: selectedClassData?.name || 'Unknown',
        teacherId: teacherId,
        assignedAt: serverTimestamp(),
        listTitle: list.title
      });

      setSuccess('✓ Activity assigned successfully!');
      setSelectedClass('');
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        if (onAssignSuccess) onAssignSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error assigning activity:', err);
      setError('Failed to assign activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !list) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-2">{list.title}</h2>
        <p className="text-gray-600 mb-6">Assign this activity to a class</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
            {success}
          </div>
        )}

        {!success && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a class...</option>
                {classes && classes.length > 0 ? (
                  classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.gradeLevel && `(${cls.gradeLevel})`}
                    </option>
                  ))
                ) : (
                  <option disabled>No classes available</option>
                )}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="btn btn-gray flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={loading || !selectedClass}
                className="btn btn-green flex-1"
              >
                {loading ? 'Assigning...' : '✓ Assign'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
