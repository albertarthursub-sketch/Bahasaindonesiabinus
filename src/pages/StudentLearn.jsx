import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { saveStudentProgress } from '../lib/firebaseStorage';
import ImageVocabularyLearning from '../components/ImageVocabularyLearning';
import CompletionTrophy from '../components/CompletionTrophy';
import CorrectAnswerAnimation from '../components/CorrectAnswerAnimation';

// Success sounds and messages
const SUCCESS_MESSAGES = [
  '🎉 Amazing!',
  '🔥 You got it!',
  '⭐ Brilliant!',
  '🚀 Fantastic!',
  '💯 Perfect!',
  '🌟 Awesome!',
  '👏 Well done!',
  '🎊 Superb!',
  '🏆 Champion!',
  '✨ Excellent!'
];

const playSuccessSound = () => {
  // Create a fun "ding" sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Create 3-note ascending melody
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 - happy chord
    
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

const playCelebrationMusic = () => {
  // Create a celebratory fanfare using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Celebratory fanfare: G major scale upward
    const fanfareNotes = [
      { freq: 392, duration: 0.2 },   // G4
      { freq: 493.88, duration: 0.2 }, // B4
      { freq: 587.33, duration: 0.2 }, // D5
      { freq: 783.99, duration: 0.3 }, // G5
      { freq: 880, duration: 0.4 },    // A5 (long hold for effect)
    ];
    
    let startTime = now;
    fanfareNotes.forEach((note) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = note.freq;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
      
      osc.start(startTime);
      osc.stop(startTime + note.duration);
      
      startTime += note.duration;
    });
  } catch (e) {
    console.log('Audio context not available');
  }
};

