/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Disc, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AudioEngine } from "../utils/audioEngine";

interface SoundTrack {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  type: string;
  volume: number;
  isPlaying: boolean;
  frequencyText?: string;
}

export default function AudioStation() {
  const [tracks, setTracks] = useState<SoundTrack[]>([
    {
      id: "brown_noise",
      name: "Deep Waterfall Noise",
      chineseName: "深谷瀑布 (褐噪音)",
      description: "低频极为饱满，类似隆隆的瀑布雷鸣。能掩盖外界突发噪音，给大脑最安全踏实的保护感。",
      type: "noise",
      volume: 0.4,
      isPlaying: false,
    },
    {
      id: "ocean_waves",
      name: "Ocean Wave Tide",
      chineseName: "海浪涌动 (潮汐拟音)",
      description: "由低通滤波褐噪音搭配 12 秒的音量震荡 LFO。逼真重现潮起潮落，引导呼吸与之产生同步节律。",
      type: "wave",
      volume: 0.5,
      isPlaying: false,
    },
    {
      id: "singing_bowl",
      name: "Tibetan Meditation Drone",
      chineseName: "颂钵冥想 (共鸣基底音)",
      description: "以宇宙频率 136.1Hz (OM) 辅以正弦波阶梯各谐音段，微秒级微弱微调构成宛如教堂穹顶下的和谐共鸣。",
      type: "drone",
      volume: 0.3,
      isPlaying: false,
    },
    {
      id: "binaural_beats",
      name: "Theta Binaural Beats",
      chineseName: "双耳差频 (4Hz 脑波愈合)",
      description: "左声道输出 148Hz、右声道输出 152Hz。大脑自主感知其 4Hz 的 Theta 差频，诱导深层宁静、缓解偏头痛。",
      type: "binaural",
      volume: 0.3,
      isPlaying: false,
      frequencyText: "左耳 148Hz / 右耳 152Hz (差额 4Hz Theta 脑电波)",
    }
  ]);

  const [globalMute, setGlobalMute] = useState(false);

  // Stop all local playing tracks on unmount
  useEffect(() => {
    return () => {
      AudioEngine.stopAll();
    };
  }, []);

  const handleToggleTrack = async (id: string) => {
    // Initialise audio engine context
    AudioEngine.init();

    const updatedTracks = tracks.map((track) => {
      if (track.id === id) {
        const nextState = !track.isPlaying;
        if (nextState) {
          AudioEngine.startSound(track.id, globalMute ? 0 : track.volume);
        } else {
          AudioEngine.stopSound(track.id);
        }
        return { ...track, isPlaying: nextState };
      }
      return track;
    });

    setTracks(updatedTracks);
  };

  const handleVolumeChange = (id: string, newVolume: number) => {
    const updatedTracks = tracks.map((track) => {
      if (track.id === id) {
        if (track.isPlaying && !globalMute) {
          AudioEngine.setVolume(id, newVolume);
        }
        return { ...track, volume: newVolume };
      }
      return track;
    });
    setTracks(updatedTracks);
  };

  const handleStopAll = () => {
    AudioEngine.stopAll();
    const updated = tracks.map((t) => ({ ...t, isPlaying: false }));
    setTracks(updated);
  };

  const isAnyPlaying = tracks.some((t) => t.isPlaying);

  return (
    <div id="audio-station-card" className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-3xl p-6 shadow-sm relative overflow-hidden">
      {/* Decorative organic sphere */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#8BA88E]/5 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-[#E6E1D6]/20 blur-3xl" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E6E1D6] pb-5 mb-6 gap-4">
        <div>
          <h2 id="audio-station-title" className="text-xl font-serif italic font-medium tracking-tight text-[#3E4A3F] flex items-center gap-2">
            <Disc className="w-5 h-5 text-[#8BA88E] animate-spin-slow" />
            舒缓自然声疗仪
          </h2>
          <p className="text-xs text-[#7A8C7C] mt-1 font-sans">
            Web Audio API 纯物理合成 · 100% 离线高保真音质
          </p>
        </div>

        {isAnyPlaying && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStopAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-all cursor-pointer"
          >
            <VolumeX className="w-4 h-4" />
            全部一键关闭
          </motion.button>
        )}
      </div>

      <div className="space-y-4">
        {tracks.map((track) => (
          <div
            id={`audio-track-${track.id}`}
            key={track.id}
            className={`p-4 rounded-2xl border transition-all ${
              track.isPlaying
                ? "bg-[#F2EDE4] border-[#8BA88E]/40 shadow-sm"
                : "bg-[#FAF7F2] border-[#E6E1D6]/70 hover:border-[#8BA88E]/30 hover:bg-[#F2EDE4]/30"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${track.isPlaying ? "bg-[#8BA88E] animate-pulse" : "bg-[#C4BEB3]"}`} />
                  <h3 className="text-sm font-medium text-[#3E4A3F]" id={`track-name-${track.id}`}>
                    {track.chineseName}
                  </h3>
                  <span className="text-[10px] text-[#7A8C7C] bg-[#F2EDE4]/80 px-2 py-0.5 rounded-full border border-[#E6E1D6] font-sans">
                    {track.type === "binaural" ? "脑波共鸣" : "自然声学"}
                  </span>
                </div>
                <p className="text-xs text-[#7A8C7C] mt-1 leading-relaxed">
                  {track.description}
                </p>
                {track.type === "binaural" && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-[#4A5D4E] bg-[#E6E1D6]/40 border border-[#E6E1D6] rounded px-2 py-1 max-w-max font-sans">
                    <Info className="w-3.5 h-3.5 text-[#8BA88E] shrink-0" />
                    <span>{track.frequencyText}</span>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggleTrack(track.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border ${
                  track.isPlaying
                    ? "bg-[#8BA88E] border-[#8BA88E] text-white shadow-sm hover:bg-[#7A987D]"
                    : "bg-[#FAF7F2] border-[#E6E1D6] text-[#4A5D4E] hover:text-[#3E4A3F] hover:bg-[#E6E1D6]/50"
                }`}
                id={`track-play-btn-${track.id}`}
              >
                {track.isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-[#4A5D4E] ml-0.5" />}
              </motion.button>
            </div>

            {/* Slider control with visual beat effect when active */}
            <AnimatePresence>
              {track.isPlaying && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4 pt-3 border-t border-[#E6E1D6]"
                >
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-[#8BA88E] shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={track.volume}
                      onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                      className="w-full accent-[#8BA88E] h-1.5 rounded-lg bg-[#E6E1D6] cursor-pointer focus:outline-none"
                    />
                    <span className="text-xs font-mono text-[#7A8C7C] shrink-0 min-w-[32px] text-right">
                      {Math.round(track.volume * 100)}%
                    </span>
                  </div>

                  {/* Gentle graphic EQ visualization of continuous waves */}
                  <div className="flex justify-center items-center gap-1.5 h-3 mt-3 px-6">
                    {[...Array(12)].map((_, idx) => {
                      const delays = [0, 0.2, 0.4, 0.6, 0.3, 0.1, 0.5, 0.2, 0.4, 0.7, 0.1, 0.3];
                      const mult = track.volume;
                      return (
                        <motion.div
                          key={idx}
                          animate={{
                            scaleY: [1, 2.5 + Math.random() * 2, 1],
                          }}
                          transition={{
                            duration: 1 + delays[idx],
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="w-1 bg-[#8BA88E]/40 rounded-full"
                          // Compute dynamic heights
                          style={{
                            height: `${4 * (1 + delays[idx] * mult)}px`,
                            transformOrigin: "center",
                          }}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] flex gap-2.5 items-start shadow-sm">
        <Info className="w-4.5 h-4.5 text-[#8BA88E] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#7A8C7C] leading-relaxed font-sans">
          <strong>温馨提示：</strong>双耳脑波疗法 (Binaural Beats) 必须佩戴<strong>立体声耳机</strong>才能感知其奇妙的极低频差频效果。您可以重叠播放多种音效（如：海浪 + 深谷瀑布 + 颂钵），定制自己专属的深呼吸自然空间。
        </p>
      </div>
    </div>
  );
}
