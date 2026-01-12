import { useState, useEffect } from 'react';

export default function CompletionTrophy({ accuracy, timeSpent, wordCount, onContinue }) {
  const [trophy, setTrophy] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [celebration, setCelebration] = useState(false);

  useEffect(() => {
    // Determine trophy level based on accuracy
    if (accuracy >= 90) {
      setTrophy('gold');
    } else if (accuracy >= 70) {
      setTrophy('silver');
    } else {
      setTrophy('bronze');
    }

    // Play drum roll sound
    playDrumRoll();

    // Start animation after component mounts
    setTimeout(() => setShowAnimation(true), 300);
    setTimeout(() => setCelebration(true), 800);
  }, [accuracy]);

  const playDrumRoll = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      
      // Drum roll effect - rapid low frequencies
      for (let i = 0; i < 8; i++) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = 150 + i * 20; // Vary frequency slightly
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.15, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.04);
        
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.04);
      }
      
      // Final cymbal crash sound
      setTimeout(() => {
        const cymbal = audioContext.createOscillator();
        const cymbalGain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        cymbal.connect(filter);
        filter.connect(cymbalGain);
        cymbalGain.connect(audioContext.destination);
        
        cymbal.frequency.setValueAtTime(400, audioContext.currentTime);
        cymbal.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
        cymbal.type = 'triangle';
        
        cymbalGain.gain.setValueAtTime(0.3, audioContext.currentTime);
        cymbalGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        
        cymbal.start(audioContext.currentTime);
        cymbal.stop(audioContext.currentTime + 0.3);
      }, 400);
    } catch (e) {
      console.log('Audio context not available');
    }
  };

  const getTrophyInfo = () => {
    switch (trophy) {
      case 'gold':
        return {
          emoji: '🏆',
          title: 'Perfect! Gold Medal!',
          color: 'from-yellow-400 to-yellow-600',
          message: 'Outstanding performance! You got it all correct!',
          stars: 3
        };
      case 'silver':
        return {
          emoji: '🥈',
          title: 'Great! Silver Medal!',
          color: 'from-gray-300 to-gray-400',
          message: 'Excellent work! Keep practicing to get Gold!',
          stars: 2
        };
      default:
        return {
          emoji: '🥉',
          title: 'Good Try! Bronze Medal',
          color: 'from-orange-400 to-orange-600',
          message: 'Good effort! Try again to improve your score!',
          stars: 1
        };
    }
  };

  const info = getTrophyInfo();

  const Confetti = () => {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {celebration && [...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute font-bold"
            style={{
              left: Math.random() * 100 + '%',
              top: -20,
              fontSize: Math.random() * 20 + 16 + 'px',
              animation: `fall ${2.5 + Math.random() * 1.5}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
              animationDelay: Math.random() * 0.8 + 's',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {['🎉', '🎊', '⭐', '✨', '🌟', '🎈', '🎆', '🎇'][Math.floor(Math.random() * 8)]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-hidden">
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes bounce-scale {
          0% { transform: scale(0) rotate(-180deg); }
          50% { transform: scale(1.3) rotate(10deg); }
          75% { transform: scale(0.95) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,0,0,0.1), 0 0 30px rgba(255,215,0,0.3); }
          50% { box-shadow: 0 0 40px rgba(0,0,0,0.3), 0 0 60px rgba(255,215,0,0.6); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2deg); }
          75% { transform: rotate(-2deg); }
        }
        .trophy-bounce {
          animation: bounce-scale 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .trophy-glow {
          animation: pulse-glow 0.8s ease-in-out infinite, shake 0.5s ease-in-out infinite;
        }
          animation: bounce-scale 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .trophy-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .star-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>

      <Confetti />

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        {/* Trophy Container */}
        <div className={`text-center transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          {/* Trophy Emoji */}
          <div className={`text-8xl mb-6 trophy-${showAnimation ? 'bounce' : ''} ${celebration ? 'trophy-glow' : ''}`}>
            {info.emoji}
          </div>

          {/* Title */}
          <h1 className={`text-4xl font-bold mb-4 bg-gradient-to-r ${info.color} bg-clip-text text-transparent`}>
            {info.title}
          </h1>

          {/* Message */}
          <p className="text-xl text-gray-700 mb-8">{info.message}</p>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-blue-200">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center border-l border-r border-gray-300">
                <div className="text-3xl font-bold text-purple-600">{wordCount}</div>
                <div className="text-sm text-gray-600">Words</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{timeSpent}s</div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className={`text-3xl ${i < info.stars ? 'star-shimmer' : 'text-gray-300'}`}
                  style={{
                    animationDelay: i < info.stars ? `${i * 0.2}s` : '0s'
                  }}
                >
                  ⭐
                </span>
              ))}
            </div>

            {/* Achievement Text */}
            <div className="text-sm font-semibold text-gray-700">
              {info.stars === 3
                ? '🎯 Perfect Score!'
                : info.stars === 2
                ? '✨ Excellent Performance'
                : '💪 Keep Practicing!'}
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span className="text-lg">🚀 Continue Learning</span>
          </button>

          {/* Motivational Message */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {accuracy >= 90 ? (
              <p>🌟 You're a superstar! Keep up the amazing work!</p>
            ) : accuracy >= 70 ? (
              <p>💪 Great job! Practice a little more to reach Gold!</p>
            ) : (
              <p>📚 Try again and you'll improve your score!</p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {!showAnimation && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 mt-4">Calculating your amazing performance...</p>
          </div>
        )}
      </div>
    </div>
  );
}
