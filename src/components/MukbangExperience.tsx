import React, { useEffect, useState, useRef, useMemo } from "react";
import { Order } from "@/context/StateContext";
import { useAudio } from "@/context/AudioContext";
import { formatCash, scrambleOptions } from "@/lib/currency";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import {
  summarizeMukbangOrder,
  buildFoodDisplayItems,
  calculateMukbangPayout,
  FoodDisplayItem,
  PhaseResult
} from "@/lib/mukbang";

interface MukbangExperienceProps {
  activeOrder: Order;
  onComplete: (result: { payout: number; score: number }) => void;
}

type VideoPhase = "intro" | "plating" | "bite" | "hype" | "result";

interface ChatPrompt {
  text: string;
  emoji: string;
}

const CHAT_PROMPTS: ChatPrompt[] = [
  { text: "OMG SO SPICY!", emoji: "🔥" },
  { text: "THIS IS INSANE!", emoji: "🤯" },
  { text: "SO YUMMY!", emoji: "😋" },
  { text: "MIND BLOWN!", emoji: "🧠" },
  { text: "CHEESY HEAVEN!", emoji: "🧀" },
  { text: "STUFFED!", emoji: "🤮" },
  { text: "BEST STREAM EVER!", emoji: "💖" },
  { text: "DRINK WATER!", emoji: "🥤" },
];

