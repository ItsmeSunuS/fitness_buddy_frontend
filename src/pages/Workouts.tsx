import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import ProgressBar from "@/components/ProgressBar";
import AnimatedPage from "@/components/AnimatedPage";
import AnimatedCard from "@/components/AnimatedCard";
import CountUp from "@/components/CountUp";
import api from "@/services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface Workout {
  _id: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  date: string;
}

const workoutTypes = ["Running", "Weight Training", "Yoga", "Swimming", "Cycling", "HIIT", "Walking", "Pilates"];

const PIE_COLORS = [
  "hsl(160, 84%, 39%)", "hsl(172, 66%, 50%)", "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)", "hsl(217, 91%, 60%)", "hsl(0, 84%, 60%)",
  "hsl(280, 60%, 55%)", "hsl(30, 80%, 55%)",
];

const Workouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [form, setForm] = useState({ type: "Running", duration: "", caloriesBurned: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await api.get("/api/workouts");
        setWorkouts(res.data);
      } catch {
        setWorkouts([
          { _id: "1", type: "Running", duration: 30, caloriesBurned: 350, date: new Date().toISOString() },
          { _id: "2", type: "Weight Training", duration: 45, caloriesBurned: 280, date: new Date(Date.now() - 86400000).toISOString() },
          { _id: "3", type: "Yoga", duration: 60, caloriesBurned: 180, date: new Date(Date.now() - 172800000).toISOString() },
          { _id: "4", type: "HIIT", duration: 25, caloriesBurned: 400, date: new Date(Date.now() - 259200000).toISOString() },
          { _id: "5", type: "Cycling", duration: 50, caloriesBurned: 320, date: new Date(Date.now() - 345600000).toISOString() },
        ]);
      }
    };
    fetchWorkouts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newWorkout = {
      type: form.type,
      duration: Number(form.duration),
      caloriesBurned: Number(form.caloriesBurned),
    };
    try {
      const res = await api.post("/api/workouts", newWorkout);
      setWorkouts([res.data, ...workouts]);
    } catch {
      setWorkouts([{ _id: Date.now().toString(), ...newWorkout, date: new Date().toISOString() }, ...workouts]);
    }
    setForm({ type: "Running", duration: "", caloriesBurned: "" });
    setLoading(false);
  };

  const totalCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
  const weeklyGoal = 300;
  const weeklyProgress = Math.min(100, (totalDuration / weeklyGoal) * 100);

  // Prepare chart data: calories per workout type
  const typeMap: Record<string, { calories: number; duration: number; count: number }> = {};
  workouts.forEach((w) => {
    if (!typeMap[w.type]) typeMap[w.type] = { calories: 0, duration: 0, count: 0 };
    typeMap[w.type].calories += w.caloriesBurned;
    typeMap[w.type].duration += w.duration;
    typeMap[w.type].count += 1;
  });
  const barData = Object.entries(typeMap).map(([type, d]) => ({ type, calories: d.calories, duration: d.duration }));
  const pieData = Object.entries(typeMap).map(([type, d]) => ({ name: type, value: d.count }));

  const inputClass = "w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-theme";

  return (
    <DashboardLayout>
      <AnimatedPage>
        <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Workout Log 🏋️</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Add Workout Form */}
          <div className="lg:col-span-1 space-y-6">
            <AnimatedCard index={0}>
              <FitnessCard title="Add Workout" icon="➕">
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                      {workoutTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Duration (min)</label>
                    <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required className={inputClass} placeholder="30" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Calories Burned</label>
                    <input type="number" value={form.caloriesBurned} onChange={(e) => setForm({ ...form, caloriesBurned: e.target.value })} required className={inputClass} placeholder="250" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-primary-glow transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60">
                    {loading ? "Adding..." : "Log Workout"}
                  </button>
                </form>
              </FitnessCard>
            </AnimatedCard>

            {/* Summary with count-up */}
            <AnimatedCard index={1}>
              <FitnessCard title="Summary" icon="📊">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Workouts</span>
                    <span className="font-semibold text-foreground"><CountUp end={workouts.length} duration={0.8} /></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Duration</span>
                    <span className="font-semibold text-foreground"><CountUp end={totalDuration} duration={1} /> min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Calories Burned</span>
                    <span className="font-semibold text-foreground"><CountUp end={totalCalories} duration={1.2} /></span>
                  </div>
                  <div className="pt-2">
                    <ProgressBar value={weeklyProgress} label="Weekly Goal" size="md" color="success" />
                  </div>
                </div>
              </FitnessCard>
            </AnimatedCard>
          </div>

          {/* Right column: History + Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Charts row */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AnimatedCard index={2}>
                <FitnessCard title="Calories by Type" icon="🔥">
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 15%, 90%)" opacity={0.4} />
                        <XAxis dataKey="type" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(160, 15%, 90%)" }} />
                        <Bar dataKey="calories" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} animationDuration={1200} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </FitnessCard>
              </AnimatedCard>

              <AnimatedCard index={3}>
                <FitnessCard title="Workout Breakdown" icon="🥧">
                  <div className="h-52 flex items-center">
                    <ResponsiveContainer width="60%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" animationDuration={1200}>
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5">
                      {pieData.map((item, i) => (
                        <div key={item.name} className="flex items-center gap-2 text-xs">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FitnessCard>
              </AnimatedCard>
            </div>

            {/* Workout History */}
            <AnimatedCard index={4}>
              <FitnessCard title="Workout History" icon="📋">
                <div className="space-y-3">
                  {workouts.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No workouts logged yet. Start your first one!</p>
                  ) : (
                    workouts.map((w, i) => (
                      <div key={w._id} className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4 transition-all duration-200 hover:bg-muted hover:scale-[1.01]"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                            {w.type === "Running" ? "🏃" : w.type === "Weight Training" ? "🏋️" : w.type === "Yoga" ? "🧘" : w.type === "Swimming" ? "🏊" : w.type === "Cycling" ? "🚴" : "💪"}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{w.type}</p>
                            <p className="text-sm text-muted-foreground">{new Date(w.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{w.caloriesBurned} cal</p>
                          <p className="text-sm text-muted-foreground">{w.duration} min</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </FitnessCard>
            </AnimatedCard>
          </div>
        </div>
      </AnimatedPage>
    </DashboardLayout>
  );
};

export default Workouts;
