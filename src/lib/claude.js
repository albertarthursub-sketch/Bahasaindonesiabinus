const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function generateVocabularyList(theme, gradeLevel, count = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-vocabulary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        theme,
        gradeLevel,
        count
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate vocabulary');
    }

    const data = await response.json();
    return data.words;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
}

export async function improveSyllables(bahasaWord) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/improve-syllables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bahasaWord
      })
    });

    if (!response.ok) {
      // Fallback to simple syllabification
      const syllables = bahasaWord.match(/[^aeiou]*[aeiou]+/gi) || [];
      return syllables.join('-');
    }

    const data = await response.json();
    return data.syllables;
  } catch (error) {
    console.error('Syllable improvement error:', error);
    // Fallback
    const syllables = bahasaWord.match(/[^aeiou]*[aeiou]+/gi) || [];
    return syllables.join('-');
  }
}

export async function findImageUrl(searchTerm) {
  // Use Unsplash API directly
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerm)}`;
}