export function MukbangExperience({ activeOrder, onComplete }: MukbangExperienceProps) {
  const { play } = useAudio();

  const [videoPhase, setVideoPhase] = useState<VideoPhase>("intro");
  const [platingSequence, setPlatingSequence] = useState<FoodDisplayItem[]>([]);
  const [platingProgress, setPlatingProgress] = useState<number>(0);
  const [platingMistakes, setPlatingMistakes] = useState<number>(0);
  const [biteSequence, setBiteSequence] = useState<string[]>([]);
  const [biteOptions, setBiteOptions] = useState<string[]>([]);
  const [biteProgress, setBiteProgress] = useState<number>(0);
  const [biteMistakes, setBiteMistakes] = useState<number>(0);
  const [hypeSequence, setHypeSequence] = useState<ChatPrompt[]>([]);
  const [hypeProgress, setHypeProgress] = useState<number>(0);
  const [hypeMistakes, setHypeMistakes] = useState<number>(0);
  const [hypeOptions, setHypeOptions] = useState<string[]>([]);
  const [platingResult, setPlatingResult] = useState<PhaseResult | null>(null);
  const [biteResult, setBiteResult] = useState<PhaseResult | null>(null);
  const [hypeResult, setHypeResult] = useState<PhaseResult | null>(null);
  const [mukbangResult, setMukbangResult] = useState<{
    score: number;
    accuracy: number;
    payout: number;
    perfect: boolean;
    duration: number;
  } | null>(null);

  const lastOrderId = useRef<string | null>(null);

  const foodDisplayItems = useMemo(() => buildFoodDisplayItems(activeOrder.items), [activeOrder.items]);
  const orderSummary = useMemo(() => summarizeMukbangOrder(activeOrder.items), [activeOrder.items]);

  useEffect(() => {
    if (activeOrder.id && activeOrder.id !== lastOrderId.current) {
      lastOrderId.current = activeOrder.id;
      setVideoPhase("intro");
      setPlatingSequence([]);
      setPlatingProgress(0);
      setPlatingMistakes(0);
      setBiteSequence([]);
      setBiteOptions([]);
      setBiteProgress(0);
      setBiteMistakes(0);
      setHypeSequence([]);
      setHypeProgress(0);
      setHypeMistakes(0);
      setHypeOptions([]);
      setPlatingResult(null);
      setBiteResult(null);
      setHypeResult(null);
      setMukbangResult(null);
    }
  }, [activeOrder.id]);

  const startMukbang = () => {
    play("pop");
    setPlatingSequence(foodDisplayItems);
    setPlatingProgress(0);
    setPlatingMistakes(0);
    setVideoPhase("plating");
  };

  const handlePlatingTap = (name: string) => {
    const target = platingSequence[platingProgress];
    if (!target) return;
    if (name === target.name) {
      play("pop");
      const nextProgress = platingProgress + 1;
      setPlatingProgress(nextProgress);
      if (nextProgress >= platingSequence.length) {
        const result: PhaseResult = {
          score: Math.max(10, 100 - platingMistakes * 10),
          mistakes: platingMistakes,
          perfect: platingMistakes === 0
        };
        setPlatingResult(result);
        const pool = ["↑", "↓", "←", "→", "A", "B", "7", "3", "9"];
        const seqLength = 5 + Math.min(foodDisplayItems.length, 10);
        const seq: string[] = [];
        for (let i = 0; i < seqLength; i++) {
          seq.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        setBiteSequence(seq);
        const opts = scrambleOptions(Array.from(new Set(seq)), pool);
        setBiteOptions(opts);
        setBiteProgress(0);
        setBiteMistakes(0);
        setVideoPhase("bite");
      }
    } else {
      play("horn");
      setPlatingMistakes(prev => prev + 1);
    }
  };

  const handleBiteTap = (symbol: string) => {
    const targetSymbol = biteSequence[biteProgress];
    if (symbol === targetSymbol) {
      play("pop");
      const nextProgress = biteProgress + 1;
      setBiteProgress(nextProgress);
      if (nextProgress >= biteSequence.length) {
        const result: PhaseResult = {
          score: Math.max(10, 100 - biteMistakes * 12),
          mistakes: biteMistakes,
          perfect: biteMistakes === 0
        };
        setBiteResult(result);
        const shuffledPrompts = [...CHAT_PROMPTS].sort(() => Math.random() - 0.5);
        const selectedPrompts = shuffledPrompts.slice(0, 4);
        setHypeSequence(selectedPrompts);
        setHypeProgress(0);
        setHypeMistakes(0);
        const targetEmojis = selectedPrompts.map(p => p.emoji);
        const allEmojisPool = ["🔥", "🤯", "😋", "🧠", "🧀", "🤮", "💖", "🥤", "🌶️", "🍗", "🍟", "🍦"];
        const opts = scrambleOptions(Array.from(new Set(targetEmojis)), allEmojisPool);
        setHypeOptions(opts);
        setVideoPhase("hype");
      }
    } else {
      play("horn");
      setBiteMistakes(prev => prev + 1);
    }
  };

  const handleHypeTap = (emoji: string) => {
    const target = hypeSequence[hypeProgress];
    if (!target) return;
    if (emoji === target.emoji) {
      play("pop");
      const nextProgress = hypeProgress + 1;
      setHypeProgress(nextProgress);
      if (nextProgress >= hypeSequence.length) {
        const currentHypeResult: PhaseResult = {
          score: Math.max(10, 100 - hypeMistakes * 15),
          mistakes: hypeMistakes,
          perfect: hypeMistakes === 0
        };
        setHypeResult(currentHypeResult);
        const orderCost = activeOrder.orderCost || 15;
        const summary = orderSummary;
        const allResults = [platingResult!, biteResult!, currentHypeResult];
        const finalPayout = calculateMukbangPayout(orderCost, summary, allResults);
        const avgScore = Math.round((platingResult!.score + biteResult!.score + currentHypeResult.score) / 3);
        const avgMistakes = (platingResult!.mistakes + biteResult!.mistakes + currentHypeResult.mistakes) / 3;
        const totalMistakes = platingResult!.mistakes + biteResult!.mistakes + currentHypeResult.mistakes;
        setMukbangResult({
          score: avgScore,
          accuracy: totalMistakes === 0 ? 100 : Math.max(10, Math.round((1 - avgMistakes / 5) * 100)),
          payout: finalPayout,
          perfect: totalMistakes === 0,
          duration: 0
        });
        setVideoPhase("result");
        play("rankup");
      }
    } else {
      play("horn");
      setHypeMistakes(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (videoPhase !== "bite" || mukbangResult) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      let keySym = "";
      if (e.key === "ArrowUp") keySym = "↑";
      else if (e.key === "ArrowDown") keySym = "↓";
      else if (e.key === "ArrowLeft") keySym = "←";
      else if (e.key === "ArrowRight") keySym = "→";
      else if (e.key.toUpperCase() === "A") keySym = "A";
      else if (e.key.toUpperCase() === "B") keySym = "B";
      else if (e.key === "7") keySym = "7";
      else if (e.key === "3") keySym = "3";
      else if (e.key === "9") keySym = "9";
      if (keySym) {
        handleBiteTap(keySym);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [videoPhase, mukbangResult, biteProgress, biteSequence, biteMistakes]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full space-y-4"
    >
      {videoPhase !== "result" && (
        <div className="relative min-h-[320px] sm:min-h-[360px] md:aspect-video md:min-h-0 w-full rounded-2xl bg-zinc-950 border-4 border-neon-pink overflow-hidden shadow-[0_0_20px_rgba(255,0,127,0.2)]">
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20 pointer-events-none">
            <div className="flex items-center space-x-1.5 bg-black/60 px-2 py-1 rounded-md border border-neon-pink/30 pointer-events-auto">
              <span className="h-2 w-2 rounded-full bg-neon-pink animate-pulse" />
              <span className="text-[10px] font-black text-neon-pink tracking-widest uppercase">REC</span>
            </div>
            <div className="text-[9px] font-bold text-zinc-400 bg-black/60 px-2 py-1 rounded-md border border-zinc-800 pointer-events-auto">
              LIVE VIEWS: {(1200 + (activeOrder.orderCost || 15) * 150 + platingProgress * 1500).toLocaleString()}
            </div>
          </div>

          <div className="absolute inset-0 z-0 flex flex-col justify-end items-center px-3 pt-16 pb-24 pointer-events-none">
            <div className="relative flex flex-col items-center select-none mb-[-12px] pointer-events-auto">
              <div className="w-16 h-16 rounded-full bg-neon-purple/20 border-2 border-neon-purple flex items-center justify-center text-4xl shadow-[0_0_15px_rgba(188,19,254,0.3)]">
                🧑‍🍳
              </div>
              <div className="w-24 h-12 rounded-t-3xl bg-zinc-800 border-t border-x border-zinc-700 mt-[-4px]" />
            </div>

            <div className="w-full h-24 sm:h-28 bg-zinc-900/90 border-t-2 border-neon-cyan relative flex flex-col items-center justify-center px-4 shadow-lg z-10 pointer-events-auto">
              <div className="text-[9px] text-zinc-500 font-black tracking-widest absolute top-1 uppercase">Mukbang Table</div>
              <div className="flex flex-wrap justify-center gap-1.5 max-w-full overflow-hidden max-h-[72px] mt-3">
                {foodDisplayItems.slice(0, 12).map((item, idx) => {
                  let emoji = "🍔";
                  if (item.type === "burger") emoji = "🍔";
                  else if (item.type === "fries") emoji = "🍟";
                  else if (item.type === "sushi") emoji = "🍣";
                  else if (item.type === "pizza") emoji = "🍕";
                  else if (item.type === "taco") emoji = "🌮";
                  else if (item.type === "dessert") emoji = "🍰";
                  else if (item.type === "drink") emoji = "🥤";
                  else emoji = "🍱";
                  const isPlated = videoPhase !== "plating" || idx < platingProgress;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={isPlated ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0.3 }}
                      className={`relative h-10 w-10 rounded-full bg-zinc-950 border flex items-center justify-center text-2xl shadow-md ${
                        isPlated ? "border-neon-yellow/30" : "border-zinc-900"
                      }`}
                    >
                      <span>{emoji}</span>
                    </motion.div>
                  );
                })}
                {orderSummary.overflowCount > 0 && (
                  <div className="h-10 w-10 rounded-full bg-zinc-950 border border-neon-cyan/30 flex items-center justify-center text-[9px] font-black text-neon-cyan shadow-md">
                    +{orderSummary.overflowCount}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 z-20 grid grid-cols-3 gap-1 bg-black/60 backdrop-blur-sm p-1.5 rounded-lg border border-zinc-800 pointer-events-none">
            <div className="text-[9px] font-black text-neon-cyan uppercase text-center">
              Variety: {orderSummary.foodTypeCount} Types
            </div>
            <div className="text-[9px] font-black text-neon-yellow uppercase text-center">
              Count: {orderSummary.totalQuantity} items
            </div>
            <div className={`text-[9px] font-black uppercase text-center ${orderSummary.diversityMultiplier >= 1 ? "text-neon-green" : "text-neon-pink animate-pulse"}`}>
              {orderSummary.diversityMultiplier >= 1 ? `Multiplier: x${orderSummary.diversityMultiplier.toFixed(2)}` : `Low Variety Penalty!`}
            </div>
          </div>
        </div>
      )}

      {videoPhase === "intro" && !mukbangResult && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 text-center">
          <div className="p-3.5 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-bold">
            🎉 Delivery capsule secured! Ready to film the mukbang?
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-sm uppercase tracking-wider text-white">🔴 Film Creator Video</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Set up the food table, eat combos, and keep the chat hyped to maximize your Creator Cash!
            </p>
          </div>
          <button
            onClick={startMukbang}
            className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider text-black bg-neon-yellow shadow-[0_0_15px_rgba(255,231,0,0.3)] hover:shadow-[0_0_25px_rgba(255,231,0,0.6)] hover:scale-102 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <span>Start Recording 🎥</span>
          </button>
        </div>
      )}
      {videoPhase === "plating" && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-neon-cyan space-y-4 text-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
            <span className="text-[10px] font-black text-neon-cyan animate-pulse">🎬 PHASE 1: TABLE PLATING</span>
            <span className="text-[10px] font-bold text-zinc-500">Mistakes: <strong className="text-neon-pink">{platingMistakes}</strong></span>
          </div>
          <div className="space-y-2 py-3 bg-zinc-950 rounded-xl border border-zinc-850">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Plating Target Item</p>
            {platingSequence[platingProgress] ? (
              <motion.div
                key={platingProgress}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-lg font-black text-white"
              >
                Place: <span className="text-neon-yellow">{platingSequence[platingProgress].name}</span>
              </motion.div>
            ) : (
              <div className="text-sm font-bold text-neon-green">Ready!</div>
            )}
            <p className="text-[9px] text-zinc-500 font-medium">Tap the matching button to place it on the table</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from(new Set(platingSequence.map(item => item.name))).map((name, idx) => (
              <button
                key={idx}
                onClick={() => handlePlatingTap(name)}
                className="py-3 px-2 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-neon-cyan hover:text-neon-cyan text-white text-xs font-black transition-all active:scale-[0.95] leading-normal"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
      {videoPhase === "bite" && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-neon-pink space-y-4 text-center shadow-[0_0_15px_rgba(255,0,127,0.2)]">
          <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
            <span className="text-[10px] font-black text-neon-pink animate-pulse">🎬 PHASE 2: BITE COMBO</span>
            <span className="text-[10px] font-bold text-zinc-500">Mistakes: <strong className="text-neon-pink">{biteMistakes}</strong></span>
          </div>
          <div className="space-y-2 py-3 bg-zinc-950 rounded-xl border border-zinc-850">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Bite Combo Sequence</p>
            <div className="flex space-x-1.5 justify-center overflow-x-auto py-1">
              {biteSequence.map((sym, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center justify-center h-8 w-8 rounded-lg font-black text-sm border shrink-0 ${
                    idx < biteProgress
                      ? "bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_8px_rgba(57,255,20,0.3)]"
                      : idx === biteProgress
                      ? "bg-neon-pink/20 border-neon-pink text-neon-pink animate-pulse"
                      : "bg-zinc-900 border-zinc-800 text-zinc-600"
                  }`}
                >
                  {sym}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {biteOptions.map((sym, idx) => (
              <button
                key={idx}
                onClick={() => handleBiteTap(sym)}
                className="py-3.5 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-neon-pink hover:text-neon-pink text-white text-lg font-black transition-all active:scale-[0.93]"
              >
                {sym}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-zinc-500 font-medium">
            Hint: Use arrow keys, letters, and numbers on your keyboard to play!
          </p>
        </div>
      )}
      {videoPhase === "hype" && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-neon-yellow space-y-4 text-center shadow-[0_0_15px_rgba(255,231,0,0.2)]">
          <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
            <span className="text-[10px] font-black text-neon-yellow animate-pulse">🎬 PHASE 3: CHAT HYPE</span>
            <span className="text-[10px] font-bold text-zinc-500">Mistakes: <strong className="text-neon-pink">{hypeMistakes}</strong></span>
          </div>
          <div className="space-y-2 py-3 bg-zinc-950 rounded-xl border border-zinc-850">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Chat Prompt</p>
            {hypeSequence[hypeProgress] ? (
              <motion.div
                key={hypeProgress}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-lg font-black text-white"
              >
                {hypeSequence[hypeProgress].text}{" "}
                <span className="text-neon-yellow text-neon-glow-yellow font-sans">
                  (Tap {hypeSequence[hypeProgress].emoji})
                </span>
              </motion.div>
            ) : (
              <div className="text-sm font-bold text-neon-green">Hyped!</div>
            )}
            <p className="text-[9px] text-zinc-500 font-medium">Select the matching emoji from the options below</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {hypeOptions.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => handleHypeTap(emoji)}
                className="py-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-neon-yellow hover:text-neon-yellow text-2xl transition-all active:scale-[0.93]"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      {videoPhase === "result" && mukbangResult && (
        <div className="p-5 rounded-2xl bg-zinc-900 border border-neon-green space-y-4 text-center shadow-[0_0_15px_rgba(57,255,20,0.2)]">
          <div className="space-y-1">
            <h3 className="font-black text-sm uppercase tracking-wider text-neon-green">🎥 Video Uploaded!</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Your three-phase mukbang stream went viral! Here is your performance breakdown:
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 text-xs text-left">
            <div className="text-zinc-500 font-medium">Avg Clout Score:</div>
            <div className="font-black text-white text-right">{mukbangResult.score}/100</div>
            <div className="text-zinc-500 font-medium">Overall Accuracy:</div>
            <div className="font-black text-white text-right">{mukbangResult.accuracy}%</div>
            <div className="text-zinc-400 font-bold border-t border-zinc-850 pt-2 mt-1">Creator Payout:</div>
            <div className="font-black text-neon-yellow text-right border-t border-zinc-850 pt-2 mt-1 text-base">
              {formatCash(mukbangResult.payout)}
            </div>
          </div>
          <div className="text-left text-[10px] text-zinc-500 space-y-1 bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-850/80">
            <div className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] mb-1.5">Phase Report Card:</div>
            {platingResult && (
              <div className="flex justify-between">
                <span>Plating Setup:</span>
                <span className="font-bold text-white">
                  {platingResult.score}/100 ({platingResult.mistakes} mistakes)
                </span>
              </div>
            )}
            {biteResult && (
              <div className="flex justify-between">
                <span>Bite Combo:</span>
                <span className="font-bold text-white">
                  {biteResult.score}/100 ({biteResult.mistakes} mistakes)
                </span>
              </div>
            )}
            {hypeResult && (
              <div className="flex justify-between">
                <span>Audience Hype:</span>
                <span className="font-bold text-white">
                  {hypeResult.score}/100 ({hypeResult.mistakes} mistakes)
                </span>
              </div>
            )}
          </div>
          {mukbangResult.perfect && (
            <div className="text-xs font-black text-neon-yellow animate-bounce py-1">
              🏆 PERFECT COMBO BONUS! 🏆
            </div>
          )}
          <button
            onClick={() => onComplete({ payout: mukbangResult.payout, score: mukbangResult.score })}
            className="w-full py-4 px-2 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black bg-neon-green shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.6)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <span className="text-center truncate">Collect Payout & Go to Rewards</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
