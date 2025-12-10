import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

function TeacherLoginGoogle() {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const googleProvider = new GoogleAuthProvider();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Simple Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified
      if (!user.emailVerified) {
        setError('❌ Please verify your email before logging in. Check your email for verification link.');
        setLoading(false);
        return;
      }
      
      // Get teacher document from Firestore
      const teacherRef = doc(db, 'teachers', user.uid);
      const teacherSnap = await getDoc(teacherRef);

      if (teacherSnap.exists()) {
        // Teacher exists - update last login
        await setDoc(teacherRef, {
          lastLogin: new Date(),
          status: 'active',
          emailVerified: true
        }, { merge: true });
        
        sessionStorage.setItem('authToken', user.uid);
        sessionStorage.setItem('teacherEmail', user.email);
        
        setMessage('✅ Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/teacher');
        }, 1000);
      } else {
        setError('Teacher profile not found. Please sign up first.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);

      // Create teacher record in Firestore
      await setDoc(doc(db, 'teachers', user.uid), {
        email: user.email,
        createdAt: new Date(),
        lastLogin: new Date(),
        status: 'active',
        emailVerified: false
      });

      sessionStorage.setItem('authToken', user.uid);
      sessionStorage.setItem('teacherEmail', user.email);

      setMessage('✅ Account created! Please check your email to verify your account before logging in.');
      setTimeout(() => {
        setIsSignUp(false);
        setEmail('');
        setPassword('');
      }, 3000);
    } catch (err) {
      console.error('Sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered. Please login instead.');
      } else {
        setError(err.message || 'Sign up failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      let result;
      
      try {
        // Try popup first (works on desktop and most tablets)
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError) {
        // If popup is blocked, try redirect instead (better for mobile/Safari)
        console.warn('Pop-up blocked or failed, using redirect:', popupError.code);
        
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message?.includes('popup')) {
          setMessage('Opening login page...');
          await signInWithRedirect(auth, googleProvider);
          return; // Redirect will handle the rest
        } else {
          throw popupError; // Re-throw other errors
        }
      }

      const user = result.user;

      // Create or get teacher document
      const teacherRef = doc(db, 'teachers', user.uid);
      const teacherSnap = await getDoc(teacherRef);

      if (!teacherSnap.exists()) {
        // New user - create teacher record
        await setDoc(teacherRef, {
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date(),
          lastLogin: new Date(),
          status: 'active',
          emailVerified: user.emailVerified
        });
      } else {
        // Existing user - update last login
        await setDoc(teacherRef, {
          lastLogin: new Date(),
          status: 'active',
          emailVerified: user.emailVerified
        }, { merge: true });
      }

      sessionStorage.setItem('authToken', user.uid);
      sessionStorage.setItem('teacherEmail', user.email);

      setMessage('✅ Google login successful! Redirecting...');
      setTimeout(() => {
        navigate('/teacher');
      }, 1000);
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err.message || 'Google sign in failed. Please try again or use email login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isSignUp ? handleSignUp : handleLogin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white text-center">
            <h1 className="text-2xl font-bold mb-1">
              {isSignUp ? '📝 Sign Up' : '🔐 Login'}
            </h1>
            <p className="text-sm opacity-90">
              {isSignUp ? 'Create your account' : 'Access your dashboard'}
            </p>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email
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
                    placeholder={isSignUp ? 'Min 6 chars' : 'Enter password'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
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
                {isSignUp && (
                  <p className="text-xs text-gray-500 mt-0.5">Min 6 characters</p>
                )}
              </div>

              {/* Forgot Password Link (Login only) */}
              {!isSignUp && (
                <div className="text-right">
                  <a href="/forgot-password" className="text-xs text-purple-600 hover:text-purple-700 font-semibold">
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 rounded-lg text-sm transition-all"
              >
                {loading ? '⏳ Processing...' : isSignUp ? '✅ Sign Up' : '✅ Login'}
              </button>
            </form>

            {/* Google Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-50 border border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg text-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            {/* Toggle Sign Up / Login */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-600 mb-2">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setMessage('');
                  setShowPassword(false);
                }}
                className="text-purple-600 hover:text-purple-700 font-bold text-xs"
              >
                {isSignUp ? 'Login' : 'Sign up'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 text-center border-t">
            <a href="/" className="text-xs text-gray-500 hover:text-gray-700 font-semibold">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherLoginGoogle;
