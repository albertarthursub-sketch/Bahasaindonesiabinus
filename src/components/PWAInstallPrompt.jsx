/**
 * Install Prompt Component
 * Shows PWA install button on supported devices
 */

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // Check if app is already installed
    if (window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('✅ App installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('✅ App installation prompt accepted');
    } else {
      console.log('❌ App installation prompt dismissed');
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  // Don't show if not supported or already installed
  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-2xl p-4 text-white animate-slideup">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <Download size={24} className="flex-shrink-0 animate-bounce" />
            <div>
              <h3 className="font-bold text-sm md:text-base">📱 Install App</h3>
              <p className="text-xs md:text-sm opacity-90">Save Bahasa Learning to your device</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-white text-purple-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 text-sm"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-white/20 hover:bg-white/30 font-bold py-2 px-4 rounded-lg transition-all text-sm"
          >
            Later
          </button>
        </div>

        <p className="text-xs mt-3 opacity-75">
          💡 Tip: Access the app icon from your home screen or app drawer anytime!
        </p>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
