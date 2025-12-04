"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const codeLines = [
  { line: 1, text: "import { AI } from '@chlorocode/core';", indent: 0 },
  { line: 2, text: "", indent: 0 },
  { line: 3, text: "const agent = new AI();", indent: 0 },
  { line: 4, text: "", indent: 0 },
  { line: 5, text: "// Auto-optimizing your workflow...", indent: 0, comment: true },
  { line: 6, text: "await agent.optimize('production');", indent: 0 },
];

export default function TypingCode() {
  const [displayedLines, setDisplayedLines] = useState<typeof codeLines>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= codeLines.length) return;

    const currentLine = codeLines[currentLineIndex];
    
    // If empty line, skip immediately
    if (!currentLine.text) {
       setDisplayedLines(prev => {
        const newLines = [...prev];
        if (!newLines[currentLineIndex]) {
             newLines[currentLineIndex] = { ...currentLine };
        }
        return newLines;
      });
      setCurrentLineIndex(prev => prev + 1);
      setCurrentCharIndex(0);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedLines(prev => {
        const newLines = [...prev];
        const textSoFar = currentLine.text.slice(0, currentCharIndex + 1);
        
        newLines[currentLineIndex] = { 
            ...currentLine, 
            text: textSoFar 
        };
        return newLines;
      });

      if (currentCharIndex < currentLine.text.length - 1) {
        setCurrentCharIndex(prev => prev + 1);
      } else {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, 30 + Math.random() * 50); // Random typing speed

    return () => clearTimeout(timeout);
  }, [currentLineIndex, currentCharIndex]);

  return (
    <div className="font-mono text-sm space-y-2 min-h-[160px]">
      {codeLines.map((line, i) => {
        // If line hasn't started typing yet and isn't empty, don't render or render empty
        const displayedLine = displayedLines[i];
        
        // Color logic
        const isComment = line.comment;
        const content = displayedLine?.text || ""; 
        
        return (
          <div key={i} className="flex gap-4 h-5 items-center">
            <span className="text-zinc-700 select-none w-6 text-right">{String(i + 1).padStart(2, '0')}</span>
            <span className={isComment ? "text-zinc-500" : "text-zinc-300"}>
               {!isComment ? (
                 <SyntaxHighlight text={content} />
               ) : (
                 content
               )}
               {i === currentLineIndex && (
                 <motion.span 
                   animate={{ opacity: [0, 1, 0] }}
                   transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                   className="inline-block w-2.5 h-5 bg-primary ml-1 align-middle shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                 />
               )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SyntaxHighlight({ text }: { text: string }) {
  // Very basic highlighting for demo
  const words = text.split(/(\s+|[().,;'])/);
  return (
    <>
      {words.map((word, i) => {
        if (['import', 'from', 'const', 'new', 'await'].includes(word)) return <span key={i} className="text-purple-400">{word}</span>;
        if (['AI', 'agent'].includes(word)) return <span key={i} className="text-yellow-200">{word}</span>;
        if (word.startsWith("'")) return <span key={i} className="text-green-400">{word}</span>;
        if (['optimize'].includes(word)) return <span key={i} className="text-blue-400">{word}</span>;
        return <span key={i}>{word}</span>;
      })}
    </>
  );
}
