/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Eye, ShieldAlert, Check, ChevronRight, RefreshCw } from "lucide-react";
import { GROUNDING_STEPS } from "../utils/breathingData";
import { AudioEngine } from "../utils/audioEngine";

export default function GroundingTechnique() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1 is introductory screen
  const [inputs, setInputs] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [historyCompleted, setHistoryCompleted] = useState<boolean>(false);

  const totalSteps = GROUNDING_STEPS.length;

  const handleStart = () => {
    setCurrentStepIndex(0);
    setInputs([]);
    setCurrentInput("");
    setHistoryCompleted(false);
    AudioEngine.playChime(528, 1.2);
  };

  const handleNextStep = () => {
    if (currentInput.trim() !== "") {
      // Append current input
      const nextInputs = [...inputs, currentInput.trim()];
      setInputs(nextInputs);
      setCurrentInput("");
    }

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      AudioEngine.playChime(432 + currentStepIndex * 40, 1.0); // incremental reassuring sounds
    } else {
      // Finish
      setHistoryCompleted(true);
      setCurrentStepIndex(totalSteps);
      AudioEngine.playChime(528, 2.5);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(-1);
    setInputs([]);
    setCurrentInput("");
    setHistoryCompleted(false);
  };

  const getSensesIcon = (step: number) => {
    switch (step) {
      case 5:
        return <Eye className="w-6 h-6 text-[#8BA88E]" />;
      case 4:
        return <Sparkles className="w-6 h-6 text-[#7A8C7C]" />;
      case 3:
        return <Sparkles className="w-6 h-6 text-[#4A5D4E]" />;
      case 2:
        return <Sparkles className="w-6 h-6 text-[#3E4A3F]" />;
      case 1:
        return <Sparkles className="w-6 h-6 text-[#8BA88E]" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#8BA88E]" />;
    }
  };

  return (
    <div id="grounding-card" className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[380px]">
      {/* Glow decorations */}
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#8BA88E]/5 blur-3xl animate-pulse" />

      {currentStepIndex === -1 && (
        /* Introductory Panel */
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-[#8BA88E] shrink-0" />
              <h2 id="grounding-introduction-title" className="text-xl font-serif italic font-medium tracking-tight text-[#3E4A3F]">
                5-4-3-2-1 五感觉察法
              </h2>
            </div>
            <p className="text-xs text-[#7A8C7C] leading-relaxed space-y-2">
              当你感觉思绪停不下来、过度换气或陷入巨大的情绪风暴（比如惊恐发作）时，代表大脑的<strong>情绪中心 (扁桃体)</strong> 正处于极度红灯状态。
              <br />
              <br />
              <strong>五感觉察 (Grounding)</strong> 是一种极其科学且迅速有效的认知重构策略。它通过强制你的大脑提取真实的实体感官（视觉、触觉、听觉、嗅觉、味觉），重启负责理性思维的<strong>前额叶皮层</strong>，迅速把你从脑海中的焦虑幻象中“生拉硬拽”拉回安全的客观现实。
            </p>
          </div>

          <button
            onClick={handleStart}
            className="mt-6 w-full py-3.5 rounded-xl bg-[#8BA88E] hover:bg-[#7A987D] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm border border-[#8BA88E]"
            id="start-grounding-btn"
          >
            开启当下之旅 (Grounding)
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {currentStepIndex >= 0 && currentStepIndex < totalSteps && (
        /* Active Sensory Step Panel */
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E1D6] pb-3 mb-2.5">
              <span className="text-[10px] uppercase tracking-widest text-[#4A5D4E] bg-[#E6E1D6]/60 px-2.5 py-0.5 rounded-full border border-[#E6E1D6] font-sans">
                觉察重塑中 ({currentStepIndex + 1} / {totalSteps})
              </span>
              <button
                onClick={handleReset}
                className="text-[10px] text-[#7A8C7C] hover:text-[#3E4A3F] font-sans flex items-center gap-1 cursor-pointer transition-colors"
                id="grounding-abort-btn"
              >
                退出重设
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] flex items-center justify-center shrink-0 shadow-sm">
                {getSensesIcon(GROUNDING_STEPS[currentStepIndex].step)}
              </div>
              <h3 className="text-sm font-medium text-[#3E4A3F]" id="grounding-step-heading">
                {GROUNDING_STEPS[currentStepIndex].title}
              </h3>
            </div>

            <p className="text-xs text-[#7A8C7C] leading-relaxed mt-2 font-sans" id="grounding-step-description">
              {GROUNDING_STEPS[currentStepIndex].description}
            </p>

            <div className="mt-4">
              <label className="block text-[10px] text-[#7A8C7C] mb-1.5 uppercase tracking-wide font-sans font-medium">
                记录你此时此地的发现（可选，保持完全的倾注和诚实）：
              </label>
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="例如: 窗外摇曳的树叶、或者书桌的温度..."
                className="w-full bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl px-4 py-3 text-xs text-[#3E4A3F] focus:outline-none focus:border-[#8BA88E] placeholder-[#C4BEB3] transition-all font-sans shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNextStep();
                }}
                id="grounding-input-field"
              />
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className="mt-6 w-full py-3 rounded-xl bg-[#FAF7F2] hover:bg-[#8BA88E] hover:text-white border border-[#E6E1D6] text-[#4A5D4E] font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
            id="grounding-next-btn"
          >
            {currentStepIndex === totalSteps - 1 ? "完成全部觉察" : "记录并前往下一步"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {historyCompleted && (
        /* Completion Screen */
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#8BA88E]/10 border border-[#8BA88E]/20 flex items-center justify-center mx-auto mb-1 animate-pulse">
              <Check className="w-8 h-8 text-[#8BA88E]" />
            </div>

            <h3 id="grounding-completed-heading" className="text-lg font-serif italic font-medium text-[#3E4A3F]">
              安稳着陆。
            </h3>

            <p className="text-xs text-[#7A8C7C] max-w-sm mx-auto leading-relaxed font-sans">
              你已经成功经历了一次完整的现实感官洗礼。让我们把注意力轻柔地拉回身体：肩膀是否稍微放轻松了一些？牙关是否不再咬紧？
            </p>

            {inputs.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6E1D6] max-h-[140px] overflow-y-auto text-left space-y-2 shadow-inner">
                <span className="text-[10px] text-[#7A8C7C] uppercase block tracking-wider font-sans font-medium">
                  你的现实聚焦印记：
                </span>
                <div className="space-y-1.5">
                  {inputs.map((inp, key) => (
                    <div key={key} className="text-xs text-[#4A5D4E] flex items-start gap-1.5 font-sans">
                      <span className="text-[#8BA88E] select-none shrink-0">•</span>
                      <span>{inp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleReset}
            className="mt-6 w-full py-3 rounded-xl bg-[#8BA88E] hover:bg-[#7A987D] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#8BA88E] shadow-sm"
            id="grounding-finish-btn"
          >
            <RefreshCw className="w-4 h-4" />
            重置并返回主页
          </button>
        </div>
      )}
    </div>
  );
}
