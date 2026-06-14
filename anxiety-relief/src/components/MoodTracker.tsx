/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PlusCircle, Trash2, BookOpen, Clock, Smile } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MoodLog } from "../types";
import { EMOTIONS, TRIGGERS, PHYSICAL_SYMPTOMS } from "../utils/breathingData";
import { AudioEngine } from "../utils/audioEngine";

interface MoodTrackerProps {
  logs: MoodLog[];
  onLogSaved: (newLog: MoodLog) => void;
  onLogDeleted: (id: string) => void;
}

export default function MoodTracker({ logs, onLogSaved, onLogDeleted }: MoodTrackerProps) {
  // Local Form state
  const [selectedFeeling, setSelectedFeeling] = useState<string>("🍃 平静 (Calm)");
  const [moodScore, setMoodScore] = useState<number>(8); // default to Calm
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [journalNote, setJournalNote] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const handleToggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const handleToggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleFeelingSelect = (label: string, score: number) => {
    setSelectedFeeling(label);
    setMoodScore(score);
    // play soft cue
    AudioEngine.playChime(300 + score * 40, 1.0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFeeling) return;

    const newLog: MoodLog = {
      id: "log_" + Date.now().toString(),
      timestamp: new Date().toISOString(),
      moodScore: moodScore,
      primaryEmotion: selectedFeeling,
      note: journalNote.trim(),
      triggers: selectedTriggers,
      physicalSymptoms: selectedSymptoms,
    };

    onLogSaved(newLog);
    AudioEngine.playChime(528, 1.8);

    // Reset local Form
    setJournalNote("");
    setSelectedTriggers([]);
    setSelectedSymptoms([]);
    setSelectedFeeling("🍃 平静 (Calm)");
    setMoodScore(8);
    setIsAdding(false);
  };

  const getScoreDescriptor = (score: number) => {
    if (score >= 9) return { label: "深沉宁静 · 状态安适", color: "text-[#8BA88E]" };
    if (score >= 7) return { label: "宁静温和 · 情绪稳定", color: "text-[#7A8C7C]" };
    if (score >= 5) return { label: "略显疲态 · 偶感麻木", color: "text-[#556356]" };
    if (score >= 3) return { label: "焦虑紧绷 · 隐隐不安", color: "text-[#B6782E]" };
    return { label: "情绪临界 · 恐慌不安", color: "text-[#C93B2B]" };
  };

  const getDynamicFacialState = (score: number) => {
    if (score >= 9) return { emoji: "🧘‍♀️", text: "深层宁静 · 感到心包腔极宽阔", subtext: "身心安稳，自律状态饱满，万物俱寂 🕊️", color: "text-emerald-800 bg-emerald-500/10 border-emerald-500/30" };
    if (score >= 7) return { emoji: "🍃 🙂", text: "平和稳定 · 副交感正常工作", subtext: "精神清爽稳定，处于健康的心理缓冲区 ✨", color: "text-[#3E4A3F] bg-[#FAF7F2] border-[#E6E1D6]" };
    if (score >= 5) return { emoji: "⛅ 🥱", text: "疲惫积累 · 自主神经微紧绷", subtext: "脑部杂音增多，开始觉得迟钝，建议开启微风调息 🌊", color: "text-[#6B7280] bg-slate-500/5 border-slate-300" };
    if (score >= 3) return { emoji: "⚡ 😰", text: "心口沉重 · 警觉因子在爬升", subtext: "呼吸短浅紧促，胸口紧闭，极易被细微杂念拉走注意力 ⚠️", color: "text-amber-800 bg-amber-500/10 border-amber-300/40" };
    return { emoji: "🌋 😭", text: "警报响过 · 身体启动逃跑应激", subtext: "强烈建议点击最顶处的红色【一键救急】，利用五感极速回归现实 🚫", color: "text-rose-800 bg-rose-500/10 border-rose-300/40 ring-1 ring-rose-300/20" };
  };

  const descriptor = getScoreDescriptor(moodScore);

  return (
    <div id="mood-tracker-container" className="space-y-6">
      {/* 1. Header and Quick Tracker Activator */}
      <div className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="mood-tracker-title" className="text-xl font-serif italic font-medium tracking-tight text-[#3E4A3F] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#8BA88E]" />
              身心觉察日记 & 情绪追踪
            </h2>
            <p className="text-xs text-[#7A8C7C] mt-1 font-sans">
              建立客观审视机制 · 觉知情绪波动背后的诱因与身体表现
            </p>
          </div>

          {!isAdding && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsAdding(true);
                AudioEngine.playChime(528, 1.0);
              }}
              className="px-4 py-2 rounded-xl bg-[#8BA88E] hover:bg-[#7A987D] text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border border-[#8BA88E]"
              id="activate-log-form-btn"
            >
              <PlusCircle className="w-4 h-4" />
              记录当下心情
            </motion.button>
          )}
        </div>

        {/* Form Overlay Area */}
        <AnimatePresence>
          {isAdding && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSubmit}
              className="mt-6 border-t border-[#E6E1D6] pt-5 space-y-5 overflow-hidden"
              id="mood-log-form"
            >
              {/* Emotion selectors */}
              <div>
                <label className="block text-sm font-medium text-[#3E4A3F] font-sans mb-3">
                  你此时此地最主要的心境表现是什么？
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="emotions-grid">
                  {EMOTIONS.map((emo) => {
                    const isSelected = selectedFeeling === emo.label;
                    return (
                      <button
                        key={emo.label}
                        type="button"
                        onClick={() => handleFeelingSelect(emo.label, emo.score)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#8BA88E] border-[#8BA88E] text-white font-semibold scale-105 shadow-sm"
                            : "bg-[#FAF7F2] border-[#E6E1D6] text-[#7A8C7C] hover:border-[#8BA88E] hover:text-[#3E4A3F]"
                        }`}
                        id={`emotion-btn-${emo.label}`}
                      >
                        {emo.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider for precision scoring with dynamic reactive facial stimulation card */}
              <div className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center text-xs mb-1.5 font-sans">
                  <span className="text-[#3E4A3F] font-medium">细化情绪安宁度评分:</span>
                  <span className={`font-mono text-xs font-semibold ${descriptor.color}`}>
                    {moodScore} / 10 ({descriptor.label})
                  </span>
                </div>

                {/* REACTIVE VISUAL STIMULATION EMBLEM */}
                <motion.div
                  key={moodScore}
                  initial={{ scale: 0.98, opacity: 0.9 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`p-3.5 mb-3.5 rounded-xl border flex items-center gap-3.5 transition-all shadow-inner overflow-hidden ${getDynamicFacialState(moodScore).color}`}
                >
                  <span className="text-3xl select-none" role="img" aria-label="Feeling visual representation">
                    {getDynamicFacialState(moodScore).emoji}
                  </span>
                  <div>
                    <span className="text-xs font-bold block text-[#2C3E2E]">
                      {getDynamicFacialState(moodScore).text}
                    </span>
                    <span className="text-[10px] opacity-80 block leading-relaxed mt-0.5 font-sans">
                      {getDynamicFacialState(moodScore).subtext}
                    </span>
                  </div>
                </motion.div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={moodScore}
                  onChange={(e) => setMoodScore(parseInt(e.target.value))}
                  className="w-full accent-[#8BA88E] h-1.5 rounded-lg bg-[#E6E1D6] cursor-pointer focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#7A8C7C] mt-1">
                  <span>1 (恐慌发作)</span>
                  <span>5 (略显疲倦)</span>
                  <span>10 (深层安顺)</span>
                </div>
              </div>

              {/* Triggers selection */}
              <div>
                <label className="block text-sm font-medium text-[#3E4A3F] font-sans mb-2.5">
                  情绪发生前是否有相关的潜在因由？（支持多选）
                </label>
                <div className="flex flex-wrap gap-2" id="triggers-list">
                  {TRIGGERS.map((trigger) => {
                    const isSelected = selectedTriggers.includes(trigger);
                    return (
                      <button
                        key={trigger}
                        type="button"
                        onClick={() => handleToggleTrigger(trigger)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#8BA88E] border-[#8BA88E] text-white font-semibold shadow-xs"
                            : "bg-[#FAF7F2] border-[#E6E1D6] text-[#7A8C7C] hover:text-[#3E4A3F] hover:border-[#8BA88E]"
                        }`}
                        id={`trigger-btn-${trigger}`}
                      >
                        {trigger}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Somatic physical symptoms */}
              <div>
                <label className="block text-sm font-medium text-[#3E4A3F] font-sans mb-2.5">
                  你正在体会哪些躯体紧绷反应？（请诚实察觉，观察即消退，支持多选）
                </label>
                <div className="flex flex-wrap gap-2" id="symptoms-list">
                  {PHYSICAL_SYMPTOMS.map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => handleToggleSymptom(sym)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#E6E1D6] border-[#C4BEB3] text-[#3E4A3F] font-semibold shadow-xs"
                            : "bg-[#FAF7F2] border-[#E6E1D6] text-[#7A8C7C] hover:text-[#3E4A3F] hover:border-[#8BA88E]"
                        }`}
                        id={`symptom-btn-${sym}`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reflective feedback notes */}
              <div>
                <label className="block text-sm font-medium text-[#3E4A3F] font-sans mb-1.5">
                  写下你此时此刻细微真实的内心倾诉或身体扫描反馈：
                </label>
                <textarea
                  value={journalNote}
                  onChange={(e) => setJournalNote(e.target.value)}
                  placeholder="我现在脑子里有什么声音？我的身体哪个部位有些沉重？随便写下，无须刻意粉饰文字..."
                  rows={3}
                  className="w-full bg-[#FAF7F2] border border-[#E6E1D6] rounded-2xl p-4 text-xs text-[#3E4A3F] placeholder-[#C4BEB3] focus:outline-none focus:border-[#8BA88E] line-normal shadow-inner shadow-sm"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-3 justify-end pt-3 border-t border-[#E6E1D6]">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#7A8C7C] hover:text-[#3E4A3F] cursor-pointer hover:bg-[#E6E1D6]/40"
                  id="cancel-log-btn"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8BA88E] hover:bg-[#7A987D] text-white font-medium text-xs shadow-sm cursor-pointer border border-[#8BA88E]"
                  id="submit-log-btn"
                >
                  保存心情日记
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Log Cards List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1 text-xs text-[#7A8C7C] font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>理智旁观 · 情绪时空隧道 (共计 {logs.length} 篇心情日志)</span>
        </div>

        {logs.length === 0 ? (
          <div className="bg-[#FAF7F2] border border-dashed border-[#E6E1D6] rounded-3xl p-10 text-center">
            <Smile className="w-10 h-10 text-[#8BA88E]/40 mx-auto mb-3" />
            <p className="text-xs text-[#7A8C7C] leading-relaxed font-sans">
              现在还没有保存任何情绪记录。
              <br />
              随时在上面选择“记录心情”，这会极大地锻炼你与负面情绪和平解耦的能力。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="logged-mood-entries">
            {logs.map((log) => {
              const dateInfo = new Date(log.timestamp).toLocaleDateString("zh-CN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  id={`mood-log-entry-${log.id}`}
                  key={log.id}
                  className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-2xl p-5 hover:border-[#8BA88E]/40 hover:bg-[#F2EDE4]/30 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {/* Rating block */}
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-mono font-bold text-[#8BA88E]">
                            {log.moodScore}
                          </span>
                          <span className="text-xs font-semibold text-[#3E4A3F]">
                            {log.primaryEmotion}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[#7A8C7C] mt-1 flex items-center gap-1">
                          <Clock className="w-3" />
                          {dateInfo}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onLogDeleted(log.id);
                          AudioEngine.playChime(300, 0.5);
                        }}
                        className="text-[#7A8C7C] hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="删除此条心情"
                        id={`delete-log-btn-${log.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Note content */}
                    {log.note && (
                      <p className="text-xs text-[#4A5D4E]/80 leading-relaxed border-l-2 border-[#8BA88E] pl-2.5 font-sans italic">
                        "{log.note}"
                      </p>
                    )}

                    {/* Tags tags list */}
                    {(log.triggers.length > 0 || log.physicalSymptoms.length > 0) && (
                      <div className="space-y-1.5 pt-2 border-t border-[#E6E1D6]/70">
                        {log.triggers.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[9px] text-[#7A8C7C] font-semibold uppercase shrink-0">诱因:</span>
                            {log.triggers.map((t) => (
                              <span key={t} className="text-[9px] text-[#4A5D4E] bg-[#E6E1D6] px-2 py-0.5 rounded border border-[#E6E1D6] font-sans">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        {log.physicalSymptoms.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[9px] text-[#7A8C7C] font-semibold uppercase shrink-0">体感:</span>
                            {log.physicalSymptoms.map((s) => (
                              <span key={s} className="text-[9px] text-[#8C3A2B] bg-[#FDECE9] px-2 py-0.5 rounded border border-[#F5D5CF] font-sans">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
