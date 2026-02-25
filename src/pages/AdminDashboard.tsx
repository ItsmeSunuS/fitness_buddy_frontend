import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import AnimatedCard from "@/components/AnimatedCard";
import CountUp from "@/components/CountUp";
import api from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileCompleted: boolean;
  createdAt: string;
  lastActive?: string;
  workoutsCount?: number;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(142 76% 36%)",
  "hsl(38 92% 50%)",
  "hsl(0 84% 60%)",
];

const mockSignupData = [
  { month: "Jan", users: 12 }, { month: "Feb", users: 19 }, { month: "Mar", users: 28 },
  { month: "Apr", users: 35 }, { month: "May", users: 42 }, { month: "Jun", users: 58 },
];

const mockActivityData = [
  { day: "Mon", workouts: 45, challenges: 12 }, { day: "Tue", workouts: 52, challenges: 18 },
  { day: "Wed", workouts: 61, challenges: 15 }, { day: "Thu", workouts: 40, challenges: 20 },
  { day: "Fri", workouts: 55, challenges: 22 }, { day: "Sat", workouts: 70, challenges: 30 },
  { day: "Sun", workouts: 48, challenges: 14 },
];

const mockEngagementData = [
  { name: "Active", value: 65 }, { name: "Moderate", value: 20 },
  { name: "Inactive", value: 15 },
];

const mockRevenueData = [
  { month: "Jan", revenue: 2400 }, { month: "Feb", revenue: 3200 },
  { month: "Mar", revenue: 4100 }, { month: "Apr", revenue: 3800 },
  { month: "May", revenue: 5200 }, { month: "Jun", revenue: 6100 },
];

const recentActivity = [
  { user: "Sarah Chen", action: "Completed 30-Day Challenge", time: "2 min ago", type: "challenge" },
  { user: "Mike Johnson", action: "Logged 45min cardio workout", time: "15 min ago", type: "workout" },
  { user: "John Doe", action: "Joined a new group", time: "1 hr ago", type: "group" },
  { user: "Emma Wilson", action: "Found a new buddy", time: "2 hr ago", type: "buddy" },
  { user: "Alex Park", action: "Updated profile", time: "3 hr ago", type: "profile" },
];

const activityIcons: Record<string, string> = {
  challenge: "🏆", workout: "🏋️", group: "👥", buddy: "🤝", profile: "👤",
};