function StudentLearn() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [list, setList] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stars, setStars] = useState(0);
  
  const [availableSyllables, setAvailableSyllables] = useState([]);
  const [placedSyllables, setPlacedSyllables] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [selectedSyllable, setSelectedSyllable] = useState(null);
  const [completionTime, setCompletionTime] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    const studentData = sessionStorage.getItem('student');
    if (!studentData) {
      navigate('/student');
      return;
    }
    setStudent(JSON.parse(studentData));
    loadList();
  }, [listId]);

  useEffect(() => {
    if (list && list.words && list.words[currentIndex]) {
      initializeSyllables();
    }
  }, [list, currentIndex]);

  useEffect(() => {
    if (showCompletion) {
      // Play celebration music when completion screen appears
      playCelebrationMusic();
    }
  }, [showCompletion]);

  const loadList = async () => {
    const docRef = doc(db, 'lists', listId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      setList({ id: docSnap.id, ...docSnap.data() });
      setStartTime(Date.now());
    } else {
      alert('List not found!');
      navigate('/student');
    }
  };

  const initializeSyllables = () => {
    const word = list.words[currentIndex];
    
    // Handle syllables as either string or array
    let syllables = [];
    if (Array.isArray(word.syllables)) {
      syllables = word.syllables;
    } else if (typeof word.syllables === 'string') {
      syllables = word.syllables.split('-');
    }
    
    const shuffled = [...syllables]
      .map(s => ({ text: s, id: Math.random() }))
      .sort(() => Math.random() - 0.5);
    
    setAvailableSyllables(shuffled);
    setPlacedSyllables([]);
    setFeedback(null);
  };

  const playAudio = (text) => {
    const word = list.words[currentIndex];
    
    // If teacher recorded pronunciation, play that first
    if (word.pronunciation) {
      const audio = new Audio(word.pronunciation);
      audio.play().catch(() => {
        // Fallback to speech synthesis if audio playback fails
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      });
    } else {
      // Use speech synthesis as fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const handleDragStart = (e, syllable, from) => {
    e.dataTransfer.setData('syllable', JSON.stringify(syllable));
    e.dataTransfer.setData('from', from);
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    const syllable = JSON.parse(e.dataTransfer.getData('syllable'));
    const from = e.dataTransfer.getData('from');

    if (target === 'placed' && from === 'available') {
      setPlacedSyllables([...placedSyllables, syllable]);
      setAvailableSyllables(availableSyllables.filter(s => s.id !== syllable.id));
    } else if (target === 'available' && from === 'placed') {
      setAvailableSyllables([...availableSyllables, syllable]);
      setPlacedSyllables(placedSyllables.filter(s => s.id !== syllable.id));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeSyllable = (syllable) => {
    setPlacedSyllables(placedSyllables.filter(s => s.id !== syllable.id));
    setAvailableSyllables([...availableSyllables, syllable]);
  };

  const handleSyllableTap = (syllable, from) => {
    if (from === 'available') {
      // Move from available to placed
      setPlacedSyllables([...placedSyllables, syllable]);
      setAvailableSyllables(availableSyllables.filter(s => s.id !== syllable.id));
    } else if (from === 'placed') {
      // Move from placed back to available
      removeSyllable(syllable);
    }
    setSelectedSyllable(null);
  };

  const checkAnswer = async () => {
    const word = list.words[currentIndex];
    const userAnswer = placedSyllables.map(s => s.text).join('');
    
    // Handle syllables as either string or array
    let syllablesStr = '';
    if (Array.isArray(word.syllables)) {
      syllablesStr = word.syllables.join('');
    } else {
      syllablesStr = word.syllables.replace(/-/g, '');
    }
    
    const correct = userAnswer === syllablesStr;

    if (correct) {
      const earnedStars = 3;
      setStars(stars + earnedStars);
      const randomMessage = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
      setFeedback({ correct: true, stars: earnedStars, message: randomMessage });
      setShowCorrectAnimation(true);
      
      playSuccessSound();
      playAudio(word.word || word.bahasa);
      
      if (student) {
        try {
          await saveStudentProgress(student.id, list.id, word.word || word.bahasa, {
            translation: word.translation || word.english,
            syllables: word.syllables,
            correct: true,
            studentAnswer: userAnswer,
            starsEarned: earnedStars
          });
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      }
    } else {
      setFeedback({ correct: false });
      
      if (student) {
        try {
          await saveStudentProgress(student.id, list.id, word.bahasa, {
            english: word.english,
            syllables: word.syllables,
            correct: false,
            studentAnswer: userAnswer,
            starsEarned: 0
          });
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      }
    }
  };

  const nextWord = () => {
    if (currentIndex < list.words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
      setCompletionTime(timeElapsed);
      setShowCompletion(true);
    }
  };

  if (!list || !list.words || list.words.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Route based on learning mode
  if (list.mode === 'image-vocabulary') {
    return (
      <ImageVocabularyLearning 
        words={list.words} 
        studentName={student?.name}
        studentAvatar={student?.avatar}
        listTitle={list.title}
        onComplete={() => {
          navigate('/student');
        }}
      />
    );
  }

  const currentWord = list.words[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl shadow-xl p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-5">
            <div className="text-8xl animate-bounce" style={{animationDelay: '0s'}}>
              {student?.avatar || '🦁'}
            </div>
            <div>
              <p className="text-sm font-semibold opacity-90 uppercase tracking-wide">Learning Time!</p>
              <p className="text-3xl font-bold">
                Word {currentIndex + 1} of {list.words.length}
              </p>
              <p className="text-lg opacity-90 font-semibold">Hi, {student?.name}! 👋</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl animate-spin" style={{animationDuration: '3s'}}>
              ⭐
            </div>
            <div className="text-4xl font-bold mt-2 animate-bounce">
              {stars}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="card">
          {/* Display Image if Available */}
          <div className="mb-6 flex justify-center">
            {currentWord.imageUrl ? (
              <img 
                src={currentWord.imageUrl} 
                alt={currentWord.word} 
                className="max-h-80 max-w-full object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg flex items-center justify-center text-6xl">
                📚
              </div>
            )}
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">Translation:</p>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              {currentWord.translation || currentWord.english}
            </h2>
            
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => playAudio(currentWord.word || currentWord.bahasa)}
                className={`btn ${currentWord.pronunciation ? 'btn-purple' : 'btn-blue'}`}
              >
                🔊 Hear Bahasa Indonesia {currentWord.pronunciation && '⭐'}
              </button>
              
              {/* Display Audio Player if Teacher Recorded */}
              {currentWord.audioUrl && (
                <audio 
                  controls 
                  className="w-full max-w-xs h-8"
                  src={currentWord.audioUrl}
                />
              )}
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6 text-center">
            <p className="font-semibold text-blue-800">
              ✨ TAP syllables to arrange them! (Works on iPad & phones)
            </p>
          </div>

          {/* Answer Area - TAP TO ADD */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-gray-700">📍 Your Answer:</p>
              <button
                onClick={() => {
                  setPlacedSyllables([]);
                  setAvailableSyllables(availableSyllables.map(s => s).concat(placedSyllables));
                }}
                className="text-sm text-red-500 hover:text-red-700 font-semibold"
              >
                Clear All
              </button>
            </div>
            <div className="min-h-32 border-4 border-dashed border-blue-400 rounded-lg p-4 bg-white flex flex-wrap gap-3 content-start items-start">
              {placedSyllables.length === 0 ? (
                <p className="text-gray-400 text-center w-full py-8">Tap syllables below ↓</p>
              ) : (
                placedSyllables.map((syllable, index) => (
                  <button
                    key={syllable.id}
                    onClick={() => handleSyllableTap(syllable, 'placed')}
                    className="syllable syllable-placed text-2xl font-bold cursor-pointer hover:bg-red-100 active:scale-95 transition-all px-6 py-4 rounded-lg"
                  >
                    {syllable.text} ✕
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Available Syllables - TAP TO SELECT */}
          <div className="mb-6">
            <p className="font-semibold text-gray-700 mb-3">✨ Available Syllables (Tap to add):</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {availableSyllables.map(syllable => (
                <button
                  key={syllable.id}
                  onClick={() => handleSyllableTap(syllable, 'available')}
                  className="syllable syllable-available text-3xl font-bold cursor-pointer hover:scale-110 active:scale-95 transition-all py-6 px-6 rounded-lg shadow-md hover:shadow-lg"
                >
                  {syllable.text}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={initializeSyllables}
              className="btn btn-gray flex-1"
            >
              🔄 Reset
            </button>
            <button
              onClick={checkAnswer}
              disabled={placedSyllables.length === 0}
              className="btn btn-green flex-1"
            >
              ✓ Check Answer
            </button>
          </div>

          {showCorrectAnimation && (
            <CorrectAnswerAnimation onComplete={() => setShowCorrectAnimation(false)} />
          )}

          {feedback && (
            <div
              className={`p-8 rounded-2xl text-center shadow-2xl ${
                feedback.correct
                  ? 'bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 border-4 border-green-400'
                  : 'bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-yellow-400'
              }`}
              style={feedback.correct ? {animation: 'pulse 0.4s ease-in-out 2'} : {}}
            >
              {feedback.correct && (
                <div className="mb-6 text-6xl flex justify-center gap-4">
                  {['🎉', '✨', '🎊'].map((emoji, i) => (
                    <span key={i} className="inline-block animate-bounce" style={{animationDelay: `${i * 0.15}s`}}>{emoji}</span>
                  ))}
                </div>
              )}
              <div className={`text-8xl mb-4 inline-block ${feedback.correct ? 'animate-spin' : 'animate-pulse'}`} style={{animationDuration: feedback.correct ? '0.6s' : '1s'}}>
                {feedback.correct ? '🎉' : '🤔'}
              </div>
              <p className={`text-5xl font-black mb-3 ${feedback.correct ? 'text-green-700' : 'text-yellow-700'}`}>
                {feedback.correct ? feedback.message : 'Try Again!'}
              </p>
              {feedback.correct && (
                <>
                  <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
                    <p className="text-gray-600 mb-3 font-semibold text-lg">You learned:</p>
                    <div className="flex justify-center items-center gap-4 flex-wrap">
                      <span className="text-3xl font-bold text-purple-600 bg-purple-50 px-6 py-3 rounded-lg">
                        {currentWord.word || currentWord.bahasa}
                      </span>
                      <span className="text-2xl font-bold text-gray-400">➜</span>
                      <span className="text-3xl font-bold text-pink-600 bg-pink-50 px-6 py-3 rounded-lg">
                        {currentWord.translation || currentWord.english}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-3 mb-8 text-5xl">
                    {[...Array(feedback.stars)].map((_, i) => (
                      <span key={i} className="inline-block animate-bounce" style={{animationDelay: `${i * 0.2}s`}}>⭐</span>
                    ))}
                  </div>
                  <button onClick={nextWord} className="btn bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white text-lg py-4 px-10 hover:scale-110 transition-all shadow-lg font-bold rounded-xl">
                    {currentIndex < list.words.length - 1 ? '▶️ Next Word →' : '🏆 Finish Learning! 🏆'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all"
              style={{ width: `${((currentIndex + 1) / list.words.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Completion Screen */}
      {showCompletion && (
        <CompletionTrophy
          accuracy={Math.round((stars / (list.words.length * 3)) * 100)}
          timeSpent={completionTime}
          wordCount={list.words.length}
          onContinue={() => {
            // Small delay to ensure state is properly saved, then navigate
            setTimeout(() => {
              navigate('/student-home', { replace: true });
            }, 500);
          }}
        />
      )}
    </div>
  );
}

export default StudentLearn;
