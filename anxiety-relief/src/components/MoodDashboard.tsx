/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, CartesianGrid } from "recharts";
import { TrendingUp, Award, Calendar, AlertTriangle, ShieldCheck, Heart } from "lucide-react";
import { MoodLog } from "../types";

interface MoodDashboardProps {
  logs: MoodLog[];
}

export default function MoodDashboard({ logs }: MoodDashboardProps) {
  // 1. Calculate general indicators
  const stats = useMemo(() => {
    if (logs.length === 0) return { avgScore: 0, latestScore: 0, statusLabel: "暂无数据", statusColor: "text-slate-500", totalCompleted: 0 };

    const totalScore = logs.reduce((acc, log) => acc + log.moodScore, 0);
    const avg = totalScore / logs.length;
    const latest = logs[0].moodScore;

    let status = "稳定安欣";
    let color = "text-[#8BA88E]";
    if (avg < 4.0) {
      status = "严重红灯焦虑";
      color = "text-rose-700";
    } else if (avg < 6.5) {
      status = "中度沉重焦虑";
      color = "text-amber-700 font-medium";
    } else if (avg < 8.0) {
      status = "轻度紧绷状态";
      color = "text-[#627A65] font-medium";
    }

    return {
      avgScore: Number(avg.toFixed(1)),
      latestScore: latest,
      statusLabel: status,
      statusColor: color,
      totalCompleted: logs.length
    };
  }, [logs]);

  // 2. Prepare timeline logs data for Recharts Line Chart
  const timelineData = useMemo(() => {
    // We reverse logs so they go chronologically (oldest -> newest) for the trend line
    return [...logs]
      .reverse()
      .map((log) => {
        const d = new Date(log.timestamp);
        return {
          formattedDate: d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
          score: log.moodScore,
          emotion: log.primaryEmotion,
        };
      });
  }, [logs]);

  // 3. Aggregate triggers data
  const triggerStats = useMemo(() => {
    const counts: { [key: string]: number } = {};
    logs.forEach((log) => {
      log.triggers.forEach((trigger) => {
        counts[trigger] = (counts[trigger] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // display top 5
  }, [logs]);

  // 4. Aggregate somatic symptoms
  const symptomStats = useMemo(() => {
    const counts: { [key: string]: number } = {};
    logs.forEach((log) => {
      log.physicalSymptoms.forEach((symptom) => {
        counts[symptom] = (counts[symptom] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div id="dashboard-empty-card" className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-3xl p-8 text-center shadow-sm">
        <TrendingUp className="w-12 h-12 text-[#8BA88E]/20 mx-auto mb-4" />
        <h2 className="text-lg font-serif italic font-medium text-[#3E4A3F]">长期趋势洞察看板</h2>
        <p className="text-xs text-[#7A8C7C] mt-2 max-w-sm mx-auto leading-relaxed font-sans">
          通过多条心情日记的累积，系统在此处会使用科学图表，为你描画自主神经调节趋势图，寻找生活规律、识别高压力诱因因子。
          <br />
          <br />
          <strong className="text-[#8BA88E]">请优先记录第一条情绪状态。</strong>
        </p>
      </div>
    );
  }

  return (
    <div id="dashboard-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* A. Statistics Summary Panel */}
      <div id="dashboard-stats-card" className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full bg-[#8BA88E]/5 blur-2xl" />

        <div>
          <h2 className="text-lg font-serif italic text-[#3E4A3F] font-medium flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-[#8BA88E] animate-pulse" />
            身心状态雷达
          </h2>

          <div className="space-y-5">
            <div className="bg-[#FAF7F2]/60 border border-[#E6E1D6] rounded-2xl p-4 flex justify-between items-center shadow-inner">
              <div>
                <span className="text-[10px] font-sans text-[#7A8C7C] uppercase tracking-wider block font-semibold">
                  平均情绪得分 (1-10)
                </span>
                <span className="text-3xl font-mono font-bold text-[#3E4A3F] mt-0.5 block">
                  {stats.avgScore}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-sans text-[#7A8C7C] uppercase tracking-wider block font-semibold">
                  评级
                </span>
                <span className={`text-xs font-sans font-semibold block mt-1.5 ${stats.statusColor}`}>
                  {stats.statusLabel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#FAF7F2]/60 border border-[#E6E1D6] rounded-2xl p-4 shadow-inner">
                <span className="text-[10px] font-sans text-[#7A8C7C] uppercase tracking-wider block font-semibold">
                  已累计日志
                </span>
                <span className="text-xl font-mono font-bold text-[#8BA88E] mt-1 block">
                  {stats.totalCompleted} 篇
                </span>
              </div>

              <div className="bg-[#FAF7F2]/60 border border-[#E6E1D6] rounded-2xl p-4 shadow-inner">
                <span className="text-[10px] font-sans text-[#7A8C7C] uppercase tracking-wider block font-semibold">
                  最近一次得分
                </span>
                <span className="text-xl font-mono font-bold text-[#4A5D4E] mt-1 block">
                  {stats.latestScore}分
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cognitive Reassurance and Advice Section */}
        <div className="mt-6 p-4 rounded-2xl bg-[#E6E1D6]/40 border border-[#E6E1D6] space-y-1.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-[#3E4A3F] font-serif italic text-xs">
            <ShieldCheck className="w-4 h-4 text-[#8BA88E]" />
            <span>认知行为疗法 (CBT) 提醒</span>
          </div>
          <p className="text-xs text-[#4A5D4E] leading-relaxed font-sans">
            {stats.avgScore >= 7.5 ? (
              "整体来看，你的植物神经具有卓越的弹性。即使有时感到焦虑，那只是身体在传递警惕信号，并不是危险。继续保持当前的冥想或呼吸习惯！"
            ) : stats.avgScore >= 5.5 ? (
              "数据表明你最近处于轻中度高张状态。这种疲塌紧绷通常与工作人际或睡眠不足等息息相关。推荐多使用 4-7-8 呼吸，给神经放一次带温水的模拟假。"
            ) : (
              "你的情绪线波动处于临界压力值。切记：所有的焦虑性胸口发闷、心跳加快都仅仅是过度通气引发的物理反响。每一次主动长呼气都是在直接重置身体抗拒开关。多做 5-4-3-2-1 物理看齐。"
            )}
          </p>
        </div>
      </div>

      {/* B. Line Chart (Emotional Trend) */}
      <div id="dashboard-trend-card" className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-3xl p-6 shadow-sm lg:col-span-2 relative overflow-hidden flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-serif italic text-[#3E4A3F] font-medium flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#8BA88E]" />
            自主神经安宁曲线图
          </h2>
          <p className="text-xs text-[#7A8C7C] mb-4 leading-relaxed font-sans">
            横轴：时间日期 · 纵轴：冷静度评分 (得分越高代表神经越放松安定)
          </p>
        </div>

        {/* Line Chart Component Area */}
        <div className="h-56 mt-2" id="line-chart-stage">
          <ResponsiveContainer width="105%" height="100%">
            <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E1D6" />
              <XAxis
                dataKey="formattedDate"
                stroke="#C4BEB3"
                tick={{ fill: "#7A8C7C", fontSize: 10, fontFamily: "sans-serif" }}
              />
              <YAxis
                domain={[1, 10]}
                stroke="#C4BEB3"
                tick={{ fill: "#7A8C7C", fontSize: 10, fontFamily: "sans-serif" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FAF7F2",
                  borderColor: "#E6E1D6",
                  borderRadius: "16px",
                  fontSize: "11px",
                  color: "#3E4A3F",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                name="心情得分"
                stroke="#8BA88E"
                strokeWidth={3}
                dot={{ r: 4, stroke: "#8BA88E", strokeWidth: 1, fill: "#FAF7F2" }}
                activeDot={{ r: 6, fill: "#8BA88E" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* C. Triggers Frequency bar chart */}
      <div id="dashboard-triggers-card" className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-3xl p-6 shadow-sm relative overflow-hidden lg:col-span-1.5">
        <h2 className="text-sm font-serif italic text-[#3E4A3F] font-semibold flex items-center gap-1.5 mb-2">
          <AlertTriangle className="w-4.5 h-4.5 text-[#8BA88E]" />
          常见焦虑压力源分析
        </h2>
        <p className="text-[11px] text-[#7A8C7C] mb-4 font-sans">
          系统检测记录到的生活诱因及其发生频度 (次数)
        </p>

        {triggerStats.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-xs text-[#7A8C7C] font-sans py-8">
            暂无记录的诱因数据。
          </div>
        ) : (
          <div className="h-44" id="triggers-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={triggerStats} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                <XAxis
                  dataKey="name"
                  stroke="#E6E1D6"
                  tick={{ fill: "#7A8C7C", fontSize: 10 }}
                />
                <YAxis
                  stroke="#E6E1D6"
                  allowDecimals={false}
                  tick={{ fill: "#7A8C7C", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FAF7F2",
                    borderColor: "#E6E1D6",
                    borderRadius: "12px",
                    fontSize: "10px",
                    color: "#3E4A3F"
                  }}
                />
                <Bar dataKey="count" name="发生频率" fill="#8BA88E">
                  {triggerStats.map((entry, index) => (
                    <Cell key={index} fill="#8BA88E" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* D. Somatic Physical Symptoms frequency statistics */}
      <div id="dashboard-symptoms-card" className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-3xl p-6 shadow-sm relative overflow-hidden lg:col-span-1.5">
        <h2 className="text-sm font-serif italic text-[#3E4A3F] font-semibold flex items-center gap-1.5 mb-2">
          <Award className="w-4.5 h-4.5 text-[#8BA88E]" />
          心身反应躯体图谱
        </h2>
        <p className="text-[11px] text-[#7A8C7C] mb-4 font-sans">
          你的心血管及呼吸系统面对压力时最常呈现的躯体信号 (次数)
        </p>

        {symptomStats.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-xs text-[#7A8C7C] font-sans py-8">
            暂无胸闷或心跳等身体现象记录。
          </div>
        ) : (
          <div className="h-44" id="symptoms-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={symptomStats} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                <XAxis
                  dataKey="name"
                  stroke="#E6E1D6"
                  tick={{ fill: "#7A8C7C", fontSize: 10 }}
                />
                <YAxis
                  stroke="#E6E1D6"
                  allowDecimals={false}
                  tick={{ fill: "#7A8C7C", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FAF7F2",
                    borderColor: "#E6E1D6",
                    borderRadius: "12px",
                    fontSize: "10px",
                    color: "#3E4A3F"
                  }}
                />
                <Bar dataKey="count" name="次数" fill="#C4BEB3">
                  {symptomStats.map((entry, index) => (
                    <Cell key={index} fill="#C4BEB3" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
