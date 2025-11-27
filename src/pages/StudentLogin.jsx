import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AVATARS = ['🦁', '🐯', '🐼', '🐨', '🦊', '🐸', '🐢', '🦆', '🐧', '🦄', '🐱', '🐶'];

function StudentLogin() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [studentName, setStudentName] = useState('');
  const [step, setStep] = useState(1); // 1: Enter Code, 2: Choose Avatar
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const upperCode = code.toUpperCase();
      const q = query(collection(db, 'students'), where('loginCode', '==', upperCode));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('Invalid code. Please try again.');
        setLoading(false);
        return;
      }

      const studentData = snapshot.docs[0].data();
      setStudentName(studentData.name);
      setStep(2); // Move to avatar selection
    } catch (err) {
      setError('Error logging in. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleAvatarSelect = async () => {
    try {
      const upperCode = code.toUpperCase();
      const q = query(collection(db, 'students'), where('loginCode', '==', upperCode));
      const snapshot = await getDocs(q);

      const studentData = snapshot.docs[0].data();
      
      sessionStorage.setItem('student', JSON.stringify({
        id: snapshot.docs[0].id,
        ...studentData,
        avatar: selectedAvatar
      }));

      // Navigate to home page to select a vocabulary list
      navigate('/student-home');
    } catch (err) {
      setError('Error starting session. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card">
          {step === 1 ? (
            <>
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">👦</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Student Login
                </h1>
                <p className="text-gray-600">
                  Enter your code to start learning!
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Your Login Code
                  </label>
                  <input
                    type="text"
                    className="input text-center text-2xl font-mono uppercase tracking-wider"
                    placeholder="ABC123"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-green w-full text-xl"
                  disabled={code.length < 4 || loading}
                >
                  {loading ? '⏳ Checking...' : 'Continue →'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <a href="/" className="text-blue-600 hover:underline">
                  ← Back to Home
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Hi {studentName}! 👋
                </h1>
                <p className="text-gray-600 mb-6">
                  Choose your avatar
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-6">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`text-5xl p-3 rounded-lg transition-all ${
                      selectedAvatar === avatar
                        ? 'bg-blue-300 scale-110 ring-4 ring-blue-500'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>

              <div className="mb-4 text-center">
                <div className="text-8xl">{selectedAvatar}</div>
                <p className="text-gray-600 mt-2">Your Avatar</p>
              </div>

              <button
                onClick={handleAvatarSelect}
                className="btn btn-green w-full text-xl mb-3"
              >
                Start Learning! 🚀
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setCode('');
                  setError('');
                }}
                className="btn btn-gray w-full"
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
