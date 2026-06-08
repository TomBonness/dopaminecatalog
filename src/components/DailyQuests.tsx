import { QuestProgress, useAppState } from "@/context/StateContext";

const QUEST_ORDER: Array<keyof QuestProgress> = [
  "dopamineFeast",
  "turboBoost",
  "serotoninScratch",
  "crisisManager",
];

export function DailyQuests() {
  const { questProgress, questClaimed, questConfig, claimQuestReward } = useAppState();

  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400">
        Daily Dopamine Quest
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUEST_ORDER.map((questId) => {
          const config = questConfig[questId];
          const progress = questProgress[questId];
          const claimed = questClaimed[questId];
          const complete = progress >= config.target;
          const percent = Math.min(100, Math.round((progress / Math.max(config.target, 1)) * 100));

          return (
            <div
              key={questId}
              className="flex flex-col justify-between p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all duration-200"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-black text-base text-white leading-tight">
                    {config.title}
                  </h4>
                  <span className="text-xs font-black text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
                    {progress}/{config.target}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {config.desc}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-[10px] font-black text-neon-cyan uppercase tracking-wider">
                    +{config.xp} XP
                  </span>
                  <span className="px-2 py-0.5 rounded bg-neon-yellow/10 border border-neon-yellow/30 text-[10px] font-black text-neon-yellow uppercase tracking-wider">
                    +${config.coins}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3 pt-3 border-t border-zinc-800">
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="bg-neon-pink h-full transition-all duration-300 shadow-[0_0_8px_rgba(255,0,127,0.5)]"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {claimed ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-zinc-500 bg-zinc-800 cursor-not-allowed border border-zinc-700/50"
                  >
                    Claimed
                  </button>
                ) : complete ? (
                  <button
                    onClick={() => claimQuestReward(questId)}
                    className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-black bg-neon-yellow shadow-[0_0_10px_rgba(255,231,0,0.2)] hover:shadow-[0_0_20px_rgba(255,231,0,0.5)] hover:scale-[1.01] active:scale-95 transition-all"
                  >
                    Claim Reward
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-zinc-500 bg-zinc-800 cursor-not-allowed border border-zinc-700/50"
                  >
                    In Progress
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
