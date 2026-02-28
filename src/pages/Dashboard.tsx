import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import ProgressBar from "@/components/ProgressBar";
import AnimatedPage from "@/components/AnimatedPage";
import AnimatedCard from "@/components/AnimatedCard";
import CountUp from "@/components/CountUp";
import api from "@/services/api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, RadialBarChart, RadialBar, Legend,
} from "recharts";

interface Workout {
  id?: string;
  _id?: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  date: string;
}

interface Buddy {
  _id: string;
  name: string;
}

interface Challenge {
  _id: string;
  title: string;
  participants?: string[];
}

interface Group {
  _id: string;
  name: string;
}

const PIE_COLORS = [
  "hsl(160, 84%, 39%)",
  "hsl(172, 66%, 50%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(217, 91%, 60%)",
  "hsl(0, 84%, 60%)",
];

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(0, 0%, 100%)",
  border: "1px solid hsl(160, 15%, 90%)",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [wRes, bRes, cRes, gRes] = await Promise.allSettled([
          api.get("/api/workouts"),
          api.get("/api/buddies"),
          api.get("/api/challenges"),
          api.get("/api/groups"),
        ]);
        if (wRes.status === "fulfilled") setWorkouts(wRes.value.data);
        if (bRes.status === "fulfilled") setBuddies(bRes.value.data);
        if (cRes.status === "fulfilled") setChallenges(cRes.value.data);
        if (gRes.status === "fulfilled") setGroups(gRes.value.data);
      } catch {
        // fallback mock data
        setWorkouts([
          { _id: "1", type: "Running", duration: 45, caloriesBurned: 420, date: "2026-02-20" },
          { _id: "2", type: "HIIT", duration: 30, caloriesBurned: 310, date: "2026-02-21" },
          { _id: "3", type: "Weights", duration: 60, caloriesBurned: 580, date: "2026-02-22" },
          { _id: "4", type: "Running", duration: 50, caloriesBurned: 490, date: "2026-02-24" },
          { _id: "5", type: "Yoga", duration: 75, caloriesBurned: 220, date: "2026-02-25" },
          { _id: "6", type: "HIIT", duration: 40, caloriesBurned: 350, date: "2026-02-26" },
          { _id: "7", type: "Running", duration: 55, caloriesBurned: 510, date: "2026-02-27" },
          { _id: "8", type: "Weights", duration: 45, caloriesBurned: 400, date: "2026-02-28" },
        ]);
        setBuddies([{ _id: "1", name: "Sarah" }, { _id: "2", name: "Mike" }, { _id: "3", name: "Emma" }]);
        setChallenges([{ _id: "1", title: "30-Day Cardio" }, { _id: "2", title: "Weight Loss Sprint" }]);
        setGroups([{ _id: "1", name: "Morning Runners" }]);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Computed stats
  const heightM = (user?.height || 175) / 100;
  const currentBMI = Number(((user?.weight || 70) / (heightM * heightM)).toFixed(1));
  const targetBMI = Number(((user?.targetWeight || 65) / (heightM * heightM)).toFixed(1));
  const totalCalories = workouts.reduce((s, w) => s + w.caloriesBurned, 0);
  const totalDuration = workouts.reduce((s, w) => s + w.duration, 0);
  const activeChallenges = challenges.length;

  const weightDiff = Math.abs((user?.weight || 70) - (user?.targetWeight || 65));
  const progressPercent = weightDiff > 0 ? Math.min(100, Math.round((2 / weightDiff) * 100)) : 100;

  // Weekly calories chart data
  const weeklyCalories = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const map: Record<string, { calories: number; duration: number }> = {};
    days.forEach(d => { map[d] = { calories: 0, duration: 0 }; });
    workouts.forEach(w => {
      const d = new Date(w.date);
      const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
      if (map[dayName]) {
        map[dayName].calories += w.caloriesBurned;
        map[dayName].duration += w.duration;
      }
    });
    return days.map(day => ({ day, ...map[day] }));
  }, [workouts]);

  // Workout type distribution
  const workoutDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    workouts.forEach(w => { map[w.type] = (map[w.type] || 0) + 1; });
    const total = workouts.length || 1;
    return Object.entries(map).map(([name, count]) => ({ name, value: Math.round((count / total) * 100) }));
  }, [workouts]);

  // Monthly progress (group by week)
  const monthlyProgress = useMemo(() => {
    const weeks: Record<string, number> = {};
    workouts.forEach(w => {
      const d = new Date(w.date);
      const weekNum = `W${Math.ceil(d.getDate() / 7)}`;
      weeks[weekNum] = (weeks[weekNum] || 0) + w.caloriesBurned;
    });
    return Object.entries(weeks).map(([week, calories]) => ({ week, calories }));
  }, [workouts]);

  // Radial BMI gauge
  const bmiGauge = [
    { name: "Current BMI", value: currentBMI, fill: "hsl(160, 84%, 39%)" },
    { name: "Target BMI", value: targetBMI, fill: "hsl(172, 66%, 50%)" },
  ];

  // Avg duration per type
  const avgDurationByType = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    workouts.forEach(w => {
      if (!map[w.type]) map[w.type] = { total: 0, count: 0 };
      map[w.type].total += w.duration;
      map[w.type].count += 1;
    });
    return Object.entries(map).map(([type, d]) => ({ type, avg: Math.round(d.total / d.count) }));
  }, [workouts]);

  const quickNavCards = [
    { icon: "🏋️", title: "Workouts", desc: "Log & track exercises", path: "/workouts" },
    { icon: "🤝", title: "Buddies", desc: "Find workout partners", path: "/buddies" },
    { icon: "🏆", title: "Challenges", desc: "Compete & achieve", path: "/challenges" },
    { icon: "👥", title: "Groups", desc: "Train together", path: "/groups" },
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
      <AnimatedPage>
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back, <span className="text-gradient">{user?.name || "Champ"}</span> 👋
          </h1>
          <p className="mt-1 text-muted-foreground">Here's your fitness overview for today</p>
        </div>

        {/* 6 Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { icon: "📏", title: "Current BMI", value: currentBMI, decimals: 1, sub: currentBMI < 18.5 ? "Underweight" : currentBMI < 25 ? "Normal" : currentBMI < 30 ? "Overweight" : "Obese" },
            { icon: "🎯", title: "Target BMI", value: targetBMI, decimals: 1, sub: `Goal: ${user?.targetWeight || 65}kg` },
            { icon: "🏋️", title: "Total Workouts", value: workouts.length, decimals: 0, sub: `${totalDuration} min total` },
            { icon: "🔥", title: "Calories Burned", value: totalCalories, decimals: 0, sub: "All time" },
            { icon: "🏆", title: "Active Challenges", value: activeChallenges, decimals: 0, sub: "Joined" },
            { icon: "🤝", title: "Total Buddies", value: buddies.length, decimals: 0, sub: "Connected" },
          ].map((stat, i) => (
            <AnimatedCard key={stat.title} index={i}>
              <FitnessCard icon={stat.icon} title={stat.title}>
                <p className="text-3xl font-bold text-foreground">
                  <CountUp end={stat.value} decimals={stat.decimals} duration={1.2} />
                </p>
                <p className="text-sm text-muted-foreground">{stat.sub}</p>
              </FitnessCard>
            </AnimatedCard>
          ))}
        </div>

        {/* Progress Toward Goal */}
        <AnimatedCard index={6}>
          <FitnessCard title="Progress Toward Goal" icon="📈" className="mb-8">
            <ProgressBar value={progressPercent} label="Weight Goal Progress" size="lg" color="primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              {user?.weight || 70}kg → {user?.targetWeight || 65}kg • Keep going! 💪
            </p>
          </FitnessCard>
        </AnimatedCard>

        {/* Fitness Goals & Preferred Workouts Tags */}
        {(user?.fitnessGoals?.length || user?.preferredWorkouts?.length) && (
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {user?.fitnessGoals?.length ? (
              <AnimatedCard index={7}>
                <FitnessCard icon="🎯" title="Fitness Goals">
                  <div className="flex flex-wrap gap-2">
                    {user.fitnessGoals.map((g) => (
                      <span key={g} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{g}</span>
                    ))}
                  </div>
                </FitnessCard>
              </AnimatedCard>
            ) : null}
            {user?.preferredWorkouts?.length ? (
              <AnimatedCard index={8}>
                <FitnessCard icon="💪" title="Preferred Workouts">
                  <div className="flex flex-wrap gap-2">
                    {user.preferredWorkouts.map((w) => (
                      <span key={w} className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent-foreground">{w}</span>
                    ))}
                  </div>
                </FitnessCard>
              </AnimatedCard>
            ) : null}
          </div>
        )}

        {/* Charts Row 1: Weekly Calories + Daily Duration */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatedCard index={9}>
            <FitnessCard title="Weekly Calories Burned" icon="🔥">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyCalories}>
                    <defs>
                      <linearGradient id="calorieGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="calories" stroke="hsl(160, 84%, 39%)" strokeWidth={2.5} fill="url(#calorieGrad)" animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </FitnessCard>
          </AnimatedCard>

          <AnimatedCard index={10}>
            <FitnessCard title="Daily Workout Duration" icon="⏱️">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyCalories}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit=" min" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="duration" fill="hsl(172, 66%, 50%)" radius={[8, 8, 0, 0]} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FitnessCard>
          </AnimatedCard>
        </div>

        {/* Charts Row 2: Workout Distribution + Monthly Progress */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatedCard index={11}>
            <FitnessCard title="Workout Distribution" icon="🥧">
              <div className="h-64 flex items-center">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie data={workoutDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" animationDuration={1200}>
                      {workoutDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 pr-4">
                  {workoutDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm whitespace-nowrap">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-semibold text-foreground">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </FitnessCard>
          </AnimatedCard>

          <AnimatedCard index={12}>
            <FitnessCard title="Monthly Calories Progress" icon="📊">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="calories" stroke="hsl(142, 76%, 36%)" strokeWidth={3} dot={{ r: 6, fill: "hsl(142, 76%, 36%)", stroke: "white", strokeWidth: 2 }} animationDuration={1500} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </FitnessCard>
          </AnimatedCard>
        </div>

        {/* Charts Row 3: BMI Radial + Avg Duration by Type */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatedCard index={13}>
            <FitnessCard title="BMI Comparison" icon="⚖️">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={bmiGauge} startAngle={180} endAngle={0}>
                    <RadialBar dataKey="value" cornerRadius={10} background />
                    <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </FitnessCard>
          </AnimatedCard>

          <AnimatedCard index={14}>
            <FitnessCard title="Avg Duration by Type" icon="📐">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={avgDurationByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" unit=" min" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="type" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="avg" fill="hsl(38, 92%, 50%)" radius={[0, 8, 8, 0]} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FitnessCard>
          </AnimatedCard>
        </div>

        {/* Groups & Challenges Summary */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatedCard index={15}>
            <FitnessCard icon="👥" title={`My Groups (${groups.length})`}>
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No groups joined yet</p>
              ) : (
                <div className="space-y-2">
                  {groups.map((g) => (
                    <div key={g._id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                      <span className="text-lg">👥</span>
                      <span className="text-sm font-medium text-foreground">{g.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </FitnessCard>
          </AnimatedCard>

          <AnimatedCard index={16}>
            <FitnessCard icon="🏆" title={`Active Challenges (${challenges.length})`}>
              {challenges.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active challenges</p>
              ) : (
                <div className="space-y-2">
                  {challenges.map((c) => (
                    <div key={c._id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                      <span className="text-lg">🏆</span>
                      <span className="text-sm font-medium text-foreground">{c.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </FitnessCard>
          </AnimatedCard>
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickNavCards.map((card, i) => (
            <AnimatedCard key={card.path} index={17 + i}>
              <FitnessCard icon={card.icon} title={card.title} subtitle={card.desc} onClick={() => navigate(card.path)} className="group">
                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                  Go to {card.title}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </FitnessCard>
            </AnimatedCard>
          ))}
        </div>
      </AnimatedPage>
    </DashboardLayout>
  );
};

export default Dashboard;
