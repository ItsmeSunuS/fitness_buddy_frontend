import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
} from "recharts";

import api from "@/services/api";

// ─── Config ───────────────────────────────────────────────────────────────────
const CHART_COLORS = [
  "hsl(185,85%,48%)", "hsl(258,78%,68%)", "hsl(142,70%,45%)",
  "hsl(38,90%,55%)", "hsl(0,72%,58%)", "hsl(215,80%,60%)",
];

const mockActivityData = [
  { day: "Mon", workouts: 45, challenges: 12 }, { day: "Tue", workouts: 52, challenges: 18 },
  { day: "Wed", workouts: 61, challenges: 15 }, { day: "Thu", workouts: 40, challenges: 20 },
  { day: "Fri", workouts: 55, challenges: 22 }, { day: "Sat", workouts: 70, challenges: 30 },
  { day: "Sun", workouts: 48, challenges: 14 },
];
const mockRevenueData = [
  { month: "Jan", revenue: 2400 }, { month: "Feb", revenue: 3200 },
  { month: "Mar", revenue: 4100 }, { month: "Apr", revenue: 3800 },
  { month: "May", revenue: 5200 }, { month: "Jun", revenue: 6100 },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  id: string; name: string; email: string; role: string;
  profileCompleted: boolean; createdAt: string; gender?: string;
  age?: number; location?: string; fitness_Goals?: string; preffered_Workouts?: string;
}
interface Gym { id: string; name: string; city: string; address: string; created_at: string; }
interface Challenge {
  id: string; title: string; description?: string; goal_type?: string;
  target_value?: number; start_date?: string; end_date?: string; created_at: string;
}
interface Group {
  id: string; name: string; goal_type?: string; Start_date?: string;
  Created_by?: string; Category?: string; Description?: string; created_at: string;
}
interface DashboardSummary {
  totalUsers: number; totalGyms: number; totalChallenges: number;
  totalGroups: number; totalBuddies?: number; activeUsers?: number;
}

