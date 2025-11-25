import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { firebaseConfig } from '../firebase';

function TeacherAuth() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP verification
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mockMode, setMockMode] = useState(false);

  // Firebase Cloud Functions URLs (replace with your project ID)
  const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
  const REGION = 'us-central1';
  const SEND_OTP_URL = `https://${REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/sendOTP`;
  const VERIFY_OTP_URL = `https://${REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/verifyOTP`;

  const auth = getAuth();

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(SEND_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMockMode(data.mockMode);
        setStep(2);
        setMessage(data.mockMode ? '📧 Mock mode: Use OTP 123456' : '📧 Check your email for the OTP code');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error: Unable to send OTP. Make sure Cloud Functions are deployed.');
      console.error('Send OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and login
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
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
        // Sign in with custom token from Cloud Function
        await signInWithCustomToken(auth, data.token);
        
        // Store email and custom token in session storage
        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('teacherEmail', data.email);
        
        setMessage('✅ Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/teacher');
        }, 1000);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error: Unable to verify OTP. Make sure Cloud Functions are deployed.');
      console.error('Verify OTP error:', err);
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Portal</h1>
            <p className="text-gray-600">Secure Login with OTP</p>
          </div>

          {step === 1 ? (
            // Step 1: Email Input
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📧 Your Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none font-medium"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">We'll send a one-time code to your email</p>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg font-semibold">
                  ❌ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {loading ? '⏳ Sending...' : '📤 Send OTP Code'}
              </button>

              <p className="text-center text-xs text-gray-500">
                No registration needed - just enter your email!
              </p>
            </form>
          ) : (
            // Step 2: OTP Verification
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Code sent to:</p>
                <p className="font-bold text-gray-800 text-lg">{email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🔑 Enter OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none font-bold text-2xl text-center tracking-widest"
                  disabled={loading}
                  autoFocus
                />
                {mockMode && (
                  <p className="text-xs text-blue-600 mt-2 font-semibold">💡 Mock mode: Use 123456</p>
                )}
              </div>

              {message && (
                <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 px-4 py-3 rounded-lg font-semibold">
                  ℹ️ {message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg font-semibold">
                  ❌ {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                    setMessage('');
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-lg transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {loading ? '⏳ Verifying...' : '✅ Login'}
                </button>
              </div>

              <p className="text-center text-xs text-gray-500">
                Didn't receive the code? Check your spam folder or resend.
              </p>
            </form>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
            <p className="text-xs text-gray-700 font-semibold">
              ℹ️ <strong>One-time passwords expire in 10 minutes.</strong> For security, each code can only be used once.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-purple-600 hover:text-purple-700 font-semibold">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherAuth;
