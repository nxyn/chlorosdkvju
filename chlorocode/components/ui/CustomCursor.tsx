"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Optimized hit testing
      const target = e.target as HTMLElement;
      // Check if the target or its parents are interactive
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.closest('[role="button"]') !== null ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovering(isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Main Dot */}
          <motion.div
            className="fixed top-0 left-0 w-2.5 h-2.5 bg-primary rounded-full pointer-events-none z-[9999] mix-blend-difference shadow-[0_0_10px_rgba(74,222,128,0.8)]"
            animate={{
              x: mousePos.x - 5,
              y: mousePos.y - 5,
              scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
            }}
            transition={{ type: "spring", stiffness: 1500, damping: 40 }}
          />
          
          {/* Outer Ring / Glow */}
          <motion.div
            className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998] border border-primary/30"
            animate={{
              x: mousePos.x - 16,
              y: mousePos.y - 16,
              scale: isClicking ? 0.5 : isHovering ? 2 : 1,
              opacity: isClicking ? 0.5 : isHovering ? 1 : 0.5,
              borderColor: isHovering ? "rgba(74, 222, 128, 0.8)" : "rgba(74, 222, 128, 0.3)",
              backgroundColor: isHovering ? "rgba(74, 222, 128, 0.1)" : "transparent"
            }}
            transition={{ type: "spring", stiffness: 800, damping: 40, mass: 0.5 }}
          />
        </>
      )}
    </AnimatePresence>
  );
}