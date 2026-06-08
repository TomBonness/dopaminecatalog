"use client";

import React from "react";
import { motion } from "framer-motion";
import { Store, Home, Bot } from "lucide-react";
import { useAppState } from "@/context/StateContext";

interface TrackingMapProps {
  progress: number;
}

export const TrackingMap: React.FC<TrackingMapProps> = ({ progress }) => {
  const { activeOrder } = useAppState();
  const ROUTE_VARIANTS = [
    // Route 0 (original)
    [
      { x: 40, y: 160 },
      { x: 120, y: 160 },
      { x: 120, y: 100 },
      { x: 260, y: 100 },
      { x: 260, y: 40 },
      { x: 360, y: 40 }
    ],
    // Route 1
    [
      { x: 40, y: 160 },
      { x: 40, y: 100 },
      { x: 180, y: 100 },
      { x: 180, y: 40 },
      { x: 360, y: 40 }
    ],
    // Route 2
    [
      { x: 40, y: 160 },
      { x: 220, y: 160 },
      { x: 220, y: 80 },
      { x: 360, y: 80 },
      { x: 360, y: 40 }
    ],
    // Route 3
    [
      { x: 40, y: 160 },
      { x: 160, y: 160 },
      { x: 160, y: 40 },
      { x: 360, y: 40 }
    ]
  ];
  const getPointAlongRoute = (points: { x: number; y: number }[], pct: number) => {
    if (points.length === 0) return { x: 0, y: 0, angle: 0 };
    if (points.length === 1) return { x: points[0].x, y: points[0].y, angle: 0 };
    const segments: { p1: { x: number; y: number }; p2: { x: number; y: number }; length: number }[] = [];
    let totalLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      segments.push({ p1, p2, length });
      totalLength += length;
    }
    const targetDist = (pct / 100) * totalLength;
    let currentDist = 0;
    for (const seg of segments) {
      if (targetDist <= currentDist + seg.length || seg === segments[segments.length - 1]) {
        const segDist = targetDist - currentDist;
        const t = seg.length > 0 ? segDist / seg.length : 0;
        const x = seg.p1.x + (seg.p2.x - seg.p1.x) * t;
        const y = seg.p1.y + (seg.p2.y - seg.p1.y) * t;
        const angle = Math.atan2(seg.p2.y - seg.p1.y, seg.p2.x - seg.p1.x) * (180 / Math.PI);
        return { x, y, angle };
      }
      currentDist += seg.length;
    }
    const last = points[points.length - 1];
    return { x: last.x, y: last.y, angle: 0 };
  };
  const routeId = activeOrder?.routeId ?? 0;
  const route = ROUTE_VARIANTS[routeId] || ROUTE_VARIANTS[0];
  const coords = getPointAlongRoute(route, progress);
  const pathD = route.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const getIncidentCoords = () => {
    if (!activeOrder?.activeIncident) return null;
    const prog = activeOrder.deliveryProgress;
    let incidentProgress = prog;
    if (activeOrder.activeIncident.type === "gps" || activeOrder.activeIncident.type === "kitchenSort" || activeOrder.activeIncident.type === "heatSync") {
      incidentProgress = Math.min(prog, 25);
    } else if (activeOrder.activeIncident.type === "pothole" || activeOrder.activeIncident.type === "signalJam" || activeOrder.activeIncident.type === "cargoBalance") {
      incidentProgress = Math.min(prog, 55);
    } else {
      incidentProgress = Math.min(prog, 85);
    }
    const pt = getPointAlongRoute(route, incidentProgress);
    return { x: pt.x, y: pt.y };
  };
  const incidentCoords = getIncidentCoords();
  return (
    <div className="relative w-full max-w-lg mx-auto bg-zinc-950 border border-zinc-800 rounded-3xl p-6 overflow-hidden aspect-[400/220]">
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* SVG Canvas */}
      <svg
        viewBox="0 0 400 200"
        className="w-full h-full relative z-10 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Grid Lines (Neon Vibe) */}
        <line x1="20" y1="20" x2="380" y2="20" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="20" y1="80" x2="380" y2="80" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="20" y1="140" x2="380" y2="140" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* The Cyber-Road Map Grid */}
        <path
          d={pathD}
          fill="none"
          stroke="#18181b"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* The active neon delivery path */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#neonGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shadow-[0_0_15px_#00f0ff]"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="neonGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff007f" />
            <stop offset="50%" stopColor="#9d4edd" />
            <stop offset="100%" stopColor="#00f0ff" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Restaurant Icon Node */}
        <g transform="translate(40, 160)" className="cursor-pointer">
          <circle cx="0" cy="0" r="14" fill="#09090b" stroke="#ff007f" strokeWidth="2.5" className="animate-pulse" />
          <foreignObject x="-8" y="-8" width="16" height="16">
            <Store className="h-4 w-4 text-neon-pink text-neon-glow-pink" />
          </foreignObject>
        </g>

        {/* User House Capsule Node */}
        <g transform="translate(360, 40)">
          <circle cx="0" cy="0" r="16" fill="#09090b" stroke="#39ff14" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="24" fill="none" stroke="#39ff14" strokeWidth="1" strokeDasharray="3 3" className="animate-spin" style={{ transformOrigin: "360px 40px", animationDuration: "10s" }} />
          <foreignObject x="-8" y="-8" width="16" height="16">
            <Home className="h-4 w-4 text-neon-green" />
          </foreignObject>
        </g>

        {/* Pulse Glow/Warning for active incidents */}
        {incidentCoords && (
          <g transform={`translate(${incidentCoords.x}, ${incidentCoords.y})`}>
            <circle cx="0" cy="0" r="18" fill="none" stroke="#ff0055" strokeWidth="1.5" className="animate-ping" style={{ transformOrigin: `${incidentCoords.x}px ${incidentCoords.y}px`, animationDuration: "1.5s" }} />
            <circle cx="0" cy="0" r="10" fill="#09090b" stroke="#ff0055" strokeWidth="2" className="shadow-[0_0_10px_#ff0055]" />
            <path d="M 0 -4 L 0 1 M 0 3 L 0 4" stroke="#ff0055" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Pulse Glow beneath Courier */}
        <circle cx={coords.x} cy={coords.y} r="20" fill="url(#glow)" className="animate-ping" style={{ animationDuration: "2s" }} />

        {/* Moving Courier Icon */}
        <g
          transform={`translate(${coords.x}, ${coords.y}) rotate(${coords.angle})`}
          style={{ transition: "transform 0.1s linear" }}
        >
          <rect x="-14" y="-14" width="28" height="28" rx="8" fill="#09090b" stroke="#00f0ff" strokeWidth="2" className="shadow-[0_0_10px_#00f0ff]" />
          <foreignObject x="-7" y="-7" width="14" height="14" transform="rotate(0)">
            <Bot className="h-3.5 w-3.5 text-neon-cyan text-neon-glow-cyan" />
          </foreignObject>
        </g>
      </svg>

      {/* Progress display overlay */}
      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 z-25">
        <span>Mega Burger Corp</span>
        <span className="text-neon-cyan">{progress.toFixed(0)}% Dispatched</span>
        <span>Your Capsule</span>
      </div>
    </div>
  );
};

export default TrackingMap;
