import { useEffect } from 'react';

export default function CorrectAnswerAnimation({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <style>{`
        @keyframes pop {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }
        
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes pulse-large {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .popup-message {
          animation: pop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        .floating-emoji {
          animation: float-up 1.2s ease-out forwards;
        }
        
        .center-pulse {
          animation: pulse-large 0.6s ease-out;
        }
        
        .spin-ring {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>

      {/* Center large emoji with pulse */}
      <div className="text-9xl center-pulse">✅</div>

      {/* Floating emojis */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute floating-emoji text-5xl"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotate(${(i / 8) * 360}deg) translateX(80px)`,
          }}
        >
          {['⭐', '✨', '🎉', '🌟'][i % 4]}
        </div>
      ))}

      {/* Success message */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-32">
        <div className="popup-message text-center">
          <div className="text-4xl font-black text-green-600 mb-2">
            Perfect!
          </div>
          <div className="text-xl font-bold text-green-500">
            Keep it up! 🚀
          </div>
        </div>
      </div>
    </div>
  );
}
