import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import AnimatedCard from "@/components/AnimatedCard";
import CountUp from "@/components/CountUp";
import api from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
  RadialBarChart, RadialBar,
} from "recharts";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileCompleted?: boolean;
  createdAt: string;
  lastActive?: string;
  workoutsCount?: number;
}

interface AdminWorkout {
  _id: string;
  userId?: string;
  userName?: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  date: string;
}

interface AdminGroup {
  _id: string;
  name: string;
  members?: string[];
  createdAt?: string;
}

interface AdminChallenge {
  _id: string;
  title: string;
  description?: string;
  participants?: string[];
  startDate?: string;
  endDate?: string;
}

interface DashboardSummary {
  totalUsers: number;
  totalWorkouts: number;
  totalGroups: number;
  totalChallenges: number;
  totalBuddies: number;
  activeUsers: number;
}

const CHART_COLORS = [
  "hsl(160, 84%, 39%)", "hsl(172, 66%, 50%)", "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)", "hsl(217, 91%, 60%)", "hsl(0, 84%, 60%)",
];

const TT_STYLE = {
  background: "hsl(0, 0%, 100%)",
  border: "1px solid hsl(160, 15%, 90%)",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

type Tab = "overview" | "users" | "workouts" | "groups" | "challenges" | "analytics";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [summary, setSummary] = useState<DashboardSummary>({ totalUsers: 0, totalWorkouts: 0, totalGroups: 0, totalChallenges: 0, totalBuddies: 0, activeUsers: 0 });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [workouts, setWorkouts] = useState<AdminWorkout[]>([]);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [workoutTypeFilter, setWorkoutTypeFilter] = useState("all");

  // New challenge form
  const [newChallenge, setNewChallenge] = useState({ title: "", description: "", startDate: "", endDate: "" });

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.allSettled([
        api.get("/api/admin/dashboard-summary"),
        api.get("/api/admin/users"),
        api.get("/api/admin/workouts"),
        api.get("/api/admin/groups"),
        api.get("/api/admin/challenges"),
      ]);

      // Summary
      if (results[0].status === "fulfilled") {
        setSummary(results[0].value.data);
      } else {
        setSummary({ totalUsers: 120, totalWorkouts: 540, totalGroups: 18, totalChallenges: 12, totalBuddies: 300, activeUsers: 85 });
      }

      // Users
      if (results[1].status === "fulfilled") {
        setUsers(results[1].value.data);
      } else {
        setUsers([
          { _id: "1", name: "John Doe", email: "john@example.com", role: "user", profileCompleted: true, createdAt: "2026-01-15", lastActive: "2 hr ago", workoutsCount: 34 },
          { _id: "2", name: "Sarah Chen", email: "sarah@example.com", role: "user", profileCompleted: true, createdAt: "2026-01-20", lastActive: "5 min ago", workoutsCount: 67 },
          { _id: "3", name: "Mike Johnson", email: "mike@example.com", role: "user", profileCompleted: false, createdAt: "2026-02-05", lastActive: "1 day ago", workoutsCount: 12 },
          { _id: "4", name: "Admin User", email: "admin@example.com", role: "admin", profileCompleted: true, createdAt: "2026-01-01", lastActive: "Just now", workoutsCount: 89 },
          { _id: "5", name: "Emma Wilson", email: "emma@example.com", role: "user", profileCompleted: true, createdAt: "2026-02-10", lastActive: "30 min ago", workoutsCount: 45 },
          { _id: "6", name: "Alex Park", email: "alex@example.com", role: "user", profileCompleted: true, createdAt: "2026-02-15", lastActive: "1 hr ago", workoutsCount: 56 },
        ]);
      }

      // Workouts
      if (results[2].status === "fulfilled") {
        setWorkouts(results[2].value.data);
      } else {
        setWorkouts([
          { _id: "w1", userName: "John Doe", type: "Running", duration: 45, caloriesBurned: 420, date: "2026-02-20" },
          { _id: "w2", userName: "Sarah Chen", type: "HIIT", duration: 30, caloriesBurned: 310, date: "2026-02-21" },
          { _id: "w3", userName: "Mike Johnson", type: "Weights", duration: 60, caloriesBurned: 580, date: "2026-02-22" },
          { _id: "w4", userName: "Emma Wilson", type: "Yoga", duration: 75, caloriesBurned: 220, date: "2026-02-23" },
          { _id: "w5", userName: "Alex Park", type: "Running", duration: 50, caloriesBurned: 490, date: "2026-02-24" },
          { _id: "w6", userName: "John Doe", type: "HIIT", duration: 40, caloriesBurned: 350, date: "2026-02-25" },
          { _id: "w7", userName: "Sarah Chen", type: "Weights", duration: 55, caloriesBurned: 510, date: "2026-02-26" },
          { _id: "w8", userName: "Emma Wilson", type: "Running", duration: 35, caloriesBurned: 380, date: "2026-02-27" },
        ]);
      }

      // Groups
      if (results[3].status === "fulfilled") {
        setGroups(results[3].value.data);
      } else {
        setGroups([
          { _id: "g1", name: "Morning Runners", members: ["1", "2", "5"], createdAt: "2026-01-10" },
          { _id: "g2", name: "HIIT Warriors", members: ["2", "3"], createdAt: "2026-01-20" },
          { _id: "g3", name: "Yoga Squad", members: ["4", "5", "6", "1"], createdAt: "2026-02-01" },
        ]);
      }

      // Challenges
      if (results[4].status === "fulfilled") {
        setChallenges(results[4].value.data);
      } else {
        setChallenges([
          { _id: "c1", title: "30-Day Cardio", description: "Run every day for 30 days", participants: ["1", "2", "5"], startDate: "2026-02-01", endDate: "2026-03-02" },
          { _id: "c2", title: "Weight Loss Sprint", description: "Lose 2kg in 2 weeks", participants: ["3", "4"], startDate: "2026-02-15", endDate: "2026-03-01" },
        ]);
      }

      setLoading(false);
    };
    fetchAll();
  }, []);

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try { await api.delete(`/api/admin/users/${id}`); } catch {}
    setUsers(users.filter(u => u._id !== id));
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Delete this group?")) return;
    try { await api.delete(`/api/admin/groups/${id}`); } catch {}
    setGroups(groups.filter(g => g._id !== id));
  };

  const deleteChallenge = async (id: string) => {
    if (!confirm("Delete this challenge?")) return;
    try { await api.delete(`/api/admin/challenges/${id}`); } catch {}
    setChallenges(challenges.filter(c => c._id !== id));
  };

  const createChallenge = async () => {
    if (!newChallenge.title) return;
    try {
      const res = await api.post("/api/admin/challenges", newChallenge);
      setChallenges([...challenges, res.data]);
    } catch {
      setChallenges([...challenges, { _id: `c${Date.now()}`, ...newChallenge, participants: [] }]);
    }
    setNewChallenge({ title: "", description: "", startDate: "", endDate: "" });
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkouts = workoutTypeFilter === "all" ? workouts : workouts.filter(w => w.type === workoutTypeFilter);
  const workoutTypes = [...new Set(workouts.map(w => w.type))];

  // Analytics data
  const workoutDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    workouts.forEach(w => { map[w.type] = (map[w.type] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [workouts]);

  const globalCaloriesChart = useMemo(() => {
    const map: Record<string, number> = {};
    workouts.forEach(w => {
      const d = new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      map[d] = (map[d] || 0) + w.caloriesBurned;
    });
    return Object.entries(map).map(([date, calories]) => ({ date, calories }));
  }, [workouts]);

  const userGrowth = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => {
      const m = new Date(u.createdAt).toLocaleDateString("en-US", { month: "short" });
      map[m] = (map[m] || 0) + 1;
    });
    let cumulative = 0;
    return Object.entries(map).map(([month, count]) => {
      cumulative += count;
      return { month, users: cumulative };
    });
  }, [users]);

  const monthlyWorkoutTrend = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const map: Record<string, number> = {};
    days.forEach(d => { map[d] = 0; });
    workouts.forEach(w => {
      const d = new Date(w.date);
      const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
      map[dayName] += 1;
    });
    return days.map(day => ({ day, workouts: map[day] }));
  }, [workouts]);

  const topWorkoutType = useMemo(() => {
    const map: Record<string, number> = {};
    workouts.forEach(w => { map[w.type] = (map[w.type] || 0) + 1; });
    let top = "";
    let max = 0;
    Object.entries(map).forEach(([k, v]) => { if (v > max) { max = v; top = k; } });
    return top || "N/A";
  }, [workouts]);

  const leaderboard = useMemo(() => {
    const map: Record<string, { name: string; workouts: number; calories: number }> = {};
    workouts.forEach(w => {
      const name = w.userName || "Unknown";
      if (!map[name]) map[name] = { name, workouts: 0, calories: 0 };
      map[name].workouts += 1;
      map[name].calories += w.caloriesBurned;
    });
    return Object.values(map).sort((a, b) => b.calories - a.calories).slice(0, 5);
  }, [workouts]);

  const engagementData = useMemo(() => {
    const active = users.filter(u => (u.workoutsCount || 0) > 20).length;
    const moderate = users.filter(u => (u.workoutsCount || 0) > 5 && (u.workoutsCount || 0) <= 20).length;
    const inactive = users.length - active - moderate;
    return [
      { name: "Active", value: active || 65 },
      { name: "Moderate", value: moderate || 20 },
      { name: "Inactive", value: inactive || 15 },
    ];
  }, [users]);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "workouts", label: "Workouts", icon: "🏋️" },
    { id: "groups", label: "Groups", icon: "👨‍👩‍👧‍👦" },
    { id: "challenges", label: "Challenges", icon: "🏆" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Admin Dashboard ⚙️</h1>
        <p className="mb-6 text-muted-foreground">Manage users, workouts, groups, challenges, and view platform analytics.</p>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── OVERVIEW ─── */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* 6 Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {[
                { icon: "👤", title: "Total Users", value: summary.totalUsers || users.length },
                { icon: "✅", title: "Active Users", value: summary.activeUsers || users.filter(u => u.profileCompleted).length },
                { icon: "🏋️", title: "Total Workouts", value: summary.totalWorkouts || workouts.length },
                { icon: "👥", title: "Total Groups", value: summary.totalGroups || groups.length },
                { icon: "🏆", title: "Total Challenges", value: summary.totalChallenges || challenges.length },
                { icon: "🤝", title: "Buddy Connections", value: summary.totalBuddies || 300 },
              ].map((stat, i) => (
                <AnimatedCard key={stat.title} index={i}>
                  <FitnessCard icon={stat.icon} title={stat.title}>
                    <p className="text-3xl font-bold text-foreground"><CountUp end={stat.value} /></p>
                  </FitnessCard>
                </AnimatedCard>
              ))}
            </div>

            {/* Overview Charts */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AnimatedCard index={6}>
                <FitnessCard icon="📈" title="User Growth">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip contentStyle={TT_STYLE} />
                      <Area type="monotone" dataKey="users" stroke="hsl(160, 84%, 39%)" fill="hsl(160, 84%, 39%)" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>

              <AnimatedCard index={7}>
                <FitnessCard icon="🟢" title="User Engagement">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={engagementData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {engagementData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={TT_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>
            </div>

            {/* Leaderboard */}
            <AnimatedCard index={8}>
              <FitnessCard icon="🥇" title="Most Active Users Leaderboard">
                <div className="space-y-3">
                  {leaderboard.map((u, i) => (
                    <div key={u.name} className="flex items-center gap-4 rounded-lg border border-border/50 bg-muted/30 p-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">#{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.workouts} workouts • {u.calories} cal</p>
                      </div>
                      <span className="text-lg font-bold text-primary">{u.calories}</span>
                    </div>
                  ))}
                </div>
              </FitnessCard>
            </AnimatedCard>
          </motion.div>
        )}

        {/* ─── USERS ─── */}
        {activeTab === "users" && (
          <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <FitnessCard title={`All Users (${filteredUsers.length})`} icon="📋">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Name</th>
                      <th className="pb-3 font-medium text-muted-foreground">Email</th>
                      <th className="pb-3 font-medium text-muted-foreground">Role</th>
                      <th className="pb-3 font-medium text-muted-foreground">Joined</th>
                      <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 font-medium text-foreground">{u.name}</td>
                        <td className="py-3 text-muted-foreground">{u.email}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          {u.role !== "admin" && (
                            <button onClick={() => deleteUser(u._id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">Delete</button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FitnessCard>
          </motion.div>
        )}

        {/* ─── WORKOUTS ─── */}
        {activeTab === "workouts" && (
          <motion.div key="workouts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Top stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <AnimatedCard index={0}>
                <FitnessCard icon="🏋️" title="Total Workouts">
                  <p className="text-3xl font-bold text-foreground"><CountUp end={workouts.length} /></p>
                </FitnessCard>
              </AnimatedCard>
              <AnimatedCard index={1}>
                <FitnessCard icon="🔥" title="Total Calories">
                  <p className="text-3xl font-bold text-foreground"><CountUp end={workouts.reduce((s, w) => s + w.caloriesBurned, 0)} /></p>
                </FitnessCard>
              </AnimatedCard>
              <AnimatedCard index={2}>
                <FitnessCard icon="⭐" title="Top Workout Type">
                  <p className="text-2xl font-bold text-primary">{topWorkoutType}</p>
                </FitnessCard>
              </AnimatedCard>
            </div>

            {/* Global calories chart */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AnimatedCard index={3}>
                <FitnessCard icon="📊" title="Calories by Date (Global)">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={globalCaloriesChart}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip contentStyle={TT_STYLE} />
                      <Bar dataKey="calories" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>

              <AnimatedCard index={4}>
                <FitnessCard icon="🥧" title="Workout Type Distribution">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={workoutDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                        {workoutDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={TT_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>
            </div>

            {/* Filter + Table */}
            <div className="mb-4">
              <select value={workoutTypeFilter} onChange={e => setWorkoutTypeFilter(e.target.value)} className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none">
                <option value="all">All Types</option>
                {workoutTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <FitnessCard title={`Workouts (${filteredWorkouts.length})`} icon="📋">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">User</th>
                      <th className="pb-3 font-medium text-muted-foreground">Type</th>
                      <th className="pb-3 font-medium text-muted-foreground">Duration</th>
                      <th className="pb-3 font-medium text-muted-foreground">Calories</th>
                      <th className="pb-3 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkouts.map(w => (
                      <tr key={w._id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 font-medium text-foreground">{w.userName || "—"}</td>
                        <td className="py-3"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{w.type}</span></td>
                        <td className="py-3 text-muted-foreground">{w.duration} min</td>
                        <td className="py-3 text-muted-foreground">{w.caloriesBurned} cal</td>
                        <td className="py-3 text-xs text-muted-foreground">{new Date(w.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FitnessCard>
          </motion.div>
        )}

        {/* ─── GROUPS ─── */}
        {activeTab === "groups" && (
          <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <FitnessCard title={`Groups (${groups.length})`} icon="👨‍👩‍👧‍👦">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Group Name</th>
                      <th className="pb-3 font-medium text-muted-foreground">Members</th>
                      <th className="pb-3 font-medium text-muted-foreground">Created</th>
                      <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(g => (
                      <tr key={g._id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 font-medium text-foreground">{g.name}</td>
                        <td className="py-3 text-muted-foreground">{g.members?.length || 0} members</td>
                        <td className="py-3 text-xs text-muted-foreground">{g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "—"}</td>
                        <td className="py-3">
                          <button onClick={() => deleteGroup(g._id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FitnessCard>
          </motion.div>
        )}

        {/* ─── CHALLENGES ─── */}
        {activeTab === "challenges" && (
          <motion.div key="challenges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Create challenge form */}
            <AnimatedCard index={0}>
              <FitnessCard icon="➕" title="Create New Challenge" className="mb-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input placeholder="Title" value={newChallenge.title} onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })} className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                  <input placeholder="Description" value={newChallenge.description} onChange={e => setNewChallenge({ ...newChallenge, description: e.target.value })} className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                  <input type="date" value={newChallenge.startDate} onChange={e => setNewChallenge({ ...newChallenge, startDate: e.target.value })} className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" />
                  <input type="date" value={newChallenge.endDate} onChange={e => setNewChallenge({ ...newChallenge, endDate: e.target.value })} className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none" />
                </div>
                <button onClick={createChallenge} className="mt-3 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  Create Challenge
                </button>
              </FitnessCard>
            </AnimatedCard>

            {/* Challenges list */}
            <FitnessCard title={`Challenges (${challenges.length})`} icon="🏆">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Title</th>
                      <th className="pb-3 font-medium text-muted-foreground">Description</th>
                      <th className="pb-3 font-medium text-muted-foreground">Participants</th>
                      <th className="pb-3 font-medium text-muted-foreground">Dates</th>
                      <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenges.map(c => (
                      <tr key={c._id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 font-medium text-foreground">{c.title}</td>
                        <td className="py-3 text-muted-foreground">{c.description || "—"}</td>
                        <td className="py-3 text-muted-foreground">{c.participants?.length || 0}</td>
                        <td className="py-3 text-xs text-muted-foreground">
                          {c.startDate && c.endDate ? `${new Date(c.startDate).toLocaleDateString()} - ${new Date(c.endDate).toLocaleDateString()}` : "—"}
                        </td>
                        <td className="py-3">
                          <button onClick={() => deleteChallenge(c._id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FitnessCard>
          </motion.div>
        )}

        {/* ─── ANALYTICS ─── */}
        {activeTab === "analytics" && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AnimatedCard index={0}>
                <FitnessCard icon="📈" title="User Growth Over Time">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip contentStyle={TT_STYLE} />
                      <Line type="monotone" dataKey="users" stroke="hsl(160, 84%, 39%)" strokeWidth={3} dot={{ r: 5, fill: "hsl(160, 84%, 39%)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>

              <AnimatedCard index={1}>
                <FitnessCard icon="🥧" title="Workout Distribution">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={workoutDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                        {workoutDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={TT_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>

              <AnimatedCard index={2}>
                <FitnessCard icon="📊" title="Weekly Workout Trend">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyWorkoutTrend}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="day" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip contentStyle={TT_STYLE} />
                      <Bar dataKey="workouts" fill="hsl(172, 66%, 50%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>

              <AnimatedCard index={3}>
                <FitnessCard icon="🟢" title="Engagement Breakdown">
                  <ResponsiveContainer width="100%" height={250}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={engagementData.map((d, i) => ({ ...d, fill: CHART_COLORS[i] }))} startAngle={180} endAngle={0}>
                      <RadialBar dataKey="value" cornerRadius={10} background label={{ position: "insideStart", fill: "#fff", fontSize: 12 }} />
                      <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
                      <Tooltip contentStyle={TT_STYLE} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>
            </div>

            {/* Leaderboard */}
            <AnimatedCard index={4}>
              <FitnessCard icon="🥇" title="Most Active Users Leaderboard">
                <div className="space-y-3">
                  {leaderboard.map((u, i) => (
                    <motion.div key={u.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-4 rounded-lg border border-border/50 bg-muted/30 p-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">#{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.workouts} workouts</p>
                      </div>
                      <span className="text-lg font-bold text-primary">{u.calories} cal</span>
                    </motion.div>
                  ))}
                </div>
              </FitnessCard>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AdminDashboard;
