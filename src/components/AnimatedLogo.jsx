import React from 'react';

function AnimatedLogo() {
  return (
    <div className="mb-8 md:mb-12 animate-fadeInDown animation-delay-100">
      {/* Logo Container with Float Animation */}
      <div className="flex justify-center">
        <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 animate-float">
          {/* Outer Glow Circle */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-purple-400 to-pink-400 rounded-full opacity-0 animate-pulse" style={{ animationDelay: '0s' }}></div>
          
          {/* Logo Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl hover:shadow-purple-500/50 transition-shadow duration-500">
            {/* Butterfly SVG Logo */}
            <svg
              viewBox="0 0 100 100"
              className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 filter drop-shadow-lg transform hover:scale-110 transition-transform duration-300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left Upper Wing */}
              <ellipse cx="35" cy="30" rx="18" ry="24" fill="#ffffff" opacity="0.95" />
              
              {/* Right Upper Wing */}
              <ellipse cx="65" cy="30" rx="18" ry="24" fill="#ffffff" opacity="0.95" />
              
              {/* Left Lower Wing */}
              <ellipse cx="32" cy="65" rx="14" ry="18" fill="#f0f0f0" opacity="0.9" />
              
              {/* Right Lower Wing */}
              <ellipse cx="68" cy="65" rx="14" ry="18" fill="#f0f0f0" opacity="0.9" />
              
              {/* Body Circle */}
              <circle cx="50" cy="35" r="10" fill="#ffffff" opacity="0.95" />
              
              {/* Body Segment */}
              <circle cx="50" cy="58" r="7" fill="#ffffff" opacity="0.95" />
              
              {/* Antennae Left */}
              <path
                d="M 45 25 Q 38 18 35 12"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.9"
              />
              
              {/* Antennae Right */}
              <path
                d="M 55 25 Q 62 18 65 12"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.9"
              />
              
              {/* Decorative Circle */}
              <circle cx="50" cy="50" r="35" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" />
              
              {/* Wing Patterns */}
              <circle cx="35" cy="28" r="4" fill="#f0f0f0" opacity="0.7" />
              <circle cx="65" cy="28" r="4" fill="#f0f0f0" opacity="0.7" />
              <circle cx="32" cy="65" r="3" fill="#e0e0e0" opacity="0.6" />
              <circle cx="68" cy="65" r="3" fill="#e0e0e0" opacity="0.6" />
            </svg>
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 animate-shimmer"></div>
        </div>
      </div>

      {/* Subtitle */}
      <div className="text-center mt-4">
        <p className="text-sm md:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-300 animate-pulse">
          🦋 Bahasa Learning Platform 🦋
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
