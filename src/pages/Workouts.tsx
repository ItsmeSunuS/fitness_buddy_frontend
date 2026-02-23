import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import ProgressBar from "@/components/ProgressBar";
import api from "@/services/api";

interface Workout {
  _id: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  date: string;
}

const workoutTypes = ["Running", "Weight Training", "Yoga", "Swimming", "Cycling", "HIIT", "Walking", "Pilates"];

const Workouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [form, setForm] = useState({ type: "Running", duration: "", caloriesBurned: "" });
  const [loading, setLoading] = useState(false);

  // Fetch workouts on mount
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await api.get("/api/workouts");
        setWorkouts(res.data);
      } catch {
        // Use mock data if API not available
        setWorkouts([
          { _id: "1", type: "Running", duration: 30, caloriesBurned: 350, date: new Date().toISOString() },
          { _id: "2", type: "Weight Training", duration: 45, caloriesBurned: 280, date: new Date(Date.now() - 86400000).toISOString() },
          { _id: "3", type: "Yoga", duration: 60, caloriesBurned: 180, date: new Date(Date.now() - 172800000).toISOString() },
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
      // Mock add
      setWorkouts([{ _id: Date.now().toString(), ...newWorkout, date: new Date().toISOString() }, ...workouts]);
    }
    setForm({ type: "Running", duration: "", caloriesBurned: "" });
    setLoading(false);
  };

  const totalCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
  const weeklyGoal = 300; // minutes per week
  const weeklyProgress = Math.min(100, (totalDuration / weeklyGoal) * 100);

  const inputClass = "w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-theme";

  return (
    <DashboardLayout>
      <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Workout Log 🏋️</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Add Workout Form */}
        <div className="lg:col-span-1">
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
                className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-primary-glow transition-all hover:opacity-90 disabled:opacity-60">
                {loading ? "Adding..." : "Log Workout"}
              </button>
            </form>
          </FitnessCard>

          {/* Summary */}
          <FitnessCard title="Summary" icon="📊" className="mt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Workouts</span>
                <span className="font-semibold text-foreground">{workouts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Duration</span>
                <span className="font-semibold text-foreground">{totalDuration} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Calories Burned</span>
                <span className="font-semibold text-foreground">{totalCalories.toLocaleString()}</span>
              </div>
              <div className="pt-2">
                <ProgressBar value={weeklyProgress} label="Weekly Goal" size="md" color="success" />
              </div>
            </div>
          </FitnessCard>
        </div>

        {/* Workout History */}
        <div className="lg:col-span-2">
          <FitnessCard title="Workout History" icon="📋">
            <div className="space-y-3">
              {workouts.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No workouts logged yet. Start your first one!</p>
              ) : (
                workouts.map((w) => (
                  <div key={w._id} className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4 transition-all hover:bg-muted">
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Workouts;
