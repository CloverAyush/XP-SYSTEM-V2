"use client";

import React, { useEffect, useState } from "react";

export default function SystemRulesModal() {
  const [open, setOpen] = useState(true);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    // Placeholder for persisting dismissal in the future
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <div className="relative w-full max-w-3xl">
        <div className="system-panel p-6">
          <div className="space-y-6">
            <div>
              <p className="system-eyebrow">System Rules</p>
              <h2 className="mt-3 system-title">Welcome Hunter</h2>
              <p className="mt-3 text-sm text-slate-300">FAILURE IS RECORDED, <span className="font-semibold">SUCCESS IS REWARDED.</span></p>
            </div>

            <div>
              {showRules ? (
                <div className="system-card p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">⚔️</div>
                      <h3 className="text-lg font-semibold">Rules</h3>
                    </div>

                    <ol className="space-y-4">
                      <li>
                        <div className="text-sm sm:text-base">
                          <span className="font-semibold">Quests have consequences:</span>
                          <div className="mt-1 text-slate-300">Incomplete quests may result in penalties.</div>
                        </div>
                      </li>

                      <li>
                        <div className="text-sm sm:text-base">
                          <span className="font-semibold">Deadlines are absolute:</span>
                          <div className="mt-1 text-slate-300">Quests must be completed before their assigned deadline.</div>
                        </div>
                      </li>

                      <li>
                        <div className="text-sm sm:text-base">
                          <span className="font-semibold">Consistency is rewarded:</span>
                          <div className="mt-1 text-slate-300">Daily completion compounds into long-term progression.</div>
                        </div>
                      </li>

                      <li>
                        <div className="text-sm sm:text-base">
                          <span className="font-semibold">Progress is recorded:</span>
                          <div className="mt-1 text-slate-300">Both successes and failures are tracked.</div>
                        </div>
                      </li>

                      <li>
                        <div className="text-sm sm:text-base">
                          <span className="font-semibold">The system does not negotiate.</span>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="system-card p-6 text-sm text-slate-400">Rules are hidden. Click "Display Rules" to view them.</div>
              )}

              <div className="mt-6 flex flex-col items-center gap-4">
                <button
                  className="system-button-primary w-full max-w-sm"
                  onClick={() => setOpen(false)}
                >
                  ENTER SYSTEM
                </button>

                <button
                  className="system-button-secondary"
                  onClick={() => setShowRules((s) => !s)}
                >
                  {showRules ? "Hide Rules" : "Display Rules"}
                </button>
              </div>

              <div className="mt-3 text-center text-sm text-slate-400">DO YOU HAVE WHAT IT TAKES?</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
