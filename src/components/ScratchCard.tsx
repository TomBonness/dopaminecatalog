"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAudio } from "@/context/AudioContext";

interface ScratchCardProps {
  width?: number;
  height?: number;
  onComplete: () => void;
  resetKey: number;
  rewardText: string;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  width = 280,
  height = 160,
  onComplete,
  resetKey,
  rewardText
}) => {
  const { play } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [finished, setFinished] = useState(false);
  const [coinPos, setCoinPos] = useState<{ x: number; y: number } | null>(null);
  const lastSoundTime = useRef<number>(0);

  // Initialize/reset canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Clear previous drawing
    ctx.clearRect(0, 0, width, height);
    
    // Draw silver/neon scratch layer
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#27272a"); // zinc-800
    gradient.addColorStop(0.5, "#3f3f46"); // zinc-700
    gradient.addColorStop(1, "#18181b"); // zinc-900
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw scratch texture / text helper
    ctx.fillStyle = "#a1a1aa"; // zinc-400
    ctx.font = "black 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH HERE FOR DOPAMINE", width / 2, height / 2);

    // Add a neon border/texture lines
    ctx.strokeStyle = "#ff007f"; // neon-pink
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    setScratchedPercent(0);
    setFinished(false);
  }, [resetKey, width, height]);

  // Scratch action
  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || finished) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
    setCoinPos({ x, y });

    // Play scratch sound (throttled to once every 120ms)
    const now = Date.now();
    if (now - lastSoundTime.current > 120) {
      play("scratch");
      lastSoundTime.current = now;
    }

    // Check scratch percentage
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    let transparentCount = 0;
    const totalPixels = pixels.length / 4;
    
    // Sample every 20th pixel to be highly efficient
    for (let i = 0; i < pixels.length; i += 80) {
      if (pixels[i + 3] === 0) { // Alpha is 0 (scratched)
        transparentCount++;
      }
    }

    const pct = (transparentCount / (totalPixels / 20)) * 100;
    setScratchedPercent(pct);

    if (pct >= 45 && !finished) {
      setFinished(true);
      ctx.clearRect(0, 0, width, height); // clear completely
      onComplete();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    scratch(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    scratch(e.clientX, e.clientY);
  };
  const handleMouseUp = () => {
    setIsDrawing(false);
    setCoinPos(null);
  };
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    if (e.touches.length > 0) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || e.touches.length === 0) return;
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  return (
    <div
      className="relative rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950 flex items-center justify-center select-none shadow-[0_0_20px_rgba(255,0,127,0.1)] hover:shadow-[0_0_30px_rgba(255,0,127,0.2)] transition-shadow duration-300"
      style={{ width, height }}
    >
      {/* Revealed Reward Underneath */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-zinc-900 to-zinc-950">
        <span className="text-3xl mb-2">🎁</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-neon-pink text-neon-glow-pink animate-pulse">
          Serotonin Injection Received!
        </span>
        <h4 className="text-lg font-black text-white leading-tight mt-1">{rewardText}</h4>
        <span className="text-[9px] text-zinc-500 mt-2">Ticket Scratched Successfully</span>
      </div>

      {/* Silver Scratch Canvas Overlay */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        className={`absolute inset-0 z-10 cursor-none touch-none transition-opacity duration-300 ${
          finished ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />
      {/* Tactile Follow Coin cursor */}
      {isDrawing && coinPos && !finished && (
        <div
          className="absolute pointer-events-none z-20 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 border-2 border-yellow-300 flex items-center justify-center font-extrabold text-xs text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.8)] select-none"
          style={{
            left: coinPos.x - 16,
            top: coinPos.y - 16,
          }}
        >
          ¢
        </div>
      )}
    </div>
  );
};

export default ScratchCard;
