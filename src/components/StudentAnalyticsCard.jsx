import React from 'react';
import { Star, TrendingUp, Award } from 'lucide-react';

const StudentAnalyticsCard = ({ studentName, stats }) => {
  // Calculate student level based on overall percentage
  const getLevel = (percentage) => {
    if (percentage >= 85) return { level: 'Advanced', color: 'from-blue-600 to-purple-600', badge: '🔵', title: 'Advanced Learner' };
    if (percentage >= 70) return { level: 'Intermediate', color: 'from-yellow-500 to-orange-500', badge: '🟡', title: 'Progressing Well' };
    return { level: 'Beginner', color: 'from-green-500 to-emerald-500', badge: '🟢', title: 'Getting Started' };
  };

  const levelInfo = getLevel(stats.overallPercentage);

  // Calculate improvement potential (how many points until next level)
  const getImprovementToNextLevel = (percentage) => {
    if (percentage >= 85) return null;
    if (percentage >= 70) return 85 - percentage;
    return 70 - percentage;
  };

  const improvementNeeded = getImprovementToNextLevel(stats.overallPercentage);

  return (
    <div className={`bg-gradient-to-br ${levelInfo.color} rounded-lg p-6 text-white shadow-lg overflow-hidden relative`}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>

      <div className="relative z-10">
        {/* Header with name and level badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-1">{studentName}</h3>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{levelInfo.badge}</span>
              <div>
                <p className="text-sm font-semibold opacity-90">{levelInfo.title}</p>
                <p className="text-xs opacity-75">{levelInfo.level}</p>
              </div>
            </div>
          </div>
          <Award size={32} className="opacity-80" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white border-opacity-30">
          {/* Overall Score */}
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">{stats.overallPercentage}%</div>
            <div className="text-xs opacity-90 font-medium">Overall Accuracy</div>
          </div>

          {/* Stars */}
          <div className="text-center">
            <div className="text-3xl font-bold mb-1 flex items-center justify-center gap-1">
              {stats.totalStars}
              <Star size={20} fill="currentColor" />
            </div>
            <div className="text-xs opacity-90 font-medium">Stars Earned</div>
          </div>

          {/* Attempts */}
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">{stats.totalAttempts}</div>
            <div className="text-xs opacity-90 font-medium">Attempts</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-4 border-t border-white border-opacity-30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Progress to Next Level</span>
            <TrendingUp size={16} className="opacity-75" />
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{
                width: improvementNeeded
                  ? `${Math.min(100, ((improvementNeeded === 15 ? stats.overallPercentage - 70 : stats.overallPercentage - 85) / (improvementNeeded || 1)) * 100)}%`
                  : '100%',
              }}
            ></div>
          </div>
          {improvementNeeded && (
            <p className="text-xs opacity-75 mt-2">
              {improvementNeeded} points to reach {stats.overallPercentage >= 70 ? 'Advanced' : 'Intermediate'} level
            </p>
          )}
          {!improvementNeeded && (
            <p className="text-xs opacity-75 mt-2 font-semibold">🎉 Mastery Achieved!</p>
          )}
        </div>

        {/* Lists info */}
        <div className="mt-4 pt-4 border-t border-white border-opacity-30 text-sm opacity-90">
          <p>
            <span className="font-semibold">{Object.keys(stats.listStats).length}</span> vocabulary lists completed
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsCard;
