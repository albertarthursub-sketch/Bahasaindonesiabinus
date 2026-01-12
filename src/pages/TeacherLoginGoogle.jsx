import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, GoogleAuthProvider, OAuthProvider, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

function TeacherLoginGoogle() {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const googleProvider = new GoogleAuthProvider();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

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

    if (!name || name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }

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
        name: name,
        createdAt: new Date(),
        lastLogin: new Date(),
        status: 'active',
        emailVerified: false
      });

      sessionStorage.setItem('authToken', user.uid);
      sessionStorage.setItem('teacherEmail', user.email);
      sessionStorage.setItem('teacherName', name);

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
      sessionStorage.setItem('teacherEmail', user.email);      // Store teacher name if available
      if (user.displayName) {
        sessionStorage.setItem('teacherName', user.displayName);
      }
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

  // Microsoft Sign In
  const handleMicrosoftSignIn = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const microsoftProvider = new OAuthProvider('microsoft.com');
      microsoftProvider.addScopes('mail.read', 'profile');
      
      let result;
      
      try {
        // Try popup first (works on desktop and most tablets)
        result = await signInWithPopup(auth, microsoftProvider);
      } catch (popupError) {
        // If popup is blocked, try redirect instead (better for mobile/Safari)
        console.warn('Pop-up blocked or failed, using redirect:', popupError.code);
        
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message?.includes('popup')) {
          setMessage('Opening Microsoft login page...');
          await signInWithRedirect(auth, microsoftProvider);
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
          emailVerified: user.emailVerified,
          provider: 'microsoft'
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
      if (user.displayName) {
        sessionStorage.setItem('teacherName', user.displayName);
      }

      setMessage('✅ Microsoft login successful! Redirecting...');
      setTimeout(() => {
        navigate('/teacher');
      }, 1000);
    } catch (err) {
      console.error('Microsoft sign in error:', err);
      setError(err.message || 'Microsoft sign in failed. Please try again or use email login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isSignUp ? handleSignUp : handleLogin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isSignUp ? 'Teacher Sign Up' : 'Teacher Login'}
            </h1>
            <p className="text-gray-600">
              {isSignUp ? 'Create your account' : 'Access your dashboard'}
            </p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name - Only show on sign up */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  👤 Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📧 Email Address
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

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                🔑 Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Min 6 characters' : 'Your password'}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (isSignUp && (!name || !email || !password))}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? '⏳ Processing...' : isSignUp ? '✅ Create Account' : '✅ Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 disabled:bg-gray-100 disabled:border-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{isSignUp ? 'Sign up with Google' : 'Login with Google'}</span>
          </button>

          {/* Microsoft Sign In Button */}
          <button
            onClick={handleMicrosoftSignIn}
            disabled={loading}
            className="w-full mt-3 flex items-center justify-center gap-3 bg-blue-50 border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-100 disabled:bg-gray-100 disabled:border-gray-200 text-blue-900 font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <rect fill="#0078D4" x="1" y="1" width="10" height="10"/>
              <rect fill="#50E6FF" x="13" y="1" width="10" height="10"/>
              <rect fill="#FFB900" x="1" y="13" width="10" height="10"/>
              <rect fill="#F25022" x="13" y="13" width="10" height="10"/>
            </svg>
            <span>{isSignUp ? 'Sign up with Microsoft' : 'Login with Microsoft'}</span>
          </button>

          {/* Toggle Sign Up / Login */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-3">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setMessage('');
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-purple-600 hover:text-purple-700 font-bold text-sm"
            >
              {isSignUp ? 'Login here' : 'Sign up here'}
            </button>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a href="/" className="text-xs text-gray-500 hover:text-gray-700">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherLoginGoogle;
