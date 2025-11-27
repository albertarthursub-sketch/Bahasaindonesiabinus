import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { Sparkles, Loader, Trash2, Copy, CheckCircle } from 'lucide-react';

const SPOActivityGenerator = ({ teacherId, classId }) => {
  const [difficulty, setDifficulty] = useState('moderate');
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedActivities, setGeneratedActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedSentences, setSelectedSentences] = useState([]);

  useEffect(() => {
    if (classId) {
      loadExistingActivities();
    }
  }, [classId]);

  const loadExistingActivities = async () => {
    try {
      setLoadingActivities(true);
      const q = query(
        collection(db, 'spoActivities'),
        where('classId', '==', classId),
        where('teacherId', '==', teacherId)
      );
      const snapshot = await getDocs(q);
      setGeneratedActivities(
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const getPromptByDifficulty = (level) => {
    const prompts = {
      easy: `Generate 5 VERY SIMPLE Indonesian S-P-O sentences for beginners. Each sentence should have EXACTLY 3 words:
- Subject (simple noun): animals, people, or common objects
- Predicate (simple verb): eating, playing, running, jumping, sleeping
- Object (simple noun): food or objects

Requirements:
- Only use most common beginner words
- Keep sentences extremely simple (3 words only)
- No complex grammar
- Present tense only

Format each as:
SENTENCE: [Indonesian sentence]
SUBJECT: [subject] ([English])
PREDICATE: [verb] ([English])
OBJECT: [object] ([English])

Start with: SENTENCE 1:`,

      moderate: `Generate 5 Indonesian S-P-O sentences at intermediate level. Each sentence should have 4-5 words:
- Subject: simple adjective + noun or just noun
- Predicate: verb with optional adverb
- Object: noun with optional adjective

Requirements:
- Use common vocabulary
- Mix of verb types (action verbs, states)
- 4-5 words per sentence
- Present and simple past tenses

Format each as:
SENTENCE: [Indonesian sentence]
SUBJECT: [subject] ([English])
PREDICATE: [verb] ([English])
OBJECT: [object] ([English])

Start with: SENTENCE 1:`,

      hard: `Generate 5 Indonesian S-P-O sentences at advanced level. Each sentence should have 5-7 words:
- Subject: adjective + noun or possessive structures
- Predicate: verb with adverbs or auxiliary verbs
- Object: adjective + noun or complex phrases

Requirements:
- Use intermediate vocabulary
- Include various verb forms
- 5-7 words per sentence
- Multiple tenses (present, past, future)

Format each as:
SENTENCE: [Indonesian sentence]
SUBJECT: [subject] ([English])
PREDICATE: [verb] ([English])
OBJECT: [object] ([English])

Start with: SENTENCE 1:`
    };
    return prompts[level];
  };

  const generateSentences = async () => {
    setLoading(true);
    setSentences([]);
    setSelectedSentences([]);

    try {
      const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
      if (!apiKey) {
        alert('API key not configured');
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [{ role: 'user', content: getPromptByDifficulty(difficulty) }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.content[0].text;

      // Parse sentences
      const sentenceBlocks = responseText.split(/SENTENCE \d+:/);
      const parsed = [];

      sentenceBlocks.forEach((block, idx) => {
        if (idx === 0 || !block.trim()) return;

        const sentenceMatch = block.match(/SENTENCE:\s*(.+?)(?:\n|$)/);
        const subjectMatch = block.match(/SUBJECT:\s*(.+?)(?:\n|$)/);
        const predicateMatch = block.match(/PREDICATE:\s*(.+?)(?:\n|$)/);
        const objectMatch = block.match(/OBJECT:\s*(.+?)(?:\n|$)/);

        if (sentenceMatch && subjectMatch && predicateMatch && objectMatch) {
          parsed.push({
            text: sentenceMatch[1].trim(),
            subject: subjectMatch[1].trim(),
            predicate: predicateMatch[1].trim(),
            object: objectMatch[1].trim(),
            difficulty,
            createdAt: new Date().toISOString(),
          });
        }
      });

      setSentences(parsed);
    } catch (error) {
      console.error('Error generating sentences:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSentenceSelection = (index) => {
    if (selectedSentences.includes(index)) {
      setSelectedSentences(selectedSentences.filter(i => i !== index));
    } else {
      setSelectedSentences([...selectedSentences, index]);
    }
  };

  const saveSelectedSentences = async () => {
    if (selectedSentences.length === 0) {
      alert('Please select at least one sentence');
      return;
    }

    try {
      setLoading(true);
      const activitiesToSave = selectedSentences.map(idx => sentences[idx]);

      for (const sentence of activitiesToSave) {
        await addDoc(collection(db, 'spoActivities'), {
          ...sentence,
          classId,
          teacherId,
          assignedAt: new Date().toISOString(),
          words: sentence.text.split(' '),
        });
      }

      setSuccessMessage(`✅ ${activitiesToSave.length} sentence(s) saved!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setSentences([]);
      setSelectedSentences([]);
      await loadExistingActivities();
    } catch (error) {
      console.error('Error saving sentences:', error);
      alert('Error saving sentences');
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (activityId) => {
    if (!window.confirm('Delete this activity?')) return;

    try {
      await deleteDoc(doc(db, 'spoActivities', activityId));
      await loadExistingActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Sparkles className="text-purple-600" size={32} />
          SPO Activity Generator
        </h2>
        <p className="text-gray-600">Generate and assign S-P-O practice activities to your class</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Generator Section */}
      <div className="border-2 border-dashed border-purple-200 rounded-lg p-6 mb-8 bg-purple-50">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty Level</label>
          <div className="flex gap-3">
            {['easy', 'moderate', 'hard'].map(level => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                  difficulty === level
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-purple-200 hover:border-purple-400'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {difficulty === 'easy' && '3 words per sentence - Perfect for beginners'}
            {difficulty === 'moderate' && '4-5 words per sentence - Building skills'}
            {difficulty === 'hard' && '5-7 words per sentence - Advanced learners'}
          </p>
        </div>

        <button
          onClick={generateSentences}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={20} />
              Generating Sentences...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate 5 Sentences
            </>
          )}
        </button>
      </div>

      {/* Generated Sentences */}
      {sentences.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Generated Sentences ({selectedSentences.length} selected)
            </h3>
            <button
              onClick={saveSelectedSentences}
              disabled={selectedSentences.length === 0 || loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Save Selected
            </button>
          </div>

          <div className="space-y-3">
            {sentences.map((sentence, idx) => (
              <div
                key={idx}
                onClick={() => toggleSentenceSelection(idx)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSentences.includes(idx)
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-gray-50 hover:border-purple-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSentences.includes(idx)}
                    onChange={() => toggleSentenceSelection(idx)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900 mb-2">{sentence.text}</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-red-50 p-2 rounded">
                        <p className="text-xs font-bold text-red-600">SUBJECT</p>
                        <p className="text-gray-700">{sentence.subject}</p>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded">
                        <p className="text-xs font-bold text-yellow-600">PREDICATE</p>
                        <p className="text-gray-700">{sentence.predicate}</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs font-bold text-blue-600">OBJECT</p>
                        <p className="text-gray-700">{sentence.object}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Activities */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Assigned Activities ({generatedActivities.length})
        </h3>

        {loadingActivities ? (
          <div className="text-center py-8">
            <Loader className="animate-spin mx-auto mb-2 text-purple-600" size={32} />
            <p className="text-gray-600">Loading activities...</p>
          </div>
        ) : generatedActivities.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No SPO activities assigned yet</p>
            <p className="text-sm text-gray-500">Generate and save sentences to create activities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedActivities.map(activity => (
              <div key={activity.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-2">{activity.text}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded capitalize">
                        {activity.difficulty}
                      </span>
                      <span className="text-gray-500">
                        {new Date(activity.assignedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteActivity(activity.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded transition-all"
                    title="Delete activity"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SPOActivityGenerator;
