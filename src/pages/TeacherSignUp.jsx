import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../firebase';

function TeacherSignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email & Password, 2: Request OTP, 3: Verify OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
  const REGION = 'us-central1';
  const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';
  
  const SEND_OTP_URL = isDevelopment 
    ? `http://127.0.0.1:5001/${FIREBASE_PROJECT_ID}/${REGION}/sendOTP`
    : `https://${REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/sendOTP`;
  const VERIFY_OTP_URL = isDevelopment
    ? `http://127.0.0.1:5001/${FIREBASE_PROJECT_ID}/${REGION}/verifyOTP`
    : `https://${REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/verifyOTP`;

  const auth = getAuth();
  const db = getFirestore();

  // Step 1: Validate email and password, then request OTP
  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Request OTP
    setLoading(true);
    try {
      const response = await fetch(SEND_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(2);
        setMessage('📧 OTP sent to your email!');
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

  // Step 2: Verify OTP and create account
  const handleStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      // Verify OTP
      const response = await fetch(VERIFY_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Create teacher account in Firestore
        const teacherRef = doc(db, 'teachers', email.toLowerCase());
        await setDoc(teacherRef, {
          email: email.toLowerCase(),
          password: password, // Note: In production, hash this!
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          status: 'active'
        });

        // Sign in
        await signInWithCustomToken(auth, data.token);
        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('teacherEmail', data.email);

        setMessage('✅ Account created! Redirecting...');
        setTimeout(() => {
          navigate('/teacher');
        }, 1500);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error creating account. Please try again.');
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Register as a teacher</p>
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
              ✅ {message}
            </div>
          )}

          {/* STEP 1: Email & Password */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📧 Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@school.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔐 Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔐 Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password || !confirmPassword}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? '⏳ Sending OTP...' : '📤 Next: Verify Email'}
              </button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/teacher-login" className="text-green-600 hover:text-green-700 font-bold">
                  Sign In →
                </a>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-semibold">
                  📬 Enter the 6-digit code sent to:<br/>
                  <strong className="text-gray-800">{email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔑 Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-3xl font-bold font-mono focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? '⏳ Creating Account...' : '✅ Create Account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setMessage('');
                }}
                disabled={loading}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-lg transition-all"
              >
                ← Change Email/Password
              </button>
            </form>
          )}

          {/* Info */}
          <div className="mt-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
            <p className="text-xs text-gray-700 font-semibold">
              ℹ️ Create your credentials and verify via email
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
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
