/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Play, Square, RefreshCw, CheckCircle, Wind, Volume2, Users, Fingerprint, Info, VolumeX, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BREATHING_TECHNIQUES } from "../utils/breathingData";
import { BreathingTechnique } from "../types";
import { AudioEngine } from "../utils/audioEngine";

// Dynamic atmospheric Zen illustration imports
// @ts-ignore
import defaultZenImg from "../assets/images/default_zen_1781442402470.jpg";
// @ts-ignore
import forestBreezeImg from "../assets/images/forest_breeze_1781442419383.jpg";
// @ts-ignore
import oceanTidesImg from "../assets/images/ocean_tides_1781442433646.jpg";
// @ts-ignore
import singingBowlImg from "../assets/images/singing_bowl_1781442447911.jpg";

// Map ambient sound options to custom visual focus environments
const SOUND_IMAGES: Record<string, string> = {
  none: defaultZenImg,
  brown_noise: forestBreezeImg,
  ocean_waves: oceanTidesImg,
  singing_bowl: singingBowlImg,
};

interface BreathingExerciseProps {
  onSessionComplete?: () => void;
}

type BreathPhase = "idle" | "inhale" | "hold1" | "exhale" | "hold2" | "completed";

// Live simulated companions to create group co-presence
const COMPANIONS = [
  { id: "comp1", name: "喜马拉雅雪雪", location: "拉萨", ritual: "雪山松风", bg: "bg-[#7A8C7C]" },
  { id: "comp2", name: "暖炉旁小猫公社", location: "上海", ritual: "猫腹起伏", bg: "bg-[#8BA88E]" },
  { id: "comp3", name: "清迈晨露修行人", location: "清迈", ritual: "林野晨呼吸", bg: "bg-[#4A5D4E]" },
  { id: "comp4", name: "和风古刹禅宗", location: "京都", ritual: "古刹扫叶", bg: "bg-[#3E4A3F]" }
];

