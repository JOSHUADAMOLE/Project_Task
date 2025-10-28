import React from "react";
import { Head } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";

export default function WorkStatistics({ statistics, chartData }) {
  const COLORS = {
    Completed: "#04770cff", 
    Incomplete: "#ef4444", 
  };

  // Group chart data by project
  const projectStats = chartData.reduce((acc, item) => {
    const project = acc[item.project] || { project: item.project, Completed: 0, Incomplete: 0 };
    project[item.status]++;
    acc[item.project] = project;
    return acc;
  }, {});

  const barData = Object.values(projectStats);
  const pieData = [
    { name: "Completed Tasks", value: statistics.completed_tasks },
    { name: "Incomplete Tasks", value: statistics.incomplete_tasks },
  ];

  return (
    <MainLayout title="Work Statistics">
      <Head title="Work Statistics" />
      <div className="p-8 space-y-10">
        <h1 className="text-2xl font-bold text-gray-800">Work Statistics Overview</h1>

        {/* Pie Chart */}
        <div className="bg-white shadow rounded-lg p-6 w-full max-w-xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 text-center">Overall Task Completion</h2>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <PieChart width={400} height={400}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#22c55e", "#ef4444", "#3b82f6", "#eab308"][index % 4]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white shadow rounded-lg p-6 w-full max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 text-center">Tasks by Project</h2>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <BarChart
          width={800}
          height={400}
          data={barData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="project"
            angle={-25}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 12, dy: 10 }} // move labels slightly down
          />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="Completed" fill="#22c55e">
            <LabelList dataKey="Completed" position="top" />
          </Bar>
          <Bar dataKey="Incomplete" fill="#ef4444">
            <LabelList dataKey="Incomplete" position="top" />
          </Bar>
        </BarChart>

        {/* Legend moved outside the chart */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <div style={{ width: "20px", height: "20px", backgroundColor: "#22c55e" }}></div>
            <span style={{ color: "white", fontWeight: "500" }}>Completed</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <div style={{ width: "20px", height: "20px", backgroundColor: "#ef4444" }}></div>
            <span style={{ color: "white", fontWeight: "500" }}>Incomplete</span>
          </div>
        </div>
      </div>
        </div> 
      </div>
    </MainLayout>
  );
}
