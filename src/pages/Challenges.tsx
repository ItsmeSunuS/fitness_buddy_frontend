import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import ProgressBar from "@/components/ProgressBar";
import AnimatedPage from "@/components/AnimatedPage";
import AnimatedCard from "@/components/AnimatedCard";
import api from "@/services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend,
} from "recharts";

interface Challenge {
  _id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  joined: boolean;
  createdBy: string;
}

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", target: "", unit: "miles" });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/api/challenges");
        setChallenges(res.data);
      } catch {
        setChallenges([
          { _id: "1", title: "Run 10 Miles This Week", description: "Complete 10 miles of running", target: 10, current: 6.5, unit: "miles", joined: true, createdBy: "You" },
          { _id: "2", title: "500 Push-ups Challenge", description: "Complete 500 push-ups in 30 days", target: 500, current: 120, unit: "reps", joined: true, createdBy: "Sarah Chen" },
          { _id: "3", title: "30-Day Yoga Streak", description: "Practice yoga every day for 30 days", target: 30, current: 0, unit: "days", joined: false, createdBy: "Emily Davis" },
          { _id: "4", title: "Cycle 50km", description: "Cycle a total of 50km this month", target: 50, current: 32, unit: "km", joined: true, createdBy: "Mike" },
        ]);
      }
    };
    fetch();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newChallenge: Challenge = {
      _id: Date.now().toString(),
      title: form.title,
      description: form.description,
      target: Number(form.target),
      current: 0,
      unit: form.unit,
      joined: true,
      createdBy: "You",
    };
    try {
      const res = await api.post("/api/challenges", newChallenge);
      setChallenges([res.data, ...challenges]);
    } catch {
      setChallenges([newChallenge, ...challenges]);
    }
    setForm({ title: "", description: "", target: "", unit: "miles" });
    setShowCreate(false);
  };

  const joinChallenge = async (id: string) => {
    try { await api.post(`/api/challenges/${id}/join`); } catch { /* mock */ }
    setChallenges(challenges.map((c) => c._id === id ? { ...c, joined: true } : c));
  };

  // Chart data: challenge progress as radial bar
  const joinedChallenges = challenges.filter((c) => c.joined);
  const radialData = joinedChallenges.map((c, i) => ({
    name: c.title.substring(0, 15),
    progress: Math.round((c.current / c.target) * 100),
    fill: ["hsl(160, 84%, 39%)", "hsl(172, 66%, 50%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)"][i % 4],
  }));

  // Bar chart: current vs target
  const barData = joinedChallenges.map((c) => ({
    name: c.title.substring(0, 12),
    current: c.current,
    target: c.target,
  }));

  const inputClass = "w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-theme";

  return (
    <DashboardLayout>
      <AnimatedPage>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-foreground">Challenges 🏆</h1>
          <motion.button
            onClick={() => setShowCreate(!showCreate)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-primary-glow hover:opacity-90"
          >
            {showCreate ? "Cancel" : "+ New Challenge"}
          </motion.button>
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <FitnessCard className="mb-6">
                <form onSubmit={handleCreate} className="space-y-4">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputClass} placeholder="Challenge title" />
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className={inputClass} placeholder="Description" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} required className={inputClass} placeholder="Target" />
                    <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputClass}>
                      <option value="miles">Miles</option><option value="reps">Reps</option><option value="days">Days</option><option value="minutes">Minutes</option><option value="km">Km</option>
                    </select>
                  </div>
                  <button type="submit" className="rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-transform">Create</button>
                </form>
              </FitnessCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analytics row */}
        {joinedChallenges.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AnimatedCard index={0}>
              <FitnessCard title="Progress Overview" icon="📊">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
                      <RadialBar dataKey="progress" cornerRadius={8} animationDuration={1500} />
                      <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
                      <Tooltip contentStyle={{ borderRadius: "12px" }} formatter={(v: number) => [`${v}%`, "Progress"]} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </FitnessCard>
            </AnimatedCard>

            <AnimatedCard index={1}>
              <FitnessCard title="Current vs Target" icon="📈">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 15%, 90%)" opacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
                      <Tooltip contentStyle={{ borderRadius: "12px" }} />
                      <Bar dataKey="current" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} animationDuration={1200} />
                      <Bar dataKey="target" fill="hsl(160, 84%, 39%)" opacity={0.25} radius={[6, 6, 0, 0]} animationDuration={1200} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </FitnessCard>
            </AnimatedCard>
          </div>
        )}

        {/* Challenge cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((c, i) => (
            <AnimatedCard key={c._id} index={i + 2}>
              <FitnessCard>
                <h3 className="mb-1 font-display text-lg font-bold text-card-foreground">{c.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{c.description}</p>
                <ProgressBar value={(c.current / c.target) * 100} label={`${c.current} / ${c.target} ${c.unit}`} color={c.current >= c.target ? "success" : "primary"} />
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">by {c.createdBy}</span>
                  {!c.joined ? (
                    <motion.button
                      onClick={() => joinChallenge(c._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                      Join
                    </motion.button>
                  ) : (
                    <span className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success">Joined ✓</span>
                  )}
                </div>
              </FitnessCard>
            </AnimatedCard>
          ))}
        </div>
      </AnimatedPage>
    </DashboardLayout>
  );
};

export default Challenges;
