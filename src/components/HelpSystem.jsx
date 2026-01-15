import React, { useState, useMemo, useEffect } from 'react';
import { MessageCircle, X, Search, EyeOff } from 'lucide-react';
import helpContent from '../data/helpContent';
import '../styles/helpAnimation.css';

const HelpSystem = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedHiddenState = localStorage.getItem('helpButtonHidden');
    if (savedHiddenState === 'true') {
      setIsHidden(true);
    }
  }, []);

  // Save hidden state to localStorage
  const toggleHidden = () => {
    const newState = !isHidden;
    setIsHidden(newState);
    localStorage.setItem('helpButtonHidden', newState.toString());
  };

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(helpContent.faqs.map(faq => faq.category))];
  }, []);

  // Filter FAQs based on search query and selected category
  const filteredFAQs = useMemo(() => {
    return helpContent.faqs.filter(faq => {
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Show hidden button when isHidden is true
  if (isHidden) {
    return (
      <button
        onClick={toggleHidden}
        className="fixed bottom-6 right-6 z-40 p-3 bg-gray-400 hover:bg-gray-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
        title="Show Help"
      >
        <EyeOff size={24} />
      </button>
    );
  }

  return (
    <>
      {/* Floating Help Button with Animated Label */}
      <div className="fixed bottom-6 right-6 z-40 group">
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-pulse"></div>
        
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
          title="Help & Documentation"
        >
          <MessageCircle size={28} />
        </button>

        {/* Animated Text Label */}
        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-lg shadow-lg pointer-events-none whitespace-nowrap animate-bounce-subtle">
          ✨ Need Help? Click Me! →
        </div>
      </div>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Side Drawer */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex justify-between items-center gap-4 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold">📚 Help</h2>
            <p className="text-blue-100 text-sm">Find answers quickly</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={toggleHidden}
              className="hover:bg-white/20 p-2 rounded-lg transition"
              title="Hide help button from all pages"
            >
              <EyeOff size={20} />
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setSearchQuery('');
                setSelectedCategory(null);
                setExpandedFAQ(null);
              }}
              className="hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Search Bar */}
          <div className="p-6 border-b sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search help..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedCategory(null);
                }}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-6 py-4 border-b bg-gray-50 sticky top-16 z-10">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase">Categories</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                  setExpandedFAQ(null);
                }}
                className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                  selectedCategory === null
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSearchQuery('');
                    setExpandedFAQ(null);
                  }}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition truncate ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQs List */}
          <div className="p-6 space-y-3">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No results found</p>
                <p className="text-gray-400 text-sm">Try different search terms</p>
              </div>
            ) : (
              filteredFAQs.map(faq => (
                <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition flex justify-between items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm mb-1 break-words">{faq.question}</p>
                      <p className="text-xs text-blue-600 font-medium">{faq.category}</p>
                    </div>
                    <span className={`text-blue-500 flex-shrink-0 transition transform ${expandedFAQ === faq.id ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {expandedFAQ === faq.id && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-600 mb-3">
            {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} found
          </p>
          <button
            onClick={() => {
              setIsOpen(false);
              setSearchQuery('');
              setSelectedCategory(null);
              setExpandedFAQ(null);
            }}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default HelpSystem;
