import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

function AdminLogin() {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is admin
      const adminRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        await auth.signOut();
        setError('You do not have admin access');
        return;
      }

      if (adminSnap.data().status === 'inactive') {
        await auth.signOut();
        setError('Your admin account has been deactivated');
        return;
      }

      sessionStorage.setItem('adminEmail', user.email);
      sessionStorage.setItem('adminId', user.uid);
      navigate('/admin-dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Admin account not found');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-6 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">🔐 Admin Access</h1>
            <p className="text-sm opacity-90">Dashboard Management Portal</p>
          </div>

          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm font-semibold">
                ❌ {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 text-lg"
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 rounded-lg text-sm transition-all mt-6"
              >
                {loading ? '⏳ Logging in...' : '🔓 Login to Dashboard'}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-300 rounded-lg p-3">
              <p className="text-xs text-gray-700 font-semibold">
                ⚠️ Admin access only. Unauthorized access is prohibited.
              </p>
            </div>

            {/* Back Link */}
            <div className="mt-4 text-center">
              <a href="/" className="text-xs text-slate-600 hover:text-slate-700 font-semibold">
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
