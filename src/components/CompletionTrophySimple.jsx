import { useEffect, useState } from 'react';

export default function CompletionTrophy({ accuracy, timeSpent, wordCount, onContinue }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  const getTrophyInfo = () => {
    if (accuracy >= 90) {
      return {
        emoji: '🏆',
        title: 'Perfect! Gold Medal!',
        color: 'bg-yellow-100 border-yellow-400'
      };
    } else if (accuracy >= 70) {
      return {
        emoji: '🥈',
        title: 'Great! Silver Medal!',
        color: 'bg-gray-100 border-gray-400'
      };
    } else {
      return {
        emoji: '🥉',
        title: 'Good Try! Bronze Medal!',
        color: 'bg-orange-100 border-orange-400'
      };
    }
  };

  const info = getTrophyInfo();

  if (!showContent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`${info.color} border-2 rounded-2xl p-6 w-full max-w-sm text-center animate-bounce`}>
        <div className="text-6xl mb-3">{info.emoji}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{info.title}</h2>
        <p className="text-sm text-gray-700 mb-4">{wordCount} questions completed! 🎯</p>
        
        <button
          onClick={() => {
            console.log('Continue button clicked');
            onContinue && onContinue();
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all mb-3"
        >
          ✅ Continue Learning
        </button>
      </div>
    </div>
  );
}
