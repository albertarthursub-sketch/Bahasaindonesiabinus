import React, { useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';

const AIAnalyticsSummary = ({ studentName, stats, listStats }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateSummary = async () => {
    if (!studentName || !stats) return;

    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
      if (!apiKey) {
        setError('API key not configured');
        setLoading(false);
        return;
      }

      // Prepare data for the AI
      const performanceData = {
        studentName,
        overallAccuracy: stats.overallPercentage,
        totalAttempts: stats.totalAttempts,
        totalStars: stats.totalStars,
        listsAttempted: Object.keys(stats.listStats).length,
        listPerformance: Object.entries(stats.listStats).map(([_, l]) => ({
          name: l.name,
          accuracy: l.percentage,
          stars: l.stars,
          attempts: l.attempts,
        })),
        strongAreas: Object.entries(stats.listStats)
          .filter(([_, l]) => l.percentage >= 80)
          .map(([_, l]) => ({ name: l.name, accuracy: l.percentage }))
          .sort((a, b) => b.accuracy - a.accuracy)
          .slice(0, 3),
        needsImprovement: Object.entries(stats.listStats)
          .filter(([_, l]) => l.percentage < 70)
          .map(([_, l]) => ({ name: l.name, accuracy: l.percentage }))
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, 3),
      };

      const prompt = `You are an expert Indonesian language teacher analyzing a student's learning progress. 

Student: ${performanceData.studentName}
Overall Accuracy: ${performanceData.overallAccuracy}%
Total Attempts: ${performanceData.totalAttempts}
Total Stars Earned: ${performanceData.totalStars}
Lists Attempted: ${performanceData.listsAttempted}

Strong Areas (≥80% accuracy):
${performanceData.strongAreas.map(a => `- ${a.name}: ${a.accuracy}%`).join('\n')}

Needs Improvement (<70% accuracy):
${performanceData.needsImprovement.map(a => `- ${a.name}: ${a.accuracy}%`).join('\n')}

Please provide a concise, encouraging analysis in this exact format:

✅ STRENGTHS:
[2-3 bullet points about what this student is doing well]

⚠️ AREAS FOR IMPROVEMENT:
[2-3 bullet points about specific challenges and why]

💡 ACTIONABLE RECOMMENDATIONS:
[3-4 specific, practical tips to help the student improve]

🎯 NEXT STEPS:
[2-3 motivational next steps with specific focus areas]

Keep the tone encouraging and constructive. Be specific to this student's actual performance data.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.content[0].text);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err.message || 'Failed to generate AI summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
      {/* Header with button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
          <Sparkles size={24} className="text-purple-600" />
          AI-Powered Analytics Summary
        </h3>
        <button
          onClick={generateSummary}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Summary
            </>
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error generating summary</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Summary display */}
      {summary && (
        <div className="bg-white rounded-lg p-6 border border-purple-200 shadow-sm">
          <div className="space-y-4 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed font-sans">
            {summary.split('\n').map((line, idx) => {
              if (line.trim() === '') return null;

              // Style headers differently
              if (line.includes('✅') || line.includes('⚠️') || line.includes('💡') || line.includes('🎯')) {
                return (
                  <div key={idx} className="mt-4 mb-2">
                    <p className="font-bold text-gray-900">{line}</p>
                  </div>
                );
              }

              // Style bullet points
              if (line.trim().startsWith('-')) {
                return (
                  <div key={idx} className="ml-4 text-gray-700">
                    {line}
                  </div>
                );
              }

              return (
                <div key={idx} className="text-gray-700">
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!summary && !loading && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
          <p>Click "Generate Summary" to get personalized AI insights</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <Loader size={32} className="mx-auto mb-2 animate-spin text-purple-600" />
          <p className="text-gray-600">Analyzing student performance...</p>
        </div>
      )}
    </div>
  );
};

export default AIAnalyticsSummary;
