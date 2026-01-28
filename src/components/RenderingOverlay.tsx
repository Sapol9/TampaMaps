"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RenderingOverlayProps {
  isRendering: boolean;
  duration?: number; // Duration in ms
  onComplete?: () => void;
  themeName?: string; // Optional theme name for customized messages
}

// Theme-specific status messages
const getStatusMessages = (themeName?: string): string[] => {
  // Base messages
  const baseMessages = [
    "Initializing Vector Data Layers...",
    "Rendering 300 DPI Architectural Detail...",
    "Finalizing High-Resolution Vector Snap...",
  ];

  // Theme-specific middle messages
  const themeMessages: Record<string, string> = {
    "The Obsidian": "Applying Obsidian Vector Layers...",
    "The Cobalt": "Rendering Blueprint Heritage Vectors...",
    "The Parchment": "Tracing Architectural Draft Lines...",
    "The Emerald": "Processing Verdant Geometry Paths...",
    "The Copper": "Forging Industrial Copper Routes...",
  };

  if (themeName && themeMessages[themeName]) {
    return [
      "Initializing Vector Data Layers...",
      themeMessages[themeName],
      "Finalizing High-Resolution Vector Snap...",
    ];
  }

  return baseMessages;
};

export default function RenderingOverlay({
  isRendering,
  duration = 2000,
  onComplete,
  themeName,
}: RenderingOverlayProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const statusMessages = useMemo(() => getStatusMessages(themeName), [themeName]);

  // Cycle through status messages
  useEffect(() => {
    if (!isRendering) {
      setCurrentMessageIndex(0);
      return;
    }

    const messageInterval = duration / statusMessages.length;
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        const next = prev + 1;
        return next < statusMessages.length ? next : prev;
      });
    }, messageInterval);

    return () => clearInterval(interval);
  }, [isRendering, duration, statusMessages.length]);

  // Trigger onComplete after duration
  useEffect(() => {
    if (!isRendering) return;

    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isRendering, duration, onComplete]);

  return (
    <AnimatePresence>
      {isRendering && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-md bg-black/40"
        >
          {/* Geometric spinner */}
          <div className="relative w-16 h-16 mb-6">
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 border-2 border-white/20 rounded-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Spinning arc */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="47 141"
                />
              </svg>
            </motion.div>

            {/* Inner pulse */}
            <motion.div
              className="absolute inset-4 bg-white/10 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>

          {/* Status message */}
          <div className="text-center px-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-light tracking-wide text-white/90"
              >
                {statusMessages[currentMessageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="w-32 h-px bg-white/20 mt-4 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/80"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
