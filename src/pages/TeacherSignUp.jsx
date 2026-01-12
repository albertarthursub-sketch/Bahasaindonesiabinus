import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseConfig } from '../firebase';

function TeacherSignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
  const REGION = 'us-central1';
  const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';
  
  const SEND_OTP_URL = isDevelopment 
    ? `http://127.0.0.1:5001/${FIREBASE_PROJECT_ID}/${REGION}/sendOTP`
    : `https://${REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/sendOTP`;

  // Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!name || name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(SEND_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOtpSent(true);
        // Store name in sessionStorage for later use
        sessionStorage.setItem('teacherName', name);
        setMessage('✅ OTP sent to your email! Check your inbox.');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Network error: Unable to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">✍️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Sign Up</h1>
            <p className="text-gray-600">Get your OTP code</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 font-semibold">
              ❌ {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg text-green-700 font-semibold">
              {message}
            </div>
          )}

          {/* Simple Form - Name, Email and Request OTP button */}
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                👤 Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading || otpSent}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📧 Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@school.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading || otpSent}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !name || otpSent}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? '⏳ Sending OTP...' : '📤 Request OTP Code'}
            </button>

            {otpSent && (
              <p className="text-center text-xs text-green-600 font-semibold">
                ✅ OTP sent! Go to Sign In to enter your code.
              </p>
            )}
          </form>

          {/* Info */}
          <div className="mt-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
            <p className="text-xs text-gray-700 font-semibold">
              ℹ️ Enter your email and request the OTP code
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Already have a code?{' '}
              <a href="/teacher-login" className="text-blue-600 hover:text-blue-700 font-bold">
                Sign In →
              </a>
            </p>
            <a href="/" className="text-xs text-purple-600 hover:text-purple-700 font-semibold">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherSignUp;
