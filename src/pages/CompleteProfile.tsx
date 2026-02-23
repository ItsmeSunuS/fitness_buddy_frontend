import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import FitnessCard from "@/components/FitnessCard";

const fitnessGoalOptions = ["Lose Weight", "Build Muscle", "Improve Cardio", "Increase Flexibility", "Stay Active", "Train for Event"];
const workoutOptions = ["Running", "Weight Training", "Yoga", "Swimming", "Cycling", "HIIT", "Pilates", "Walking"];

const CompleteProfile: React.FC = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    targetWeight: "",
    location: "",
    fitnessGoals: [] as string[],
    preferredWorkouts: [] as string[],
  });

  const toggleMulti = (field: "fitnessGoals" | "preferredWorkouts", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        targetWeight: Number(form.targetWeight),
      };
      await api.put("/api/users/profile", payload);
      updateUser({ ...payload, profileCompleted: true });
      navigate("/dashboard");
    } catch {
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-theme";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 transition-theme">
      <FitnessCard className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <span className="mb-2 inline-block text-5xl">🎯</span>
          <h2 className="font-display text-2xl font-bold text-card-foreground">Complete Your Profile</h2>
          <p className="mt-1 text-muted-foreground">Tell us about yourself so we can personalize your experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Age</label>
              <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required className={inputClass} placeholder="25" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} required className={inputClass}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Height (cm)</label>
              <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} required className={inputClass} placeholder="175" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Weight (kg)</label>
              <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} required className={inputClass} placeholder="70" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Target Weight (kg)</label>
              <input type="number" value={form.targetWeight} onChange={(e) => setForm({ ...form, targetWeight: e.target.value })} required className={inputClass} placeholder="65" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required className={inputClass} placeholder="New York, USA" />
            </div>
          </div>

          {/* Multi-select: Fitness Goals */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Fitness Goals</label>
            <div className="flex flex-wrap gap-2">
              {fitnessGoalOptions.map((goal) => (
                <button key={goal} type="button" onClick={() => toggleMulti("fitnessGoals", goal)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    form.fitnessGoals.includes(goal)
                      ? "bg-primary text-primary-foreground shadow-primary-glow"
                      : "border border-input bg-muted text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}>
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-select: Preferred Workouts */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Preferred Workouts</label>
            <div className="flex flex-wrap gap-2">
              {workoutOptions.map((w) => (
                <button key={w} type="button" onClick={() => toggleMulti("preferredWorkouts", w)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    form.preferredWorkouts.includes(w)
                      ? "bg-primary text-primary-foreground shadow-primary-glow"
                      : "border border-input bg-muted text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}>
                  {w}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-primary-glow transition-all hover:opacity-90 disabled:opacity-60">
            {loading ? "Saving..." : "Complete Profile"}
          </button>
        </form>
      </FitnessCard>
    </div>
  );
};

export default CompleteProfile;
