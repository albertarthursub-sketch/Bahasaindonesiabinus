import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, CheckCircle, AlertCircle, Loader, ChevronRight } from 'lucide-react';
import CorrectAnswerAnimation from './CorrectAnswerAnimation';
import CompletionTrophy from './CompletionTrophySimple';

const SPOActivityPractice = ({ activity, onComplete }) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scrambledWords, setScrambledWords] = useState([]);
  const [userSentence, setUserSentence] = useState('');
  const [selectedWords, setSelectedWords] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState([]);

  const questions = activity?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (currentQuestion && currentQuestion.text) {
      const words = currentQuestion.text.split(' ');
      const scrambled = [...words].sort(() => Math.random() - 0.5);
      setScrambledWords(scrambled);
      setUserSentence('');
      setSelectedWords([]);
      setFeedback(null);
      setAttempts(0);
    }
  }, [currentQuestion, currentQuestionIndex]);

  const toggleWord = (word, index) => {
    const isSelected = selectedWords.some(w => w.index === index);
    if (isSelected) {
      setSelectedWords(selectedWords.filter(w => w.index !== index));
      setUserSentence(
        userSentence
          .replace(word + ' ', '')
          .replace(' ' + word, '')
          .replace(word, '')
      );
    } else {
      setSelectedWords([...selectedWords, { word, index }]);
      setUserSentence(prev => (prev ? prev + ' ' + word : word));
    }
  };

  const checkAnswer = () => {
    setAttempts(attempts + 1);
    const userFormatted = userSentence.trim().toLowerCase();
    const correctFormatted = currentQuestion.text.trim().toLowerCase();

    if (userFormatted === correctFormatted) {
      setShowCorrectAnimation(true);
      setFeedback({
        type: 'success',
        message: '✓ Perfect! You got it right!',
      });

      const newCompleted = [...completedQuestions, currentQuestionIndex];
      setCompletedQuestions(newCompleted);

      setTimeout(() => {
        if (newCompleted.length === questions.length) {
          setShowCompletion(true);
        } else {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
        setShowCorrectAnimation(false);
      }, 1500);
    } else {
      setFeedback({
        type: 'error',
        message: `Not quite right. Try again!`,
      });
    }
  };

  const handleContinue = () => {
    console.log('✅ handleContinue called, calling onComplete callback');
    console.log('📦 Student session in storage:', sessionStorage.getItem('student') ? 'YES' : 'NO');
    
    // Reset all state before closing the completion modal
    setShowCompletion(false);
    setCurrentQuestionIndex(0);
    setUserSentence('');
    setSelectedWords([]);
    setFeedback(null);
    setAttempts(0);
    setCompletedQuestions([]);
    
    // Call the onComplete callback which will be handled by parent component
    if (onComplete) {
      onComplete();
    } else {
      // Fallback: navigate back without replace to preserve history
      if (!sessionStorage.getItem('student')) {
        console.error('❌ CRITICAL: Student session lost!');
      }
      navigate('/student-home');
    }
  };

  const speakSentence = () => {
    if (currentQuestion && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
      utterance.lang = 'id-ID';
      speechSynthesis.speak(utterance);
    }
  };

  const clearSelection = () => {
    setUserSentence('');
    setSelectedWords([]);
    setFeedback(null);
  };

  const handleBackClick = () => {
    navigate('/student-home');
  };

  if (!activity || !questions.length) {
    return (
      <div className="text-center py-12">
        <Loader className="animate-spin mx-auto mb-4 text-purple-600" size={40} />
        <p className="text-gray-600">Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-purple-700">SPO Writing Practice</h1>
      </div>

      <div className="mb-4 md:mb-6 bg-white rounded-lg shadow p-3 md:p-4">
        <div className="flex justify-between items-center mb-2 text-xs md:text-sm">
          <p className="font-semibold text-gray-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <p className="font-semibold text-green-600">
            ✓ {completedQuestions.length}/{questions.length} completed
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((completedQuestions.length) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-3 md:p-6">
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">🎯 Unscramble the Sentence</h2>
          <p className="text-xs md:text-sm text-gray-600">
            Level: <span className="font-semibold capitalize">{activity.difficulty}</span>
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-6 mb-4 md:mb-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4 flex-col md:flex-row gap-2">
            <h3 className="text-base md:text-lg font-semibold text-gray-700">Listen to the sentence:</h3>
            <button
              onClick={speakSentence}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-all min-w-12 h-12 flex items-center justify-center"
              title="Play pronunciation"
            >
              <Volume2 size={24} className="text-blue-600" />
            </button>
          </div>
          <p className="text-xl md:text-2xl font-bold text-green-700 text-center py-3 md:py-4 font-serif break-words">
            ••• •••• ••••
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6 opacity-20 pointer-events-none">
          <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
            <p className="text-xs font-semibold text-red-600 uppercase">Subject</p>
            <p className="text-sm font-bold text-red-700 mt-1">{currentQuestion.subject}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
            <p className="text-xs font-semibold text-yellow-600 uppercase">Predicate</p>
            <p className="text-sm font-bold text-yellow-700 mt-1">{currentQuestion.predicate}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-xs font-semibold text-blue-600 uppercase">Object</p>
            <p className="text-sm font-bold text-blue-700 mt-1">{currentQuestion.object}</p>
          </div>
        </div>

        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-3">🔀 Unscramble the words:</h3>
          <div className="flex flex-wrap gap-2">
            {scrambledWords.map((word, index) => (
              <button
                key={index}
                onClick={() => toggleWord(word, index)}
                className={`px-3 md:px-4 py-2 md:py-2 rounded-lg font-semibold transition-all transform text-sm md:text-base min-h-10 md:min-h-12 ${
                  selectedWords.some(w => w.index === index)
                    ? 'bg-green-600 text-white scale-105 shadow-lg'
                    : 'bg-white text-gray-800 border-2 border-gray-300 hover:border-green-500 hover:shadow-md'
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-3">Your sentence:</h3>
          <div className="bg-white border-2 border-gray-300 rounded-lg p-3 md:p-4 min-h-12 md:min-h-16 flex items-center">
            <p className="text-base md:text-lg font-serif text-gray-800 break-words">
              {userSentence || <span className="text-gray-400 text-sm md:text-base">Click words above to build...</span>}
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg flex items-start gap-3 ${
              feedback.type === 'success'
                ? 'bg-green-50 border-l-4 border-green-500'
                : 'bg-red-50 border-l-4 border-red-500'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
            ) : (
              <AlertCircle className="text-red-600 mt-1 flex-shrink-0" size={20} />
            )}
            <p
              className={`text-xs md:text-sm ${
                feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {feedback.message}
            </p>
          </div>
        )}

        <div className="flex gap-2 md:gap-3 justify-center">
          <button
            onClick={clearSelection}
            className="px-4 md:px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all font-semibold text-sm md:text-base"
          >
            Clear
          </button>
          <button
            onClick={checkAnswer}
            disabled={!userSentence.trim()}
            className="px-4 md:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm md:text-base flex items-center gap-2"
          >
            Check Answer <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {showCorrectAnimation && <CorrectAnswerAnimation onComplete={() => {}} />}
      {showCompletion && (
        <CompletionTrophy
          accuracy={100}
          timeSpent={`${completedQuestions.length}/${questions.length} questions answered`}
          wordCount={questions.length}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
};

export default SPOActivityPractice;
