import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { firebaseConfig } from '../firebase';

function TeacherAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Firebase Cloud Functions URLs
  const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
  const REGION = 'us-central1';
  
  // Use local emulator in development, production URLs in production
  const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';
  const SEND_OTP_URL = isDevelopment 
    ? `http://127.0.0.1:5001/${FIREBASE_PROJECT_ID}/${REGION}/sendOTP`
    : `https://${REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/sendOTP`;
  const VERIFY_OTP_URL = isDevelopment
    ? `http://127.0.0.1:5001/${FIREBASE_PROJECT_ID}/${REGION}/verifyOTP`
    : `https://${REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/verifyOTP`;

  const auth = getAuth();

  // Login with email and OTP
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(VERIFY_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await signInWithCustomToken(auth, data.token);
        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('teacherEmail', data.email);
        
        setMessage('✅ Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/teacher');
        }, 1000);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error: Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Login</h1>
            <p className="text-gray-600">Enter name and OTP code</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 font-semibold">
              ❌ {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg text-green-700 font-semibold">
              ✅ {message}
            </div>
          )}

          {/* Login Form - Name and OTP */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Box */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📧 Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@school.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* OTP Code Box */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                🔑 Enter OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-3xl font-bold font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">6-digit code from your email</p>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !email || !otp}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? '⏳ Logging in...' : '✅ Login'}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
            <p className="text-xs text-gray-700 font-semibold">
              ℹ️ Enter your email and the 6-digit code you received
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Need an OTP code?{' '}
              <a href="/teacher-signup" className="text-green-600 hover:text-green-700 font-bold">
                Request One →
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

export default TeacherAuth;
