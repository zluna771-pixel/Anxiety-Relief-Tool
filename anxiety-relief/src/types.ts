/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MoodLog {
  id: string;
  timestamp: string; // ISO string
  moodScore: number; // 1 (Severely Anxious / Panicked) to 10 (Deeply Serene / Calm)
  primaryEmotion: string; // e.g. "Panicked" | "Anxious" | "Restless" | "Tense" | "Neutral" | "Calm" | "Peaceful"
  note: string;
  triggers: string[]; // e.g. ["Work", "Social", "Health", "Sleep", "Unknown"]
  physicalSymptoms: string[]; // e.g. ["Tight Chest", "Heart Racing", "Brain Fog", "Headache", "None"]
}

export interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  benefits: string;
  inhale: number; // seconds
  hold1: number; // seconds
  exhale: number; // seconds
  hold2: number; // seconds
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface Sound {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon identifier
  type: "noise" | "wave" | "drone" | "binaural";
  hasVolumeControl: boolean;
  defaultVolume: number;
}