export default function BreathingExercise({ onSessionComplete }: BreathingExerciseProps) {
  const [selectedTech, setSelectedTech] = useState<BreathingTechnique>(BREATHING_TECHNIQUES[0]);
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [targetCycles, setTargetCycles] = useState<number>(6); // Default to 6 cycles (~2 mins)
  const [enableSound, setEnableSound] = useState<boolean>(true);

  // Focus-enhancing features
  const [anchorMode, setAnchorMode] = useState<boolean>(false); // Physical touch anchoring mode
  const [isTouched, setIsTouched] = useState<boolean>(false); // Is tactile pad pressed
  const [selectedAmbientSound, setSelectedAmbientSound] = useState<string>("none"); // continuous ambient sound
  const [showGroupMode, setShowGroupMode] = useState<boolean>(true); // co-presence display

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      AudioEngine.stopAll();
    };
  }, []);

  // Handle ambient background sound dimming when user lets go in Anchor Mode
  useEffect(() => {
    if (phase !== "idle" && phase !== "completed" && selectedAmbientSound !== "none") {
      if (anchorMode && !isTouched) {
        // Paused -> Dim background sound to 0.05
        AudioEngine.setVolume(selectedAmbientSound, 0.04);
      } else {
        // Holding -> Restore sound to normal
        AudioEngine.setVolume(selectedAmbientSound, 0.22);
      }
    }
  }, [anchorMode, isTouched, phase, selectedAmbientSound]);

  // Core Timer Loop (Single source of truth interval)
  useEffect(() => {
    if (phase === "idle" || phase === "completed") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const isCurrentlyPaused = anchorMode && !isTouched;

    if (isCurrentlyPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handlePhaseTransition();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, anchorMode, isTouched]);

  const triggerChimeForPhase = (nextPhase: BreathPhase) => {
    if (!enableSound) return;
    if (nextPhase === "inhale") {
      AudioEngine.playChime(528, 1.2); // Transformation, high clear bell
    } else if (nextPhase === "hold1") {
      AudioEngine.playChime(432, 1.0); // Earth grounding key, deep resonance
    } else if (nextPhase === "exhale") {
      AudioEngine.playChime(396, 1.5); // Releasing tension key, comforting release
    } else if (nextPhase === "hold2") {
      AudioEngine.playChime(341, 0.8); // Shorter anchor chime
    }
  };

  const handleStart = () => {
    AudioEngine.init();
    setCycleCount(0);
    setPhase("inhale");
    setSecondsRemaining(selectedTech.inhale);
    setIsTouched(true); // default touch to start smoothly

    // Trigger ambient background sound
    if (selectedAmbientSound !== "none") {
      AudioEngine.startSound(selectedAmbientSound, 0.22);
    }
    triggerChimeForPhase("inhale");
  };

  const handleStop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPhase("idle");
    setSecondsRemaining(0);
    setIsTouched(false);
    // Stop ambient background sound
    if (selectedAmbientSound !== "none") {
      AudioEngine.stopSound(selectedAmbientSound);
    }
  };

  const handlePhaseTransition = () => {
    setPhase((current) => {
      let nextPhase: BreathPhase = "idle";
      let duration = 0;

      if (current === "inhale") {
        if (selectedTech.hold1 > 0) {
          nextPhase = "hold1";
          duration = selectedTech.hold1;
        } else {
          nextPhase = "exhale";
          duration = selectedTech.exhale;
        }
      } else if (current === "hold1") {
        nextPhase = "exhale";
        duration = selectedTech.exhale;
      } else if (current === "exhale") {
        if (selectedTech.hold2 > 0) {
          nextPhase = "hold2";
          duration = selectedTech.hold2;
        } else {
          return handleCycleCompletion();
        }
      } else if (current === "hold2") {
        return handleCycleCompletion();
      }

      setSecondsRemaining(duration);
      triggerChimeForPhase(nextPhase);
      return nextPhase;
    });
  };

  const handleCycleCompletion = () => {
    let finishedComp = false;
    setCycleCount((curr) => {
      const nextCycleNum = curr + 1;
      if (nextCycleNum >= targetCycles) {
        finishedComp = true;
        return curr;
      }
      return nextCycleNum;
    });

    if (finishedComp || cycleCount + 1 >= targetCycles) {
      // Practice completed!
      if (enableSound) {
        AudioEngine.playChime(528, 3.0); // Large long resonant complete bell
      }
      if (selectedAmbientSound !== "none") {
        AudioEngine.stopSound(selectedAmbientSound);
      }
      if (onSessionComplete) {
        onSessionComplete();
      }
      return "completed";
    } else {
      // Loop back to Inhale
      const nextPhase = "inhale";
      setSecondsRemaining(selectedTech.inhale);
      triggerChimeForPhase(nextPhase);
      return nextPhase;
    }
  };

  // Switch sound selection instantly on current active scene
  const handleAmbientSoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSound = e.target.value;
    const oldSound = selectedAmbientSound;
    setSelectedAmbientSound(nextSound);

    if (phase !== "idle" && phase !== "completed") {
      // Clean up previous sound
      if (oldSound !== "none") {
        AudioEngine.stopSound(oldSound);
      }
      // Start next sound
      if (nextSound !== "none") {
        AudioEngine.init();
        AudioEngine.startSound(nextSound, isTouched || !anchorMode ? 0.22 : 0.04);
      }
    }
  };

  // Get matching guide text and layout theme for current state
  const getPhaseInfo = () => {
    switch (phase) {
      case "inhale":
        return {
          title: "吸气 (Inhale)",
          instruction: "饱满缓慢地吸气，感知空气填满心胸...",
          color: "text-[#8BA88E]",
          bgGlow: "bg-[#8BA88E]/10 border-[#8BA88E]/40 text-[#3E4A3F]",
          scale: 1.6,
        };
      case "hold1":
        return {
          title: "屏气 (Hold)",
          instruction: "静止不动，安守在这宁静的深处...",
          color: "text-[#7A8C7C]",
          bgGlow: "bg-[#FAF7F2] border-[#8BA88E]/30 text-[#3E4A3F]",
          scale: 1.6, // maintain full scale
        };
      case "exhale":
        return {
          title: "呼气 (Exhale)",
          instruction: "放松口齿，把所有焦虑和沉重叹尽...",
          color: "text-[#4A5D4E]",
          bgGlow: "bg-[#E6E1D6]/40 border-[#8BA88E]/20 text-[#3E4A3F]",
          scale: 1.0, // shrink down
        };
      case "hold2":
        return {
          title: "空腹屏吸 (Hold Empty)",
          instruction: "在呼空的片刻里，体验轻盈和虚空安宁...",
          color: "text-[#7A8C7C]",
          bgGlow: "bg-[#E6E1D6]/10 border-[#E6E1D6]",
          scale: 1.0,
        };
      case "completed":
        return {
          title: "练习完成！",
          instruction: "感恩你对自我身心关怀的付出。现在深呼一口气，带走这份安定神思。",
          color: "text-[#8BA88E]",
          bgGlow: "bg-[#8BA88E]/15 border-[#8BA88E]/60 text-[#3E4A3F]",
          scale: 1.2,
        };
      default:
        return {
          title: "准备开始",
          instruction: "选择最想沉淀心灵的方式，点击下方按钮开始。",
          color: "text-[#7A8C7C]",
          bgGlow: "bg-[#FAF7F2] border-[#E6E1D6]",
          scale: 1.1,
        };
    }
  };

  const { title, instruction, color, bgGlow, scale } = getPhaseInfo();
  const isCurrentlyPaused = phase !== "idle" && phase !== "completed" && anchorMode && !isTouched;

  return (
    <div id="breathing-exercise-card" className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-3xl p-6 shadow-sm relative overflow-hidden transition-all">
      {/* Decorative background grid */}
      <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-[#8BA88E]/5 blur-3xl animate-pulse" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E6E1D6] pb-5 mb-5 gap-3">
        <div>
          <h2 id="breathing-card-title" className="text-xl font-serif italic font-medium tracking-tight text-[#3E4A3F] flex items-center gap-2">
            <Wind className="w-5 h-5 text-[#8BA88E] animate-pulse" />
            科学呼吸节奏器
          </h2>
          <p className="text-xs text-[#7A8C7C] mt-1 font-sans">
            减慢呼吸频度 · 缓解急性心慌 · 集中心灵注意力
          </p>
        </div>

        {/* Audio settings drop controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ambient soundtrack selector */}
          <div className="flex items-center gap-1.5 bg-[#F2EDE4]/60 border border-[#E6E1D6] rounded-xl px-2.5 py-1.5 text-xs text-[#4A5D4E]">
            <Volume2 className="w-3.5 h-3.5 text-[#8BA88E]" />
            <select
              value={selectedAmbientSound}
              onChange={handleAmbientSoundChange}
              className="bg-transparent border-none outline-none text-[11px] font-sans font-medium text-[#3E4A3F] cursor-pointer"
              title="设置背景助眠/静坐音频空间"
              id="ambient-select-box"
            >
              <option value="none">背景声: 无 (仅钟声)</option>
              <option value="brown_noise">⛰️ 褐噪：林野微风</option>
              <option value="ocean_waves">🌊 海浪：潮汐涌动</option>
              <option value="singing_bowl">🧘‍♂️ 颂钵：宇宙和弦</option>
            </select>
          </div>

          {/* Sound trigger button */}
          <button
            onClick={() => setEnableSound(!enableSound)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans border transition-all cursor-pointer ${
              enableSound
                ? "bg-[#8BA88E] border-[#8BA88E] text-white shadow-sm font-medium"
                : "bg-[#FAF7F2] border-[#E6E1D6] text-[#7A8C7C] hover:bg-[#E6E1D6]/40"
            }`}
            title={enableSound ? "关闭和音颂钵音效" : "开启和音颂钵音效"}
            id="sound-chime-toggle"
          >
            {enableSound ? <Volume2 className="w-3.5 h-3.5 text-white" /> : <VolumeX className="w-3.5 h-3.5 text-[#7A8C7C]" />}
            {enableSound ? "音效: 开启" : "音效: 关闭"}
          </button>
        </div>
      </div>

      {phase === "idle" ? (
        /* Configuration Panel */
        <div className="space-y-5">
          <p className="text-xs text-[#7A8C7C] leading-relaxed">
            通过主动调控吸气、屏气与呼气的长短，能够阻断大脑扁桃体的“逃跑”警报。如果你独自练习时<strong>难以集中注意力、容易思维跑神</strong>，请在下方勾选<strong>“手指物理贴合专注模式”</strong>或<strong>“同频呼吸场”</strong>。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="breathing-tech-choices">
            {BREATHING_TECHNIQUES.map((tech) => (
              <button
                key={tech.id}
                onClick={() => setSelectedTech(tech)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  selectedTech.id === tech.id
                    ? "bg-[#F2EDE4] border-[#8BA88E] shadow-sm"
                    : "bg-[#FAF7F2] border-[#E6E1D6]/70 hover:border-[#8BA88E]/30 hover:bg-[#F2EDE4]/30"
                }`}
                id={`tech-selector-${tech.id}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[#3E4A3F]">{tech.name}</span>
                  <span
                    className={`text-[9px] uppercase px-2 py-0.5 rounded-full ${
                      tech.difficulty === "Beginner"
                        ? "bg-[#8BA88E]/10 text-[#4A5D4E] border border-[#8BA88E]/30 font-medium"
                        : tech.difficulty === "Intermediate"
                        ? "bg-[#E6E1D6] text-[#4A5D4E] border border-[#E6E1D6]"
                        : "bg-[#F2EDE4] text-[#3E4A3F] border border-[#E6E1D6]"
                    }`}
                  >
                    {tech.difficulty === "Beginner" ? "入门" : tech.difficulty === "Intermediate" ? "进阶" : "资深"}
                  </span>
                </div>
                <p className="text-xs text-[#7A8C7C] mt-2 line-clamp-2 leading-relaxed h-8">
                  {tech.description}
                </p>
                <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-[#7A8C7C] border-t border-[#E6E1D6] pt-2.5">
                  <span>吸 {tech.inhale}s</span>
                  {tech.hold1 > 0 && <span>· 屏 {tech.hold1}s</span>}
                  <span>· 呼 {tech.exhale}s</span>
                  {tech.hold2 > 0 && <span>· 屏 {tech.hold2}s</span>}
                </div>
              </button>
            ))}
          </div>

          {/* ADDED FOCUS ENHANCEMENT TOOLS SELECTOR */}
          <div className="bg-[#F2EDE4]/50 border border-[#E6E1D6] rounded-2xl p-4 space-y-3">
            <span className="text-xs text-[#3E4A3F] font-serif italic font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8BA88E]" />
              心灵防跑神强化器 (Focus Stabilizers)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="focus-stablizers-grid">
              {/* Anchor Mode Toggle */}
              <label
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                  anchorMode
                    ? "bg-[#FAF7F2] border-[#8BA88E]/80 shadow-xs"
                    : "bg-[#FAF7F2]/40 border-[#E6E1D6] hover:bg-[#FAF7F2]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={anchorMode}
                  onChange={(e) => setAnchorMode(e.target.checked)}
                  className="mt-0.5 accent-[#8BA88E] w-3.5 h-3.5"
                  id="anchor-mode-checkbox"
                />
                <div>
                  <span className="text-xs font-semibold text-[#3E4A3F] flex items-center gap-1">
                    <Fingerprint className="w-3.5 h-3.5 text-[#8BA88E]" />
                    手指贴合感官锚定
                  </span>
                  <p className="text-[10px] text-[#7A8C7C] mt-0.5 leading-relaxed">
                    在练习中，你需要手指轻按住中央吸气、抬起呼气。若思想跑神手指滑落，练习将“温柔暂停”。
                  </p>
                </div>
              </label>

              {/* Group Companion Mode Toggle */}
              <label
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                  showGroupMode
                    ? "bg-[#FAF7F2] border-[#8BA88E]/80 shadow-xs"
                    : "bg-[#FAF7F2]/40 border-[#E6E1D6] hover:bg-[#FAF7F2]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={showGroupMode}
                  onChange={(e) => setShowGroupMode(e.target.checked)}
                  className="mt-0.5 accent-[#8BA88E] w-3.5 h-3.5"
                  id="group-mode-checkbox"
                />
                <div>
                  <span className="text-xs font-semibold text-[#3E4A3F] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#8BA88E]" />
                    同频自愈能量呼吸场
                  </span>
                  <p className="text-[10px] text-[#7A8C7C] mt-0.5 leading-relaxed">
                    将有 4 位在线虚拟修行者以完全相同的胸腔律动与你在一张画面中同频一呼一吸，陪你度过。
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Setup Slider & Launch */}
          <div className="bg-[#F2EDE4]/30 border border-[#E6E1D6] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#7A8C7C] font-mono">设置目标训练时长：</span>
              <div className="flex items-center gap-2 mt-1.5">
                {[4, 6, 12, 18].map((cycles) => {
                  const minutes = Math.round((cycles * (selectedTech.inhale + selectedTech.hold1 + selectedTech.exhale + selectedTech.hold2)) / 60);
                  return (
                    <button
                      key={cycles}
                      onClick={() => setTargetCycles(cycles)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                        targetCycles === cycles
                          ? "bg-[#8BA88E] border-[#8BA88E] text-white shadow-sm"
                          : "bg-[#FAF7F2] border-[#E6E1D6] text-[#7A8C7C] hover:bg-[#E6E1D6]/50"
                      }`}
                      id={`cycle-select-${cycles}`}
                    >
                      {cycles}圈 ({minutes === 0 ? "<1" : minutes}分钟)
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleStart}
              className="px-6 py-3 rounded-xl bg-[#8BA88E] hover:bg-[#7A987D] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer self-stretch sm:self-auto border border-[#8BA88E]"
              id="start-breathing"
            >
              <Play className="w-4 h-4 fill-white stroke-0" />
              开启呼吸之律
            </button>
          </div>
        </div>
      ) : (
        /* Active Breathing Screen */
        <div className="flex flex-col items-center justify-center py-4">
          {/* Header Info Area */}
          <div className="text-center mb-4 space-y-1.5">
            <span className="text-[10px] tracking-widest uppercase text-[#3E4A3F] bg-[#F2EDE4] border border-[#E6E1D6] px-3 py-1 rounded-full font-semibold shadow-xs inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8BA88E] animate-ping" />
              {selectedTech.name} · 第 {cycleCount + 1} / {targetCycles} 圈
            </span>

            {showGroupMode && (
              <p className="text-[10px] text-[#7A8C7C] font-sans">
                🧘‍♂️ 在线能量场已就绪：已有 482 位练习者正与你隔空同频共振共吸。
              </p>
            )}
          </div>

          {/* Group Companions Layout (Top Row of Co-Presence) */}
          {showGroupMode && (
            <div className="flex items-center justify-center gap-6 mb-4 w-full" id="companions-resonance-grid">
              {COMPANIONS.map((companion, ind) => (
                <div key={companion.id} className="flex flex-col items-center gap-1 text-center">
                  <div className="relative flex items-center justify-center w-10 h-10">
                    {/* Pulsing ring matching custom scale of user breath */}
                    <motion.div
                      animate={{
                        scale: scale * 0.9,
                      }}
                      transition={{
                        duration: secondsRemaining > 0 ? secondsRemaining : 1.2,
                        ease: "easeInOut",
                        delay: ind * 0.05
                      }}
                      className={`absolute inset-0 rounded-full ${companion.bg}/20 border border-${companion.bg}/40`}
                    />
                    <div className={`w-6 h-6 rounded-full ${companion.bg} shadow-xs flex items-center justify-center text-[8px] text-white font-serif font-semibold opacity-80`}>
                      {companion.name.charAt(0)}
                    </div>
                  </div>
                  <span className="text-[9px] text-[#3E4A3F] font-medium font-sans">
                    {companion.name}
                  </span>
                  <span className="text-[8px] text-[#7A8C7C] font-mono scale-95 uppercase">
                    {companion.location}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Active Instructions / Prompt */}
          <div className="text-center max-w-sm mb-4 min-h-[50px] flex flex-col justify-center">
            {isCurrentlyPaused ? (
              <h4 className="text-base font-serif italic font-semibold text-amber-700 animate-pulse" id="paused-warning-text">
                ⏸️ 身体察觉：手指已挪开，练习已温柔暂停
              </h4>
            ) : (
              <h4 className={`text-lg font-serif italic font-medium transition-all ${color}`} id="breath-phase-text">
                {title}
              </h4>
            )}

            <p className="text-xs text-[#7A8C7C] mt-1.5 leading-relaxed" id="breath-phase-subtext">
              {isCurrentlyPaused
                ? "思绪轻轻飘走是极其正常的自然反应。不必自责，只需随时重新把手指轻轻按在正下方的核心光球上，即可立即继续当前这一息。"
                : instruction}
            </p>
          </div>

          {/* Central Active Interface: Interactive Breathing Orb */}
          <div className="relative w-64 h-64 flex items-center justify-center my-2" id="breathing-orb-container">
            {/* Dynamic expanding outer ring */}
            <AnimatePresence>
              {!isCurrentlyPaused && (phase === "inhale" || phase === "hold1") && (
                <motion.div
                  initial={{ opacity: 0.1, scale: 0.8 }}
                  animate={{ opacity: [0.1, 0.35, 0.1], scale: [1, 2.3, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute w-32 h-32 rounded-full bg-[#8BA88E]/10 border border-[#8BA88E]/20 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Tactile Hold Pointer Guide for Anchor Mode */}
            {anchorMode && !isCurrentlyPaused && phase !== "completed" && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-3 text-[10px] text-[#8BA88E] bg-[#FAF7F2] border border-[#8BA88E]/30 px-2 py-0.5 rounded-full font-medium shadow-xs select-none pointer-events-none z-10"
              >
                👈 请持续按住
              </motion.div>
            )}

            {/* Central core orb which doubles as Touch Anchor Plate in Focus Mode */}
            <motion.div
              animate={{
                scale: isCurrentlyPaused ? 0.95 : scale,
                boxShadow: isCurrentlyPaused 
                  ? "0 0 0px rgba(139, 168, 142, 0)" 
                  : phase === "inhale"
                  ? "0 0 25px rgba(139, 168, 142, 0.4)"
                  : "0 0 10px rgba(139, 168, 142, 0.1)"
              }}
              transition={{
                duration: isCurrentlyPaused ? 0.3 : (secondsRemaining > 0 ? secondsRemaining : 1),
                ease: "easeInOut",
              }}
              // Capture mouse/pointer events for anchorMode
              onMouseDown={() => {
                if (anchorMode) setIsTouched(true);
              }}
              onMouseUp={() => {
                if (anchorMode) setIsTouched(false);
              }}
              onMouseLeave={() => {
                if (anchorMode) setIsTouched(false);
              }}
              onTouchStart={(e) => {
                if (anchorMode) {
                  // Don't trigger browser gestures
                  if (e.cancelable) e.preventDefault();
                  setIsTouched(true);
                }
              }}
              onTouchEnd={(e) => {
                if (anchorMode) {
                  if (e.cancelable) e.preventDefault();
                  setIsTouched(false);
                }
              }}
              className={`w-38 h-38 rounded-full border flex flex-col items-center justify-center shadow-lg cursor-pointer transition-colors select-none relative overflow-hidden ${
                isCurrentlyPaused
                  ? "bg-amber-50/70 border-amber-300 text-amber-800 shadow-none ring-2 ring-amber-100 animate-pulse"
                  : bgGlow
              }`}
              id="breathing-orb-touch-plate"
            >
              {/* Meditative Background Image with breathing-aware reactive scale and rotation */}
              <motion.img
                key={selectedAmbientSound}
                src={SOUND_IMAGES[selectedAmbientSound] || defaultZenImg}
                alt="Mindfulness background visual stimulation"
                referrerPolicy="no-referrer"
                animate={{
                  scale: isCurrentlyPaused ? 1.0 : (phase === "inhale" || phase === "hold1" ? 1.4 : 1.05),
                  rotate: isCurrentlyPaused ? 0 : (phase === "inhale" ? 6 : (phase === "hold1" ? 3 : 0)),
                  filter: isCurrentlyPaused ? "grayscale(50%) blur(3px)" : "grayscale(0%) blur(0px)"
                }}
                transition={{
                  duration: isCurrentlyPaused ? 0.4 : (secondsRemaining > 0 ? secondsRemaining : 1.5),
                  ease: "easeInOut",
                }}
                className="absolute inset-0 w-full h-full object-cover opacity-80 select-none pointer-events-none z-0"
              />

              {/* Frost/Glow overlay to ensure readable timer text on any image background */}
              <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px] z-10" />

              {/* Dynamic light pulse ring overlay */}
              <AnimatePresence>
                {!isCurrentlyPaused && phase === "inhale" && (
                  <motion.div
                    initial={{ opacity: 0.1, scale: 0.95 }}
                    animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.25, 1] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full border border-[#8BA88E]/40 pointer-events-none z-10"
                  />
                )}
              </AnimatePresence>

              {/* Interactive text and counters on top (z-20) */}
              <div className="relative z-20 flex flex-col items-center justify-center text-center p-3">
                {phase === "completed" ? (
                  <CheckCircle className="w-12 h-12 text-[#8BA88E] animate-pulse bg-white/90 rounded-full p-1 border border-[#8BA88E]/20 shadow-xs" />
                ) : isCurrentlyPaused ? (
                  <div className="flex flex-col items-center justify-center p-2 text-center select-none pointer-events-none">
                    <Fingerprint className="w-8 h-8 text-amber-600 animate-bounce mb-1" />
                    <span className="text-[10px] font-semibold text-amber-800 bg-white/94 px-2 py-0.5 rounded-full shadow-xs">置回手指续播</span>
                  </div>
                ) : (
                  <>
                    {anchorMode && (
                      <Fingerprint className="w-4 h-4 opacity-75 text-[#3E4A3F] animate-pulse mb-0.5" />
                    )}
                    <span className="text-[9px] font-mono font-bold opacity-75 text-[#3E4A3F] uppercase tracking-wider">剩余</span>
                    <motion.span
                      key={secondsRemaining}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-4xl font-mono font-bold text-[#2C3E2E] my-0.5 drop-shadow-xs"
                    >
                      {secondsRemaining}
                    </motion.span>
                    <span className="text-[9px] font-mono font-bold opacity-75 text-[#3E4A3F]">秒</span>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Progress bar and Stop controls */}
          <div className="w-full max-w-xs space-y-3.5 mt-4">
            <div className="w-full bg-[#E6E1D6] h-1.5 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-[#8BA88E] h-full transition-all duration-500 rounded-full"
                style={{ width: `${(cycleCount / targetCycles) * 100}%` }}
              />
            </div>

            {/* Bottom active details */}
            <div className="flex justify-between items-center text-[10px] font-sans text-[#7A8C7C] px-1">
              <span>状态: {!isCurrentlyPaused ? "进行中" : "暂停引导"}</span>
              <span>进度: {cycleCount} / {targetCycles} 圈</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              {phase === "completed" ? (
                <button
                  onClick={handleStop}
                  className="px-5 py-2 rounded-xl bg-[#8BA88E] hover:bg-[#7A987D] text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border border-[#8BA88E]"
                  id="breathing-confirm-button"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  再次训练
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="px-5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-[#7A8C7C] border border-[#E6E1D6] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  id="breathing-stop-button"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  终止练习
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CBT Mindfulness Hint on Bottom */}
      <div className="mt-4 p-3 rounded-xl bg-white/40 border border-[#E6E1D6]/75 flex gap-2 items-start">
        <Info className="w-4 h-4 text-[#8BA88E] shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#7A8C7C] leading-normal font-sans">
          <strong>为什么这个有效？</strong>大脑在情绪发作时极容易发生注意力解偶。我们引入<strong>触控物理按压 (Anchor Mode)</strong> 和<strong>声学瀑布淹没</strong>。通过给脑部指派一个细微且绝对清醒的小契机（手指不能离位），强迫认知维持在躯体触感上，这也是公认防止脑波走神最温和也最快凑效的反馈疗法。
        </p>
      </div>
    </div>
  );
}