type Tab = "overview" | "users" | "analytics" | "activity";

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/api/admin/users");
        setUsers(res.data);
      } catch {
        setUsers([
          { _id: "1", name: "John Doe", email: "john@example.com", role: "user", profileCompleted: true, createdAt: "2024-01-15", lastActive: "2 hr ago", workoutsCount: 34 },
          { _id: "2", name: "Sarah Chen", email: "sarah@example.com", role: "user", profileCompleted: true, createdAt: "2024-02-10", lastActive: "5 min ago", workoutsCount: 67 },
          { _id: "3", name: "Mike Johnson", email: "mike@example.com", role: "user", profileCompleted: false, createdAt: "2024-03-05", lastActive: "1 day ago", workoutsCount: 12 },
          { _id: "4", name: "Admin User", email: "admin@example.com", role: "admin", profileCompleted: true, createdAt: "2024-01-01", lastActive: "Just now", workoutsCount: 89 },
          { _id: "5", name: "Emma Wilson", email: "emma@example.com", role: "user", profileCompleted: true, createdAt: "2024-04-20", lastActive: "30 min ago", workoutsCount: 45 },
          { _id: "6", name: "Alex Park", email: "alex@example.com", role: "moderator", profileCompleted: true, createdAt: "2024-02-28", lastActive: "1 hr ago", workoutsCount: 56 },
        ]);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try { await api.delete(`/api/admin/users/${id}`); } catch { /* mock */ }
    setUsers(users.filter((u) => u._id !== id));
  };

  const toggleRole = async (id: string, newRole: string) => {
    try { await api.patch(`/api/admin/users/${id}`, { role: newRole }); } catch { /* mock */ }
    setUsers(users.map((u) => u._id === id ? { ...u, role: newRole } : u));
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "activity", label: "Activity", icon: "🔔" },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Admin Dashboard ⚙️</h1>
        <p className="mb-6 text-muted-foreground">Manage users, monitor platform activity, and view analytics.</p>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-border bg-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {/* Stat Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: "👤", title: "Total Users", value: users.length, color: "text-primary" },
                { icon: "✅", title: "Active Profiles", value: users.filter((u) => u.profileCompleted).length, color: "text-success" },
                { icon: "🛡️", title: "Admins", value: users.filter((u) => u.role === "admin").length, color: "text-warning" },
                { icon: "🏋️", title: "Total Workouts", value: users.reduce((s, u) => s + (u.workoutsCount || 0), 0), color: "text-accent-foreground" },
              ].map((stat, i) => (
                <AnimatedCard key={stat.title} index={i}>
                  <FitnessCard icon={stat.icon} title={stat.title}>
                    <p className={`text-3xl font-bold ${stat.color}`}><CountUp end={stat.value} /></p>
                  </FitnessCard>
                </AnimatedCard>
              ))}
            </div>

            {/* Charts Row */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AnimatedCard index={4}>
                <FitnessCard icon="📈" title="User Signups (Monthly)">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={mockSignupData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }} />
                      <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>

              <AnimatedCard index={5}>
                <FitnessCard icon="🟢" title="User Engagement">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={mockEngagementData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {mockEngagementData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>
            </div>

            {/* Recent Activity */}
            <AnimatedCard index={6}>
              <FitnessCard icon="🔔" title="Recent Activity">
                <div className="space-y-3">
                  {recentActivity.slice(0, 4).map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                    >
                      <span className="text-xl">{activityIcons[a.type]}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground"><span className="text-primary">{a.user}</span> {a.action}</p>
                        <p className="text-xs text-muted-foreground">{a.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FitnessCard>
            </AnimatedCard>
          </motion.div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {/* Search & Filter */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
                <option value="moderator">Moderators</option>
              </select>
            </div>

            <FitnessCard title={`All Users (${filteredUsers.length})`} icon="📋">
              {loading ? (
                <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 font-medium text-muted-foreground">Name</th>
                        <th className="pb-3 font-medium text-muted-foreground">Email</th>
                        <th className="pb-3 font-medium text-muted-foreground">Role</th>
                        <th className="pb-3 font-medium text-muted-foreground">Profile</th>
                        <th className="pb-3 font-medium text-muted-foreground">Last Active</th>
                        <th className="pb-3 font-medium text-muted-foreground">Workouts</th>
                        <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-3 font-medium text-foreground">{u.name}</td>
                          <td className="py-3 text-muted-foreground">{u.email}</td>
                          <td className="py-3">
                            <select
                              value={u.role}
                              onChange={(e) => toggleRole(u._id, e.target.value)}
                              className={`rounded-full border-none px-2.5 py-1 text-xs font-medium focus:outline-none ${
                                u.role === "admin" ? "bg-primary/10 text-primary" : u.role === "moderator" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <option value="user">user</option>
                              <option value="moderator">moderator</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="py-3">
                            <span className={`text-xs ${u.profileCompleted ? "text-success" : "text-warning"}`}>
                              {u.profileCompleted ? "✓ Complete" : "⏳ Pending"}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-muted-foreground">{u.lastActive || "—"}</td>
                          <td className="py-3 text-sm font-medium text-foreground">{u.workoutsCount || 0}</td>
                          <td className="py-3">
                            {u.role !== "admin" && (
                              <button onClick={() => deleteUser(u._id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">
                                Delete
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </FitnessCard>
          </motion.div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AnimatedCard index={0}>
                <FitnessCard icon="📊" title="Platform Activity (Weekly)">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={mockActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }} />
                      <Legend />
                      <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="challenges" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>

              <AnimatedCard index={1}>
                <FitnessCard icon="💰" title="Revenue Trend">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={mockRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }} formatter={(v: number) => [`$${v}`, "Revenue"]} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>

              <AnimatedCard index={2}>
                <FitnessCard icon="📈" title="User Growth">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={mockSignupData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }} />
                      <Area type="monotone" dataKey="users" stroke="hsl(142 76% 36%)" fill="hsl(142 76% 36% / 0.2)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>

              <AnimatedCard index={3}>
                <FitnessCard icon="🎯" title="Engagement Breakdown">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={mockEngagementData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {mockEngagementData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </FitnessCard>
              </AnimatedCard>
            </div>
          </motion.div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <FitnessCard icon="🔔" title="All Recent Activity">
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/30 p-4"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl">
                      {activityIcons[a.type]}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-primary">{a.user}</span> {a.action}
                      </p>
                      <p className="text-xs text-muted-foreground">{a.time}</p>
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-muted-foreground">
                      {a.type}
                    </span>
                  </motion.div>
                ))}
              </div>
            </FitnessCard>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AdminDashboard;
