import { useState } from 'react';

const LearningModeSelector = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Choose Learning Mode
        </h2>
        <p className="text-gray-600 mb-8">
          Select how students will learn from this vocabulary list
        </p>

        <div className="grid md:grid-cols-1 gap-6 mb-8">
          {/* Drag & Drop Mode */}
          <button
            onClick={() => onSelect('syllable-matching')}
            className="p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
              ✋
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Drag & Drop Syllables
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Students drag syllables to match complete words
            </p>
            <div className="text-xs space-y-1 text-left bg-blue-50 p-3 rounded-lg">
              <p>✓ Match syllables</p>
              <p>✓ Learn pronunciation</p>
              <p>✓ Interactive gameplay</p>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningModeSelector;
