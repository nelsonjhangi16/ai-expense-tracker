import { useState, useEffect } from "react";

// Store the event globally so it's never lost
let deferredPrompt = null;

export function usePWAInstall() {
  const [canInstall,  setCanInstall]  = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS,       setIsIOS]       = useState(false);

  useEffect(() => {
    // Already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // iOS check
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);
    if (ios) {
      setCanInstall(true);
      return;
    }

    // If prompt was already captured before hook mounted
    if (deferredPrompt) {
      setCanInstall(true);
    }

    // Listen for future prompt
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = async () => {
    if (isIOS) {
      alert("To install on iPhone:\n1. Tap the Share button\n2. Tap 'Add to Home Screen'\n3. Tap 'Add'");
      return;
    }

    if (!deferredPrompt) {
      alert("Installation not available. Try refreshing the page.");
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setCanInstall(false);
      }
      deferredPrompt = null;
    } catch (err) {
      console.error("Install error:", err);
    }
  };

  return { install, canInstall, isInstalled, isIOS };
}