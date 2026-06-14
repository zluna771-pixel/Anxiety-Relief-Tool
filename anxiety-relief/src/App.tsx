/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Wind, ShieldCheck, BookOpen, BarChart3, Disc, Heart, ShieldAlert, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MoodLog } from "./types";

import AudioStation from "./components/AudioStation";
import BreathingExercise from "./components/BreathingExercise";
import GroundingTechnique from "./components/GroundingTechnique";
import MoodTracker from "./components/MoodTracker";
import MoodDashboard from "./components/MoodDashboard";
import { AudioEngine } from "./utils/audioEngine";

// Sample therapeutic logs to prime the user database upon first launch
const INITIAL_DEMO_LOGS: MoodLog[] = [
  {
    id: "demo_1",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    moodScore: 3,
    primaryEmotion: "😰 焦虑 (Anxious)",
    note: "临近部门年终答辩汇报，胸口感觉沉闷不畅，担心自己讲砸、呼吸有一些急促。好在做完 4-7-8 调息稍微平复了一些。",
    triggers: ["💼 工作与学习", "💤 睡眠质量"],
    physicalSymptoms: ["🫁 胸口发闷", "🌬️ 呼吸表浅", "🦴 肌肉僵硬"],
  },
  {
    id: "demo_2",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    moodScore: 6,
    primaryEmotion: "🥱 疲乏 (Fatigued)",
    note: "汇报结束了，整个人有种卸下重担的虚脱感，但植物神经似乎还是有点紧绷。晚上听了海浪拟音，得到了很好的放松性深度关怀。",
    triggers: ["💼 工作与学习"],
    physicalSymptoms: ["☀️ 暂无明显身体症状"],
  },
  {
    id: "demo_3",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    moodScore: 9,
    primaryEmotion: "🧘 安宁 (Serene)",
    note: "晨起在阳台完成了 12 圈 Coherent Resonant 合谐呼吸法，心跳和缓，全身感觉温暖有底气。情绪非常安顺，感知到了生活当下的微风拂面。",
    triggers: ["💤 睡眠质量"],
    physicalSymptoms: ["☀️ 暂无明显身体症状"],
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"breathe" | "grounding" | "journal" | "stats">("journal");
  const [logs, setLogs] = useState<MoodLog[]>([]);

  // 1. Initialise and load logs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("serene_mind_logs_v1");
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        setLogs(INITIAL_DEMO_LOGS);
      }
    } else {
      // Prime with elegant tutorial sample logs for stunning initial dashboards
      setLogs(INITIAL_DEMO_LOGS);
      localStorage.setItem("serene_mind_logs_v1", JSON.stringify(INITIAL_DEMO_LOGS));
    }
  }, []);

  const saveLogs = (updatedLogs: MoodLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem("serene_mind_logs_v1", JSON.stringify(updatedLogs));
  };

  const handleAddNewLog = (newLog: MoodLog) => {
    const updated = [newLog, ...logs];
    saveLogs(updated);
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter((log) => log.id !== id);
    saveLogs(updated);
  };

  // Helper: Trigger emergency relief tab directly
  const triggerEmergencyRelief = () => {
    setActiveTab("grounding");
    AudioEngine.playChime(440, 1.5);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A5D4E] flex flex-col justify-between selection:bg-[#8BA88E]/20 selection:text-[#3E4A3F] pb-12">
      {/* Background radial ambient light spots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#8BA88E]/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#E6E1D6]/20 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* APP MAIN HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#8BA88E] flex items-center justify-center shrink-0 shadow-sm border border-[#E6E1D6]">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h1 id="app-title" className="text-3xl font-serif italic text-[#3E4A3F] font-medium tracking-tight">
                  身心安宁与正念调息助手
                </h1>
                <p className="text-xs text-[#7A8C7C] font-mono mt-0.5">
                  Anxiety Relief & Medical Resonant Breathing
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Panic relief banner */}
          <button
            onClick={triggerEmergencyRelief}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FDECE9] hover:bg-[#FBE3DE] border border-[#F5D5CF] text-[#8C3A2B] text-xs font-medium transition-all shadow-sm cursor-pointer w-full md:w-auto text-left"
            id="emergency-relief-trigger"
          >
            <ShieldAlert className="w-4 h-4 text-[#8C3A2B] shrink-0" />
            <div>
              <span className="font-semibold block">【一键救急 · 正在感觉惊恐窒息？】</span>
              <span className="text-[10px] text-[#A65B4C] block font-sans">点击直接激活五感觉察（5-4-3-2-1 现实快速着陆）</span>
            </div>
          </button>
        </header>

        {/* PERSISTENT TAB CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <nav className="flex flex-wrap gap-2.5 bg-[#FAF7F2] p-2 rounded-2xl border border-[#E6E1D6] shadow-sm" id="tab-navigation-bar">
              <button
                onClick={() => {
                  setActiveTab("journal");
                  AudioEngine.playChime(396, 0.4);
                }}
                className={`flex-1 min-w-[120px] py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "journal"
                    ? "bg-[#8BA88E] text-white shadow-sm border border-transparent"
                    : "text-[#7A8C7C] hover:text-[#3E4A3F] hover:bg-[#F2EDE4]/60"
                }`}
                id="tab-journal-btn"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                身心觉察日记
              </button>

              <button
                onClick={() => {
                  setActiveTab("breathe");
                  AudioEngine.playChime(528, 0.4);
                }}
                className={`flex-1 min-w-[120px] py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "breathe"
                    ? "bg-[#8BA88E] text-white shadow-sm border border-transparent"
                    : "text-[#7A8C7C] hover:text-[#3E4A3F] hover:bg-[#F2EDE4]/60"
                }`}
                id="tab-breathe-btn"
              >
                <Wind className="w-4 h-4 shrink-0" />
                科学调息减压
              </button>

              <button
                onClick={() => {
                  setActiveTab("grounding");
                  AudioEngine.playChime(432, 0.4);
                }}
                className={`flex-1 min-w-[120px] py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "grounding"
                    ? "bg-[#8BA88E] text-white shadow-sm border border-transparent"
                    : "text-[#7A8C7C] hover:text-[#3E4A3F] hover:bg-[#F2EDE4]/60"
                }`}
                id="tab-grounding-btn"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                五觉快速着陆
              </button>

              <button
                onClick={() => {
                  setActiveTab("stats");
                  AudioEngine.playChime(330, 0.4);
                }}
                className={`flex-1 min-w-[120px] py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "stats"
                    ? "bg-[#8BA88E] text-white shadow-sm border border-transparent"
                    : "text-[#7A8C7C] hover:text-[#3E4A3F] hover:bg-[#F2EDE4]/60"
                }`}
                id="tab-stats-btn"
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                自主神经大盘
              </button>
            </nav>

            {/* TAB CONTENT PANELS WITH ENTRY TRANSITION ANIMATIONS */}
            <main id="active-tab-panel" className="outline-none">
              <AnimatePresence mode="wait">
                {activeTab === "breathe" && (
                  <motion.div
                    key="breathe"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BreathingExercise onSessionComplete={() => {
                      // Trigger dynamic log entry automatically when session successfully completed
                      handleAddNewLog({
                        id: "breathing_" + Date.now(),
                        timestamp: new Date().toISOString(),
                        moodScore: 8,
                        primaryEmotion: "🍃 平静 (Calm)",
                        triggers: [],
                        physicalSymptoms: ["☀️ 暂无明显身体症状"],
                        note: "自主跟着箱式/4-7-8呼吸节奏器完成了放松性气流调息。感到心包腔变宽，副交感神经已点火接替。"
                      });
                    }} />
                  </motion.div>
                )}

                {activeTab === "grounding" && (
                  <motion.div
                    key="grounding"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GroundingTechnique />
                  </motion.div>
                )}

                {activeTab === "journal" && (
                  <motion.div
                    key="journal"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MoodTracker
                      logs={logs}
                      onLogSaved={handleAddNewLog}
                      onLogDeleted={handleDeleteLog}
                    />
                  </motion.div>
                )}

                {activeTab === "stats" && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MoodDashboard logs={logs} />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>

          {/* PERSISTENT NATURAL DUAL SOUND COMPONENT (STATION) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <AudioStation />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER COGNITIVE DISCLOSURE */}
      <footer className="mt-16 border-t border-[#E6E1D6] pt-6 text-center text-[10px] text-[#7A8C7C] relative z-10 px-4 font-mono max-w-7xl mx-auto w-full">
        <p>医学安全披露：本应用所涉及的 4-7-8 呼吸、箱式呼吸及五感觉察属于国际循证临床心理学的经典物理治疗机制，能有效激活副交感神经并限制过度换气反应。</p>
        <p className="mt-1.5">但是，若您当前处于重度持续性生理不适或发生严重临床躯体障碍，请及时遵医嘱。请佩戴高保真耳机以保障最佳音疗功效。</p>
        <p className="mt-3">Aesthetic Natural Tones Workspace Design · © 2026 Anxiety Relief Assistant</p>
      </footer>
    </div>
  );
}
