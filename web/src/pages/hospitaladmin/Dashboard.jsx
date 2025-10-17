import React, { useEffect, useState } from "react";
import { Users, Stethoscope, Star, Hospital, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    averageRating: 0,
    activeDepartments: 0,
  });

  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch data from backend
      const res = await api.get("/users/me");
      const { hospital, doctors, patients } = res.data;

      const avgRating = hospital?.rating || 0;
      const departmentsCount = hospital?.departments?.length || 0;

      // Update top stats
      setStats({
        doctors: doctors || 0,
        patients: patients || 0,
        averageRating: avgRating,
        activeDepartments: departmentsCount,
      });

      // Create dynamic analytics dataset from current DB values
      // You can show trends like “Previous month vs Current month” using more API routes later
      const newAnalytics = [
        {
          name: "Current",
          Doctors: doctors || 0,
          Patients: patients || 0,
          Departments: departmentsCount,
        },
      ];

      setAnalyticsData(newAnalytics);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

  }, []);

  const StatCard = ({ icon: Icon, label, value, subText, colorFrom, colorTo }) => (
    <div
      className={`bg-gradient-to-r ${colorFrom} ${colorTo} p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform duration-300`}
    >
      <Icon className="text-white" size={36} />
      <h2 className="text-white text-lg font-semibold">{label}</h2>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subText && <p className="text-white text-sm opacity-90 -mt-1">{subText}</p>}
    </div>
  );

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">
        Healthcare Dashboard
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">Loading stats...</p>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Stethoscope}
              label="Doctors"
              value={stats.doctors}
              colorFrom="from-blue-500"
              colorTo="to-blue-400"
            />

            <StatCard
              icon={Users}
              label="Patients"
              subText="(pending / confirmed)"
              value={stats.patients}
              colorFrom="from-purple-500"
              colorTo="to-purple-400"
            />

            <StatCard
              icon={Star}
              label="Avg Rating"
              value={stats.averageRating}
              colorFrom="from-yellow-400"
              colorTo="to-yellow-500"
            />

            <StatCard
              icon={Hospital}
              label="Departments"
              value={stats.activeDepartments}
              colorFrom="from-pink-500"
              colorTo="to-pink-400"
            />
          </div>

          {/* Line Chart Analytics */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-blue-500" size={24} />
              <h3 className="text-xl font-semibold text-gray-700">Analytics Overview</h3>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Doctors" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Patients" stroke="#a855f7" strokeWidth={3} />
                <Line type="monotone" dataKey="Departments" stroke="#ec4899" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