// ─── API helpers ──────────────────────────────────────────────────────────────
async function apiGet<T>(path: string): Promise<T> {
  const res = await api.get<T>(path);
  return res.data;
}
async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await api.post<T>(path, body);
  return res.data;
}
async function apiDelete(path: string): Promise<void> {
  await api.delete(path);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color }: { icon: string; label: string; value: number | string; sub?: string; color: string }) => (
  <div className="card-glass rounded-2xl p-5 flex items-center gap-4 animate-fade-in hover:glow-primary transition-all duration-300">
    <div className={`text-3xl w-14 h-14 flex items-center justify-center rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-foreground text-2xl font-display font-bold">{value}</p>
      {sub && <p className="text-muted-foreground text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SectionCard = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="card-glass rounded-2xl p-5 animate-fade-in">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-display font-semibold text-foreground">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const Badge = ({ label, variant }: { label: string; variant: "success" | "warning" | "destructive" | "muted" | "primary" | "accent" }) => {
  const cls = {
    success: "bg-success/15 text-success", warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/15 text-destructive", muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/15 text-primary", accent: "bg-accent/15 text-accent",
  }[variant];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
};

const DeleteButton = ({ onClick, loading }: { onClick: () => void; loading?: boolean }) => (
  <button onClick={onClick} disabled={loading}
    className="rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50">
    {loading ? "..." : "Delete"}
  </button>
);

const ChartTooltipCustom = React.forwardRef<HTMLDivElement, any>(({ active, payload, label }, ref) => {
  if (!active || !payload?.length) return null;
  return (
    <div ref={ref} className="card-glass rounded-xl p-3 text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
});
ChartTooltipCustom.displayName = "ChartTooltipCustom";

const Spinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const ErrorBanner = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="card-glass rounded-xl p-4 border border-destructive/30 flex items-center justify-between">
    <p className="text-destructive text-sm">⚠️ {message}</p>
    <button onClick={onRetry} className="text-xs text-primary hover:underline">Retry</button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
type Tab = "overview" | "users" | "gyms" | "challenges" | "groups" | "analytics";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Data state
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [signupData, setSignupData] = useState<{ month: string; users: number }[]>([]);

  // Loading / error per section
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  const setLoading = (key: string, val: boolean) => setLoadingMap(p => ({ ...p, [key]: val }));
  const setError = (key: string, val: string) => setErrorMap(p => ({ ...p, [key]: val }));

  // Add gym form
  const [showAddGym, setShowAddGym] = useState(false);
  const [newGym, setNewGym] = useState({ name: "", city: "", address: "" });
  const [addingGym, setAddingGym] = useState(false);

  // ── Fetch functions ──────────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    setLoading("summary", true);
    setError("summary", "");
    try {
      const data = await apiGet<DashboardSummary>("/api/admin/dashboard/summary");
      setSummary(data);
    } catch (e: any) {
      setError("summary", e.message);
    } finally {
      setLoading("summary", false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading("users", true);
    setError("users", "");
    try {
      const data = await apiGet<User[]>("/api/admin/users");
      setUsers(data);
    } catch (e: any) {
      setError("users", e.message);
    } finally {
      setLoading("users", false);
    }
  }, []);

  const fetchGyms = useCallback(async () => {
    setLoading("gyms", true);
    setError("gyms", "");
    try {
      const data = await apiGet<Gym[]>("/api/admin/gyms");
      setGyms(data);
    } catch (e: any) {
      setError("gyms", e.message);
    } finally {
      setLoading("gyms", false);
    }
  }, []);

  const fetchChallenges = useCallback(async () => {
    setLoading("challenges", true);
    setError("challenges", "");
    try {
      const data = await apiGet<Challenge[]>("/api/admin/challenges");
      setChallenges(data);
    } catch (e: any) {
      setError("challenges", e.message);
    } finally {
      setLoading("challenges", false);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    setLoading("groups", true);
    setError("groups", "");
    try {
      const data = await apiGet<Group[]>("/api/admin/groups");
      setGroups(data);
    } catch (e: any) {
      setError("groups", e.message);
    } finally {
      setLoading("groups", false);
    }
  }, []);

  const fetchSignupAnalytics = useCallback(async () => {
    try {
      const raw = await apiGet<{ created_at: string }[]>("/api/admin/analytics/signup");
      const counts: Record<string, number> = {};
      raw.forEach(r => {
        const month = new Date(r.created_at).toLocaleString("default", { month: "short" });
        counts[month] = (counts[month] || 0) + 1;
      });
      setSignupData(Object.entries(counts).map(([month, users]) => ({ month, users })));
    } catch {
      // fallback to empty
    }
  }, []);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSummary();
    fetchUsers();
    fetchGyms();
    fetchChallenges();
    fetchGroups();
    fetchSignupAnalytics();
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await apiDelete(`/api/admin/users/${id}`);
      setUsers(u => u.filter(x => x.id !== id));
      setSummary(s => s ? { ...s, totalUsers: s.totalUsers - 1 } : s);
    } catch (e: any) { alert(e.message); }
  };

  const deleteGym = async (id: string) => {
    if (!confirm("Delete this gym?")) return;
    try {
      await apiDelete(`/api/admin/gyms/${id}`);
      setGyms(g => g.filter(x => x.id !== id));
      setSummary(s => s ? { ...s, totalGyms: s.totalGyms - 1 } : s);
    } catch (e: any) { alert(e.message); }
  };

  const deleteChallenge = async (id: string) => {
    if (!confirm("Delete this challenge?")) return;
    try {
      await apiDelete(`/api/admin/challenges/${id}`);
      setChallenges(c => c.filter(x => x.id !== id));
      setSummary(s => s ? { ...s, totalChallenges: s.totalChallenges - 1 } : s);
    } catch (e: any) { alert(e.message); }
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Delete this group?")) return;
    try {
      await apiDelete(`/api/admin/groups/${id}`);
      setGroups(g => g.filter(x => x.id !== id));
      setSummary(s => s ? { ...s, totalGroups: s.totalGroups - 1 } : s);
    } catch (e: any) { alert(e.message); }
  };

  const addGym = async () => {
    if (!newGym.name || !newGym.city) return;
    setAddingGym(true);
    try {
      const created = await apiPost<Gym>("/api/admin/gyms", newGym);
      setGyms(g => [created, ...g]);
      setSummary(s => s ? { ...s, totalGyms: s.totalGyms + 1 } : s);
      setNewGym({ name: "", city: "", address: "" });
      setShowAddGym(false);
    } catch (e: any) { alert(e.message); }
    setAddingGym(false);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const engagementData = summary ? [
    { name: "Active", value: summary.activeUsers || 0 },
    { name: "Inactive", value: (summary.totalUsers || 0) - (summary.activeUsers || 0) },
  ] : [];

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "gyms", label: "Gyms", icon: "🏋️" },
    { id: "challenges", label: "Challenges", icon: "🏆" },
    { id: "groups", label: "Groups", icon: "🫂" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <span className="text-primary">⚡</span> Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">Platform management & analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg glow-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ──────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {errorMap.summary && <ErrorBanner message={errorMap.summary} onRetry={fetchSummary} />}
            {loadingMap.summary ? <Spinner /> : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon="👤" label="Total Users" value={summary?.totalUsers ?? "—"} sub={summary?.activeUsers ? `${summary.activeUsers} active` : undefined} color="bg-primary/10" />
                  <StatCard icon="🏋️" label="Total Gyms" value={summary?.totalGyms ?? "—"} color="bg-accent/10" />
                  <StatCard icon="🏆" label="Challenges" value={summary?.totalChallenges ?? "—"} color="bg-success/10" />
                  <StatCard icon="🫂" label="Groups" value={summary?.totalGroups ?? "—"} color="bg-warning/10" />
                </div>
                {summary?.totalBuddies !== undefined && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon="🤝" label="Buddies" value={summary.totalBuddies} color="bg-primary/10" />
                    <StatCard icon="✅" label="Active Profiles" value={summary.activeUsers ?? "—"} color="bg-success/10" />
                  </div>
                )}
              </>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <SectionCard title="Weekly Activity">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={mockActivityData}>
                      <defs>
                        <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(185,85%,48%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(185,85%,48%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(258,78%,68%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(258,78%,68%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,20%,18%)" />
                      <XAxis dataKey="day" tick={{ fill: "hsl(215,16%,55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "hsl(215,16%,55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltipCustom />} />
                      <Area type="monotone" dataKey="workouts" name="Workouts" stroke="hsl(185,85%,48%)" fill="url(#wGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="challenges" name="Challenges" stroke="hsl(258,78%,68%)" fill="url(#cGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </SectionCard>
              </div>
              <SectionCard title="Engagement">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={engagementData.length ? engagementData : [{ name: "No data", value: 1 }]}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {(engagementData.length ? engagementData : [{ name: "No data", value: 1 }]).map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltipCustom />} />
                  </PieChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>
          </div>
        )}

        {/* ── USERS ──────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
            </div>
            {errorMap.users && <ErrorBanner message={errorMap.users} onRetry={fetchUsers} />}
            {loadingMap.users ? <Spinner /> : (
              <div className="card-glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Name", "Email", "Role", "Profile", "Gender", "Age", "Location", "Actions"].map(h => (
                          <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr key={u.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-xs">{u.name?.charAt(0)}</div>
                              <span className="font-medium text-foreground">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <Badge label={u.role} variant={u.role === "admin" ? "warning" : u.role === "moderator" ? "accent" : "muted"} />
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge label={u.profileCompleted ? "Complete" : "Pending"} variant={u.profileCompleted ? "success" : "warning"} />
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground text-xs">{u.gender || "—"}</td>
                          <td className="px-5 py-3.5 text-muted-foreground text-xs">{u.age || "—"}</td>
                          <td className="px-5 py-3.5 text-muted-foreground text-xs">{u.location || "—"}</td>
                          <td className="px-5 py-3.5">
                            {u.role !== "admin" && <DeleteButton onClick={() => deleteUser(u.id)} />}
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && !loadingMap.users && (
                        <tr><td colSpan={8} className="px-5 py-8 text-center text-muted-foreground text-sm">No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{filteredUsers.length} of {users.length} users</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GYMS ───────────────────────────────────── */}
        {activeTab === "gyms" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowAddGym(!showAddGym)}
                className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-all glow-primary">
                + Add Gym
              </button>
            </div>

            {showAddGym && (
              <div className="card-glass rounded-2xl p-5 animate-fade-in">
                <h3 className="font-display font-semibold text-foreground mb-4">Add New Gym</h3>
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  <input value={newGym.name} onChange={e => setNewGym({ ...newGym, name: e.target.value })}
                    placeholder="Gym name *" className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  <input value={newGym.city} onChange={e => setNewGym({ ...newGym, city: e.target.value })}
                    placeholder="City *" className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  <input value={newGym.address} onChange={e => setNewGym({ ...newGym, address: e.target.value })}
                    placeholder="Address" className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div className="flex gap-2">
                  <button onClick={addGym} disabled={addingGym}
                    className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {addingGym ? "Adding..." : "Add Gym"}
                  </button>
                  <button onClick={() => setShowAddGym(false)} className="rounded-xl bg-muted text-muted-foreground px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {errorMap.gyms && <ErrorBanner message={errorMap.gyms} onRetry={fetchGyms} />}
            {loadingMap.gyms ? <Spinner /> : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gyms.map(gym => (
                  <div key={gym.id} className="card-glass rounded-2xl p-5 animate-fade-in hover:border-primary/30 border border-border transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-display font-semibold text-foreground">{gym.name}</h4>
                        <p className="text-muted-foreground text-xs mt-0.5">🏙️ {gym.city}</p>
                        {gym.address && <p className="text-muted-foreground text-xs">📍 {gym.address}</p>}
                      </div>
                      <Badge label="active" variant="success" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-xs text-muted-foreground">Added {new Date(gym.created_at).toLocaleDateString()}</p>
                      <DeleteButton onClick={() => deleteGym(gym.id)} />
                    </div>
                  </div>
                ))}
                {gyms.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-muted-foreground text-sm">No gyms yet. Add one above.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CHALLENGES ─────────────────────────────── */}
        {activeTab === "challenges" && (
          <div className="space-y-4">
            {errorMap.challenges && <ErrorBanner message={errorMap.challenges} onRetry={fetchChallenges} />}
            {loadingMap.challenges ? <Spinner /> : (
              <div className="card-glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Challenge", "Goal Type", "Target", "Start Date", "End Date", "Created", "Actions"].map(h => (
                          <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {challenges.map((c, i) => (
                        <tr key={c.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🏆</span>
                              <div>
                                <span className="font-medium text-foreground">{c.title}</span>
                                {c.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.description}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">{c.goal_type || "—"}</td>
                          <td className="px-5 py-3.5 text-foreground font-medium">{c.target_value ?? "—"}</td>
                          <td className="px-5 py-3.5 text-muted-foreground text-xs">{c.start_date ? new Date(c.start_date).toLocaleDateString() : "—"}</td>
                          <td className="px-5 py-3.5 text-muted-foreground text-xs">{c.end_date ? new Date(c.end_date).toLocaleDateString() : "—"}</td>
                          <td className="px-5 py-3.5 text-muted-foreground text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5">
                            <DeleteButton onClick={() => deleteChallenge(c.id)} />
                          </td>
                        </tr>
                      ))}
                      {challenges.length === 0 && (
                        <tr><td colSpan={7} className="px-5 py-8 text-center text-muted-foreground text-sm">No challenges found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{challenges.length} challenges total</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GROUPS ─────────────────────────────────── */}
        {activeTab === "groups" && (
          <div className="space-y-4">
            {errorMap.groups && <ErrorBanner message={errorMap.groups} onRetry={fetchGroups} />}
            {loadingMap.groups ? <Spinner /> : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map(group => (
                  <div key={group.id} className="card-glass rounded-2xl p-5 animate-fade-in hover:border-accent/30 border border-border transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-display font-semibold text-foreground">{group.name}</h4>
                        {group.Category && <p className="text-muted-foreground text-xs mt-0.5">🏷️ {group.Category}</p>}
                        {group.goal_type && <p className="text-muted-foreground text-xs">🎯 {group.goal_type}</p>}
                      </div>
                      <span className="text-2xl">🫂</span>
                    </div>
                    {group.Description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{group.Description}</p>}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Created {new Date(group.created_at).toLocaleDateString()}</p>
                      <DeleteButton onClick={() => deleteGroup(group.id)} />
                    </div>
                  </div>
                ))}
                {groups.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-muted-foreground text-sm">No groups found</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS ──────────────────────────────── */}
        {activeTab === "analytics" && (
          <div className="grid md:grid-cols-2 gap-4">
            <SectionCard title="User Signups by Month">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={signupData.length ? signupData : [{ month: "No data", users: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,20%,18%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(215,16%,55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215,16%,55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipCustom />} />
                  <Bar dataKey="users" name="Users" fill="hsl(185,85%,48%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="Monthly Revenue">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(258,78%,68%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(258,78%,68%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,20%,18%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(215,16%,55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215,16%,55%)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<ChartTooltipCustom />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(258,78%,68%)" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="Daily Activity">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={mockActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,20%,18%)" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(215,16%,55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215,16%,55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipCustom />} />
                  <Legend formatter={v => <span style={{ color: "hsl(215,16%,55%)", fontSize: "12px" }}>{v}</span>} />
                  <Line type="monotone" dataKey="workouts" name="Workouts" stroke="hsl(185,85%,48%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="challenges" name="Challenges" stroke="hsl(142,70%,45%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="User Engagement">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={engagementData.length ? engagementData : [{ name: "No data", value: 1 }]}
                    cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {(engagementData.length ? engagementData : [{ name: "No data", value: 1 }]).map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltipCustom />} />
                </PieChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
