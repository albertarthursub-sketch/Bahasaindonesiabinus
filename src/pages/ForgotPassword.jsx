import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

function ForgotPassword() {
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      setMessage('✅ Password reset email sent! Check your email for a link to reset your password.');
      setTimeout(() => {
        navigate('/teacher-login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else {
        setError(err.message || 'Failed to send reset email');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white text-center">
            <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
            <p className="text-sm opacity-90">Enter your email to reset</p>
          </div>

          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm font-semibold">
                ❌ {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="mb-3 p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm font-semibold">
                ✅ {message}
              </div>
            )}

            {/* Reset Form */}
            {!emailSent ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 rounded-lg text-sm transition-all"
                >
                  {loading ? '⏳ Sending...' : '📤 Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-700 font-semibold text-sm">
                  ✅ Check your email for the reset link. Redirecting to login...
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="mt-4 bg-blue-50 border border-blue-300 rounded-lg p-3">
              <p className="text-xs text-gray-700 font-semibold">
                ℹ️ We'll send a password reset link to your email
              </p>
            </div>

            {/* Back to Login */}
            <div className="mt-4 text-center">
              <a href="/teacher-login" className="text-xs text-purple-600 hover:text-purple-700 font-semibold">
                ← Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
