import React, { useState, useEffect } from 'react';
import { RefreshCw, Loader, CheckCircle, AlertCircle, Volume2 } from 'lucide-react';
import CorrectAnswerAnimation from './CorrectAnswerAnimation';
import CompletionTrophy from './CompletionTrophy';

const SPOSentenceBuilder = ({ listId, listName }) => {
  const [sentence, setSentence] = useState(null);
  const [scrambledWords, setScrambledWords] = useState([]);
  const [userSentence, setUserSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [selectedWords, setSelectedWords] = useState([]);
  const [accuracy, setAccuracy] = useState(0);
  const [sentenceCount, setSentenceCount] = useState(0);

  useEffect(() => {
    generateSPOSentence();
  }, [listId]);

  const generateSPOSentence = async () => {
    setLoading(true);
    setFeedback(null);
    setUserSentence('');
    setSelectedWords([]);
    setExplanation('');
    setShowCorrectAnimation(false);

    try {
      const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
      if (!apiKey) {
        setFeedback({ type: 'error', message: 'API key not configured' });
        setLoading(false);
        return;
      }

      const prompt = `Generate a simple Indonesian sentence for language learning that clearly follows Subject-Predicate-Object (S-P-O) structure.

Requirements:
1. Simple, beginner-level Indonesian sentence
2. Clear S-P-O structure
3. 3-6 words total
4. Common everyday vocabulary (animals, food, actions, objects)
5. No punctuation in the sentence

Format your response EXACTLY as:
SENTENCE: [the sentence without punctuation]
SUBJECT: [the subject word/phrase]
PREDICATE: [the verb/action]
OBJECT: [the object word/phrase]
EXPLANATION: [Brief 1-2 sentence explanation of the S-P-O structure in English]

Example:
SENTENCE: Kucing makan ikan
SUBJECT: Kucing (cat)
PREDICATE: makan (eat)
OBJECT: ikan (fish)
EXPLANATION: Subject (Kucing/cat) performs an action (makan/eat) on the object (ikan/fish)`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate sentence');
      }

      const data = await response.json();
      const responseText = data.content[0].text;

      // Parse response
      const sentenceMatch = responseText.match(/SENTENCE:\s*(.+?)(?:\n|$)/);
      const subjectMatch = responseText.match(/SUBJECT:\s*(.+?)(?:\n|$)/);
      const predicateMatch = responseText.match(/PREDICATE:\s*(.+?)(?:\n|$)/);
      const objectMatch = responseText.match(/OBJECT:\s*(.+?)(?:\n|$)/);
      const explanationMatch = responseText.match(/EXPLANATION:\s*(.+?)(?:\n|$)/);

      if (sentenceMatch && subjectMatch && predicateMatch && objectMatch) {
        const correctSentence = sentenceMatch[1].trim();
        const words = correctSentence.split(' ');

        // Scramble words
        const scrambled = [...words].sort(() => Math.random() - 0.5);

        setSentence({
          text: correctSentence,
          original: words,
          subject: subjectMatch[1].trim(),
          predicate: predicateMatch[1].trim(),
          object: objectMatch[1].trim(),
        });
        setScrambledWords(scrambled);
        setExplanation(explanationMatch ? explanationMatch[1].trim() : '');
        setSentenceCount(prev => prev + 1);
      } else {
        setFeedback({ type: 'error', message: 'Failed to parse sentence' });
      }
    } catch (error) {
      console.error('Error generating sentence:', error);
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleWord = (word, index) => {
    const isSelected = selectedWords.some(w => w.index === index);
    if (isSelected) {
      setSelectedWords(selectedWords.filter(w => w.index !== index));
      setUserSentence(userSentence.replace(word + ' ', '').replace(' ' + word, '').replace(word, ''));
    } else {
      setSelectedWords([...selectedWords, { word, index }]);
      setUserSentence((prev) => (prev ? prev + ' ' + word : word));
    }
  };

  const checkSentence = async () => {
    if (!sentence) return;

    const userFormatted = userSentence.trim();
    const correctFormatted = sentence.text.trim();

    if (userFormatted.toLowerCase() === correctFormatted.toLowerCase()) {
      setShowCorrectAnimation(true);
      setFeedback({
        type: 'success',
        message: '✓ Perfect! You got it right!',
      });
      setAccuracy(100);

      setTimeout(() => {
        setShowCompletion(true);
      }, 1500);
    } else {
      setFeedback({
        type: 'error',
        message: `Not quite right. Correct answer: ${correctSentence.text}`,
      });
      setAccuracy(0);
    }
  };

  const handleContinue = () => {
    setShowCompletion(false);
    generateSPOSentence();
  };

  const speakSentence = () => {
    if (sentence && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      utterance.lang = 'id-ID';
      speechSynthesis.speak(utterance);
    }
  };

  const clearSelection = () => {
    setUserSentence('');
    setSelectedWords([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">🎯 SPO Sentence Builder</h2>
        <p className="text-gray-600">Subject - Predicate - Object | Practice Indonesian sentence structure</p>
        {sentenceCount > 0 && (
          <p className="text-sm text-gray-500 mt-2">Sentences completed: {sentenceCount}</p>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="animate-spin text-green-600 mb-4" size={40} />
          <p className="text-gray-600">Generating SPO sentence...</p>
        </div>
      ) : !sentence ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={40} />
          <p className="text-red-600 mb-4">{feedback?.message || 'No sentence generated'}</p>
          <button
            onClick={generateSPOSentence}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Sentence Display with Audio */}
          <div className="bg-white rounded-lg p-6 mb-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Listen to the sentence:</h3>
              <button
                onClick={speakSentence}
                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-all"
                title="Play pronunciation"
              >
                <Volume2 size={24} className="text-blue-600" />
              </button>
            </div>
            <p className="text-2xl font-bold text-green-700 text-center py-3 font-serif">
              {sentence.text}
            </p>
          </div>

          {/* SPO Structure Info */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
              <p className="text-xs font-semibold text-red-600 uppercase">Subject</p>
              <p className="text-sm font-bold text-red-700 mt-1">{sentence.subject}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
              <p className="text-xs font-semibold text-yellow-600 uppercase">Predicate</p>
              <p className="text-sm font-bold text-yellow-700 mt-1">{sentence.predicate}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-xs font-semibold text-blue-600 uppercase">Object</p>
              <p className="text-sm font-bold text-blue-700 mt-1">{sentence.object}</p>
            </div>
          </div>

          {/* Explanation */}
          {explanation && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 How it works:</span> {explanation}
              </p>
            </div>
          )}

          {/* Scrambled Words */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">🔀 Unscramble the words:</h3>
            <div className="flex flex-wrap gap-2">
              {scrambledWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => toggleWord(word, index)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all transform ${
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

          {/* User Input Display */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Your sentence:</h3>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 min-h-12 flex items-center">
              <p className="text-lg font-serif text-gray-800">
                {userSentence || <span className="text-gray-400">Click words above to build your sentence...</span>}
              </p>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
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
                className={`text-sm ${
                  feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {feedback.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={clearSelection}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all font-semibold"
            >
              Clear
            </button>
            <button
              onClick={checkSentence}
              disabled={!userSentence.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              Check Answer
            </button>
            <button
              onClick={generateSPOSentence}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center gap-2"
            >
              <RefreshCw size={18} /> New Sentence
            </button>
          </div>

          {/* Correct Animation */}
          {showCorrectAnimation && (
            <CorrectAnswerAnimation
              onComplete={() => setShowCorrectAnimation(false)}
            />
          )}

          {/* Completion Trophy */}
          {showCompletion && (
            <CompletionTrophy
              accuracy={100}
              timeSpent="Perfect!"
              wordCount={sentence.original.length}
              onContinue={handleContinue}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SPOSentenceBuilder;
