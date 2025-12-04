"use client";

import { useEffect, useRef } from "react";

export default function NeonGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let t = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);

    const col = (x: number, y: number, r: number, g: number, b: number) => {
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 1, 1);
    };

    const R = (x: number, y: number, t: number) => {
      return Math.floor(192 + 64 * Math.cos((x * x - y * y) / 300 + t));
    };

    const G = (x: number, y: number, t: number) => {
      return Math.floor(192 + 64 * Math.sin((x * x * Math.cos(t / 4) + y * y * Math.sin(t / 3)) / 300));
    };

    const B = (x: number, y: number, t: number) => {
      return Math.floor(192 + 64 * Math.sin(5 * Math.sin(t / 9) + ((x - 100) * (x - 100) + (y - 100) * (y - 100)) / 1100));
    };

    // Optimized gradient blobs instead of pixel shader logic for performance
    class Blob {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        color: string;

        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.size = Math.random() * 300 + 200;
            // Neon palette: Cyan, Purple, Green, Pink
            const colors = [
                "rgba(74, 222, 128, 0.15)", // Green (Primary)
                "rgba(56, 189, 248, 0.15)", // Sky Blue
                "rgba(168, 85, 247, 0.15)", // Purple
                "rgba(236, 72, 153, 0.15)"  // Pink
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < -this.size) this.x = w + this.size;
            if (this.x > w + this.size) this.x = -this.size;
            if (this.y < -this.size) this.y = h + this.size;
            if (this.y > h + this.size) this.y = -this.size;
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        }
    }

    const blobs: Blob[] = Array.from({ length: 8 }, () => new Blob());

    const animate = () => {
        ctx.clearRect(0, 0, w, h);
        
        // Dark background
        ctx.fillStyle = "#09090b"; 
        ctx.fillRect(0, 0, w, h);

        // Composite mode for "neon" blend
        ctx.globalCompositeOperation = "screen";

        blobs.forEach(blob => {
            blob.update();
            blob.draw(ctx);
        });

        ctx.globalCompositeOperation = "source-over";

        // Optional: Add a subtle grain or grid overlay here if desired
        
        requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] opacity-60 pointer-events-none"
    />
  );
}
