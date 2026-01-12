import { useState } from 'react';
import CorrectAnswerAnimation from './CorrectAnswerAnimation';
import CompletionTrophy from './CompletionTrophy';

const ImageVocabularyLearning = ({ 
  words, 
  onComplete, 
  studentName = 'Learner',
  studentAvatar = '🦁',
  listTitle = 'Image Vocabulary'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const currentWord = words[currentIndex];
  const isLastWord = currentIndex === words.length - 1;

  // Helper function to convert image URLs for students
  const getStudentImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's a data URL, use directly
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // For HTTP/HTTPS URLs (including Firebase), use directly
    // Firebase now allows public read access to /vocabulary and /ai-vocabulary paths
    if (imageUrl.startsWith('http')) {
      console.log('Using direct Firebase URL:', imageUrl.substring(0, 100) + '...');
      return imageUrl;
    }
    
    console.log('Invalid image URL format:', imageUrl);
    return null;
  };

  const getOptions = () => {
    if (!currentWord || !words) return [];
    const currentName = currentWord.name || currentWord.word;
    const options = [currentName];
    const otherWords = words
      .filter((w, idx) => idx !== currentIndex)
      .map(w => w.name || w.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    options.push(...otherWords);
    return options.sort(() => Math.random() - 0.5);
  };

  const playPronunciation = () => {
    if (!currentWord) return;
    setPlayingAudio(true);
    const text = currentWord.name || currentWord.word;
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.8;
        utterance.onend = () => setPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.log('Speech synthesis not available:', e);
      setPlayingAudio(false);
    }
  };

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, now + index * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.1);
        osc.start(now + index * 0.15);
        osc.stop(now + index * 0.15 + 0.1);
      });
    } catch (e) {
      console.log('Audio context not available');
    }
  };

  const handleAnswerSelect = (selectedOption) => {
    if (answered) return;
    const correctAnswer = currentWord.name || currentWord.word;
    const isCorrect = selectedOption.toLowerCase() === correctAnswer.toLowerCase();
    
    setFeedback({
      isCorrect,
      message: isCorrect ? '✅ Correct!' : `❌ Wrong! The answer is: ${correctAnswer}`
    });
    
    if (isCorrect) {
      setScore(score + 1);
      setShowCorrectAnimation(true);
      playSuccessSound();
    }
    setAnswered(true);
  };

  const handleNext = () => {
    if (isLastWord) {
      setShowCompletion(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setFeedback(null);
      setShowCorrectAnimation(false);
    }
  };

  if (!currentWord) {
    return <div className="flex items-center justify-center p-8"><p className="text-gray-500">Loading...</p></div>;
  }

  const options = getOptions();
  const imageUrl = currentWord.imageUrl || currentWord.image;
  const displayImageUrl = getStudentImageUrl(imageUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-2 md:p-4">
      <div className="max-w-4xl mx-auto mb-4 md:mb-6">
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl shadow-xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center text-white gap-4">
          <div className="flex items-center gap-2 md:gap-5 w-full md:w-auto">
            <div className="text-4xl md:text-6xl flex-shrink-0">{studentAvatar}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-semibold opacity-90 uppercase tracking-wide">Learning Time!</p>
              <p className="text-lg md:text-2xl font-bold truncate">{listTitle}</p>
              <p className="text-sm md:text-lg opacity-90 font-semibold truncate">Hi, {studentName}! 👋</p>
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            <div className="text-3xl md:text-4xl font-bold">{score}</div>
            <div className="text-xs md:text-sm opacity-90">Points</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-2 md:p-4 lg:p-8">
        <div className="mb-4 md:mb-6">
          <div className="flex justify-between items-center mb-2 text-xs md:text-sm">
            <span className="font-semibold text-gray-700">
              Question {currentIndex + 1} of {words.length}
            </span>
            <span className="font-semibold text-blue-600">
              Progress: {Math.round(((currentIndex + 1) / words.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-3 md:p-6 mb-4 md:mb-8 shadow-lg">
          {displayImageUrl ? (
            <img
              src={displayImageUrl}
              alt={currentWord.name || currentWord.word}
              className="w-full max-h-48 md:max-h-64 object-cover rounded-2xl mb-3 md:mb-4"
              onError={(e) => {
                console.error('Failed to load image from:', displayImageUrl);
                console.error('Image details:', {
                  src: e.target.src,
                  naturalWidth: e.target.naturalWidth,
                  naturalHeight: e.target.naturalHeight
                });
                e.target.style.display = 'none';
              }}
              onLoad={() => console.log('Image loaded successfully:', displayImageUrl.substring(0, 100))}
            />
          ) : (
            <div className="w-full h-48 md:h-64 bg-gray-200 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
              <span className="text-3xl md:text-6xl">🖼️</span>
            </div>
          )}

          <button
            onClick={playPronunciation}
            disabled={playingAudio || answered}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 md:py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-base md:text-lg"
          >
            <span>{playingAudio ? '🔊' : '🔉'}</span>
            {playingAudio ? 'Playing...' : 'Hear Pronunciation'}
          </button>
        </div>

        <div className="text-center mb-6 md:mb-8">
          <p className="text-base md:text-xl font-semibold text-gray-800 mb-2 break-words">
            What is the name of this object?
          </p>
          <p className="text-xs md:text-base text-gray-600">
            (in Bahasa Indonesia)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 md:gap-3 mb-6 md:mb-8">
          {options.map((option, index) => {
            const isCorrect = option === (currentWord.name || currentWord.word);
            let buttonClass = 'bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400';
            
            if (answered && isCorrect) {
              buttonClass = 'bg-green-100 border-2 border-green-500';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={answered}
                className={`p-3 md:p-4 lg:p-5 rounded-xl font-bold text-base md:text-lg lg:text-xl transition-all duration-300 min-h-12 md:min-h-14 ${buttonClass} ${
                  answered ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <span className="flex items-center gap-2 md:gap-3">
                  <span className="text-xl md:text-2xl">
                    {answered && isCorrect ? '✅' : ''}
                  </span>
                  <span className="break-words text-left">{option}</span>
                </span>
              </button>
            );
          })}
        </div>

        {feedback && (
          <div
            className={`p-3 md:p-4 rounded-xl mb-6 md:mb-8 font-semibold text-base md:text-lg ${
              feedback.isCorrect
                ? 'bg-green-100 text-green-800 border-2 border-green-500'
                : 'bg-red-100 text-red-800 border-2 border-red-500'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {answered && (
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 md:py-3 lg:py-4 px-6 md:px-10 lg:px-12 rounded-xl text-base md:text-lg transition-all duration-300 transform hover:scale-105"
            >
              {isLastWord ? '🏆 Complete' : 'Next →'}
            </button>
          </div>
        )}

        {showCorrectAnimation && (
          <CorrectAnswerAnimation onComplete={() => setShowCorrectAnimation(false)} />
        )}
      </div>

      {showCompletion && (
        <CompletionTrophy
          accuracy={Math.round((score / words.length) * 100)}
          timeSpent={0}
          wordCount={words.length}
          onContinue={() => {
            setTimeout(() => {
              onComplete({ score, total: words.length });
            }, 500);
          }}
        />
      )}
    </div>
  );
};

export default ImageVocabularyLearning;
