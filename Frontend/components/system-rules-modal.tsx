"use client";

import React, { useState } from "react";

function GuideSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="system-card p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-3 space-y-3 text-sm leading-6 text-slate-300">{children}</div>
    </section>
  );
}

export default function SystemRulesModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-4xl">
            <div className="system-panel max-h-[88vh] overflow-y-auto p-5 sm:p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <p className="system-eyebrow">XP System V2 (Beta)</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                    Welcome Hunter
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    This is a productivity system inspired by RPG progression. Every action has consequences, completing quests rewards consistency, while neglecting responsibilities results in penalties.
                  </p>
                </div>

                <GuideSection title="Quest Difficulties">
                  <div>
                    <p className="font-semibold text-emerald-300">Easy Quest</p>
                    <p>+50 XP if completed.</p>
                    <p>-50 XP if missed.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-300">Medium Quest</p>
                    <p>+100 XP if completed.</p>
                    <p>-100 XP if missed.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-rose-300">Hard Quest</p>
                    <p>+150 XP if completed.</p>
                    <p>-150 XP if missed.</p>
                  </div>
                </GuideSection>

                <GuideSection title="Quest Types">
                  <div>
                    <p className="font-semibold text-white">Daily</p>
                    <p>Resets every day.</p>
                    <p>Missing one counts as a failed day.</p>
                    <p>Auto regenerates every day.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">One-Time</p>
                    <p>Must be completed before a set deadline.</p>
                    <p>Does not regenerate.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Scheduled</p>
                    <p>You can set the weekdays you want this quest on.</p>
                    <p>It auto regenerates on those weekdays.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Weekly</p>
                    <p>Deadline at the end of a week.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Monthly</p>
                    <p>Deadline at the end of the month.</p>
                  </div>
                </GuideSection>

                <GuideSection title="Levels and XP">
                  <p>Complete quests to earn XP and gain levels.</p>
                </GuideSection>

                <GuideSection title="Penalties">
                  <p>Missed quests result in penalties which deduct XP and may result in level regression.</p>
                </GuideSection>

                <GuideSection title="XP Logs">
                  <p>You can review all missed or completed quests here.</p>
                </GuideSection>

                <GuideSection title="Beta Notice">
                  <p>This system is under development.</p>
                  <p>
                    This version is available to specific testers only and focuses only on basic and core progression without any cosmetic features.
                  </p>
                  <div>
                    <p className="font-semibold text-violet-200">Planned updates include:</p>
                    <ul className="mt-2 space-y-1 text-slate-300">
                      <li>Better and enhanced UI</li>
                      <li>Ranks, actual ranks</li>
                      <li>Reward system</li>
                      <li>Making the system alive (most interesting one)</li>
                    </ul>
                  </div>
                </GuideSection>

                <div className="space-y-4 text-center">
                  <p className="text-base font-semibold uppercase tracking-[0.18em] text-violet-200">
                    Failure is recorded, success is rewarded.
                  </p>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    Do you have what it takes?
                  </p>
                  <div className="flex justify-center">
                    <button
                      className="system-button-primary w-full max-w-sm"
                      onClick={() => setOpen(false)}
                    >
                      Enter System
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 sm:bottom-6">
        <button
          className="system-button-secondary min-w-32 shadow-[0_16px_40px_rgba(34,16,70,0.45)]"
          onClick={() => setOpen(true)}
        >
          Guide
        </button>
      </div>
    </>
  );
}
