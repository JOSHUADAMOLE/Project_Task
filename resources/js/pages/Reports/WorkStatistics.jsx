import React from "react";
import { Head } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
} from "recharts";

export default function WorkStatistics({
  statistics,
  chartData,
  teamPerformance = [],
  individualPerformance = [],
}) {
  const pieData = [
    { name: "Completed", value: statistics.completed_tasks },
    { name: "Incomplete", value: statistics.incomplete_tasks },
  ];

  // Project bar data
  const projectStats = chartData.reduce((acc, item) => {
    const project = acc[item.project] || {
      project: item.project,
      Completed: 0,
      Incomplete: 0,
    };
    project[item.status]++;
    acc[item.project] = project;
    return acc;
  }, {});
  const projectBarData = Object.values(projectStats);

  return (
    <MainLayout title="Work Statistics">
      <Head title="Work Statistics" />

      <div className="p-8 space-y-14">
        <h1 className="text-2xl font-bold text-gray-800">
          Work Statistics Dashboard
        </h1>

        {/* ================= OVERALL COMPLETION ================= */}
        <div className="bg-white shadow rounded-lg p-6 max-w-xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-4">
            Overall Task Completion
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ================= TASKS BY PROJECT ================= */}
        <div className="bg-white shadow rounded-lg p-6 max-w-6xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-4">
            Tasks by Project
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={projectBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Completed" fill="#22c55e" />
              <Bar dataKey="Incomplete" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ================= TEAM PERFORMANCE ================= */}
        <div className="bg-white shadow rounded-lg p-6 max-w-6xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-4">
            Team Performance
          </h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={teamPerformance}
              layout="vertical"
              margin={{ left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis type="category" dataKey="team" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="completion_rate" fill="#3b82f6">
                <LabelList dataKey="completion_rate" position="right" formatter={(v) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ================= INDIVIDUAL PERFORMANCE ================= */}
        <div className="bg-white shadow rounded-lg p-6 max-w-6xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-4">
            Individual Performance Ranking
          </h2>

          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={individualPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="completion_rate" fill="#6366f1">
                <LabelList dataKey="completion_rate" position="top" formatter={(v) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  );
}
