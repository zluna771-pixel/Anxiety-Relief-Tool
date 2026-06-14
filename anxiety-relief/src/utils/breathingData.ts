/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BreathingTechnique } from "../types";

export const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: "box_breathing",
    name: "箱式呼吸法 (Box Breathing)",
    description: "这是美国海豹突击队等常用于迅速恢复冷静和专注的呼吸训练。由于其均匀的四个步骤组合成一个箱形，因此得名。对降低急性压力极其有效。",
    benefits: "降低心率，激活副交感神经系统，迅速减轻突发紧张感，平衡脑电波。",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    difficulty: "Beginner",
  },
  {
    id: "478_breathing",
    name: "4-7-8 深度镇静法 (4-7-8 Breathing)",
    description: "由哈佛大学医学博士 Andrew Weil 推崇，被誉为天然的神经系统镇静剂。长呼气能强烈触发身体的放松反馈，对于极度焦虑和入睡困难效果卓越。",
    benefits: "深度缓解焦虑，激活迷走神经，有助于平复恐慌发作、改善失眠。",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    difficulty: "Intermediate",
  },
  {
    id: "coherent_breathing",
    name: "谐振共鸣呼吸 (Coherent Breathing)",
    description: "科学研究发现，当呼吸频次维持在每分钟 5 至 6 次（吸 5s 呼 5s）时，心率变异性（HRV）处于最优共鸣状态。这代表自主神经系统的最高协调状态。",
    benefits: "平衡交感与副交感神经，提高抗压能力，优化血压稳定性，改善长期焦虑。",
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
    difficulty: "Beginner",
  },
  {
    id: "cleansing_breathing",
    name: "深缓排毒呼吸 (Cleansing Sigh)",
    description: "这模仿了天然叹气的生理过程。快速两口气（一次深吸加上一次微量深呼）紧接着长叹一口气。是人类和灵长类应对缺氧和二氧化碳积聚的自然机制。",
    benefits: "迅速排空心肺紧绷感，拉伸肺泡，重设呼吸节律，终止连续性焦虑情绪。",
    inhale: 3,
    hold1: 2,
    exhale: 6,
    hold2: 0,
    difficulty: "Advanced",
  }
];

export const GROUNDING_STEPS = [
  {
    step: 5,
    title: "5 视觉：寻找周围能看到的 5 种事物",
    description: "仔细观察房间里一处细微的阴影、阳光照常升起、挂画上的一个极小的墨点、或某种颜色。让视线沉浸其中。",
  },
  {
    step: 4,
    title: "4 触觉：感知周围能触摸的 4 个物体",
    description: "感觉双脚踩踏地板的力量、衣服轻抚皮肤的质地、手心触摸桌面的坚硬、或者抚摸发丝。真切感知身体的支撑。",
  },
  {
    step: 3,
    title: "3 听觉：聆听身边可听见的 3 个声音",
    description: "闭上眼睛倾听，可能是遥远的街头喇叭声、鸟鸣、空调吹风声，或者你自己的细微呼吸声。",
  },
  {
    step: 2,
    title: "2 嗅觉：搜寻两处能闻到的气味",
    description: "吸气体会周围的空气，寻找咖啡香、木质家具的味道、清洗过的被单气味，或者尝试闻一下你的手腕香气。",
  },
  {
    step: 1,
    title: "1 味觉：专注于一个你可以尝到的味道",
    description: "感受你嘴里的味道，哪怕是水的气息、牙膏残留、口香糖，或者回想下一顿你想享受的美味的感觉。",
  }
];

export const EMOTIONS = [
  { label: "🧘 安宁 (Serene)", score: 10, variant: "bg-emerald-500/25 border-emerald-500/50 text-emerald-300" },
  { label: "🍃 平静 (Calm)", score: 8, variant: "bg-teal-500/25 border-teal-500/50 text-teal-300" },
  { label: "☀️ 充实 (Content)", score: 7, variant: "bg-blue-500/25 border-blue-500/50 text-blue-300" },
  { label: "🥱 疲乏 (Fatigued)", score: 5, variant: "bg-slate-500/25 border-slate-500/50 text-slate-300" },
  { label: "⚡ 紧绷 (Tense)", score: 4, variant: "bg-amber-500/25 border-amber-500/50 text-amber-300" },
  { label: "😰 焦虑 (Anxious)", score: 2, variant: "bg-orange-500/25 border-orange-500/50 text-orange-300" },
  { label: "🌋 恐慌 (Panic)", score: 1, variant: "bg-rose-500/25 border-rose-500/50 text-[#C93B2B]" }
];

export const TRIGGERS = ["💼 工作与学习", "💬 人际交往", "❤️ 健康状况", "💤 睡眠质量", "📱 社交媒体", "🏡 家庭生活", "❓ 未知情绪"];

export const PHYSICAL_SYMPTOMS = ["🫁 胸口发闷", "💓 心跳过快", "🌬️ 呼吸表浅", "🧠 头疼脑胀", "🦴 肌肉僵硬", "💦 手心出汗", "☀️ 暂无明显身体症状"];
