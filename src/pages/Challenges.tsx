import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import ProgressBar from "@/components/ProgressBar";
import api from "@/services/api";

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

  const inputClass = "w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-theme";

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Challenges 🏆</h1>
        <button onClick={() => setShowCreate(!showCreate)}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-primary-glow hover:opacity-90">
          {showCreate ? "Cancel" : "+ New Challenge"}
        </button>
      </div>

      {showCreate && (
        <FitnessCard className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputClass} placeholder="Challenge title" />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className={inputClass} placeholder="Description" />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} required className={inputClass} placeholder="Target" />
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputClass}>
                <option value="miles">Miles</option><option value="reps">Reps</option><option value="days">Days</option><option value="minutes">Minutes</option>
              </select>
            </div>
            <button type="submit" className="rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:opacity-90">Create</button>
          </form>
        </FitnessCard>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((c) => (
          <FitnessCard key={c._id}>
            <h3 className="mb-1 font-display text-lg font-bold text-card-foreground">{c.title}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{c.description}</p>
            <ProgressBar value={(c.current / c.target) * 100} label={`${c.current} / ${c.target} ${c.unit}`} color={c.current >= c.target ? "success" : "primary"} />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">by {c.createdBy}</span>
              {!c.joined ? (
                <button onClick={() => joinChallenge(c._id)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Join</button>
              ) : (
                <span className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success">Joined ✓</span>
              )}
            </div>
          </FitnessCard>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Challenges;
