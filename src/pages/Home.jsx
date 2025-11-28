import { Link } from 'react-router-dom';
import AnimatedLogo from '../components/AnimatedLogo';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center py-3 md:py-0 px-3 md:px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-3xl w-full relative z-10">
        {/* Animated Logo */}
        <AnimatedLogo />

        {/* Main Heading */}
        <div className="text-center mb-6 md:mb-8 animate-fadeInDown animation-delay-200">
          <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-blue-200 to-purple-300 mb-1 md:mb-2 drop-shadow-lg">
            Bahasa Indonesia Department
          </h1>
          <h2 className="text-lg md:text-2xl font-bold text-white mb-2">
            BINUS School Simprug
          </h2>
          <p className="text-xs md:text-base text-gray-200 flex items-center justify-center gap-1">
            <span className="text-base md:text-xl">✨</span>
            AI powered and personalized learning
            <span className="text-base md:text-xl">✨</span>
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-3 md:gap-5 mb-4 md:mb-6 animate-fadeInUp animation-delay-400">
          {/* Teacher Card - Blue Theme */}
          <Link to="/teacher-login">
            <div className="group relative h-full">
              {/* Gradient Border Animation */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
              
              {/* Card Content */}
              <div className="relative card bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-2xl transition-all cursor-pointer h-full flex flex-col p-4 md:p-5">
                {/* Header with Icon */}
                <div className="text-center mb-3">
                  <div className="text-4xl md:text-5xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    👩‍🏫
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                    For Teachers
                  </h2>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
                </div>

                {/* Description */}
                <p className="text-xs md:text-sm text-gray-700 mb-3 text-center flex-grow">
                  Create vocabulary lists, import students, and track progress
                </p>

                {/* Features */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                    <span className="text-lg md:text-xl">🔐</span>
                    <span className="font-semibold text-xs md:text-sm">Email/Password Login</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                    <span className="text-lg md:text-xl">📋</span>
                    <span className="font-semibold text-xs md:text-sm">Import student names</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                    <span className="text-lg md:text-xl">⚡</span>
                    <span className="font-semibold text-xs md:text-sm">Auto-generate codes</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-4 pt-3 border-t-2 border-blue-200 space-y-1.5">
                  <Link to="/teacher-login" className="block">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-2 px-3 rounded-lg text-xs shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                      ✅ Sign In
                    </button>
                  </Link>
                  <Link to="/teacher-login" className="block">
                    <button className="w-full bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 text-blue-700 font-bold py-2 px-3 rounded-lg text-xs shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-blue-300">
                      📝 Create Account
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </Link>

          {/* Student Card - Purple/Pink Theme */}
          <Link to="/student">
            <div className="group relative h-full">
              {/* Gradient Border Animation */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
              
              {/* Card Content */}
              <div className="relative card bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-2xl transition-all cursor-pointer h-full flex flex-col p-4 md:p-5">
                {/* Header with Icon */}
                <div className="text-center mb-3">
                  <div className="text-4xl md:text-5xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    👦
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                    For Students
                  </h2>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
                </div>

                {/* Description */}
                <p className="text-xs md:text-sm text-gray-700 mb-3 text-center flex-grow">
                  Learn vocabulary with drag-and-drop fun and earn rewards!
                </p>

                {/* Features */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition">
                    <span className="text-lg md:text-xl">🎯</span>
                    <span className="font-semibold text-xs md:text-sm">Enter your code</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition">
                    <span className="text-lg md:text-xl">✋</span>
                    <span className="font-semibold text-xs md:text-sm">Drag and match syllables</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition">
                    <span className="text-lg md:text-xl">⭐</span>
                    <span className="font-semibold text-xs md:text-sm">Earn stars and badges</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-4">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-3 rounded-lg text-xs shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1">
                    🚀 Start Learning
                  </button>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
