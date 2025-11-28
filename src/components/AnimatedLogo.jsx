import React from 'react';

function AnimatedLogo() {
  return (
    <div className="mb-8 md:mb-12 animate-fadeInDown animation-delay-100">
      {/* Logo Container with Float Animation */}
      <div className="flex justify-center">
        <div className="relative animate-float">
          {/* Outer Glow Circle */}
          <div className="absolute -inset-4 bg-gradient-to-br from-yellow-300 via-purple-400 to-pink-400 rounded-full opacity-30 blur-xl animate-pulse" style={{ animationDelay: '0s' }}></div>
          
          {/* Logo Image */}
          <div className="relative">
            <img
              src="/Logo-BINUS.png"
              alt="BINUS Logo"
              className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 filter drop-shadow-2xl transform hover:scale-110 transition-transform duration-300"
            />
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 animate-shimmer"></div>
        </div>
      </div>

      {/* Subtitle */}
      <div className="text-center mt-4">
        <p className="text-sm md:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-300 animate-pulse">
          ✨ Bahasa Indonesia Department ✨
        </p>
      </div>

      {/* Decorative Line */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-yellow-300"></div>
        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
        <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-purple-300"></div>
      </div>
    </div>
  );
}

export default AnimatedLogo;
