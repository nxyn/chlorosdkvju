"use client";

import { useState, useEffect, useRef } from "react";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

interface TextScrambleProps {
  children: string;
  className?: string;
  speed?: number;
  trigger?: "hover" | "visible" | "always";
}

export default function TextScramble({ children, className, speed = 30, trigger = "hover" }: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(children);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);
    let iteration = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        children
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return children[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= children.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsScrambling(false);
      }

      iteration += 1 / 3; // Slower reveal
    }, speed);
  };

  useEffect(() => {
    if (trigger === "always" || trigger === "visible") { // Simplified visible check for now
        scramble();
    }
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span 
        className={className} 
        onMouseEnter={() => trigger === "hover" && scramble()}
    >
      {displayText}
    </span>
  );
}
