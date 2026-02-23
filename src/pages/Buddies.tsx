import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import api from "@/services/api";

interface Buddy {
  _id: string;
  name: string;
  fitnessGoals: string[];
  preferredWorkouts: string[];
  location: string;
  isBuddy?: boolean;
}

const Buddies: React.FC = () => {
  const [suggested, setSuggested] = useState<Buddy[]>([]);
  const [myBuddies, setMyBuddies] = useState<Buddy[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Buddy | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sugRes, myRes] = await Promise.all([
          api.get("/api/buddies/suggestions"),
          api.get("/api/buddies"),
        ]);
        setSuggested(sugRes.data);
        setMyBuddies(myRes.data);
      } catch {
        // Mock data
        setSuggested([
          { _id: "1", name: "Sarah Chen", fitnessGoals: ["Lose Weight", "Build Muscle"], preferredWorkouts: ["Running", "HIIT"], location: "New York" },
          { _id: "2", name: "Mike Johnson", fitnessGoals: ["Build Muscle"], preferredWorkouts: ["Weight Training"], location: "Los Angeles" },
          { _id: "3", name: "Emily Davis", fitnessGoals: ["Improve Cardio", "Stay Active"], preferredWorkouts: ["Cycling", "Swimming"], location: "Chicago" },
        ]);
        setMyBuddies([
          { _id: "4", name: "Alex Rivera", fitnessGoals: ["Build Muscle"], preferredWorkouts: ["Weight Training", "HIIT"], location: "Miami", isBuddy: true },
        ]);
      }
    };
    fetch();
  }, []);

  const addBuddy = async (buddy: Buddy) => {
    try {
      await api.post(`/api/buddies/${buddy._id}`);
    } catch { /* mock */ }
    setMyBuddies([...myBuddies, { ...buddy, isBuddy: true }]);
    setSuggested(suggested.filter((s) => s._id !== buddy._id));
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Workout Buddies 🤝</h1>

      {/* Profile modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedProfile(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-fitness-hover" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {selectedProfile.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-card-foreground">{selectedProfile.name}</h3>
                <p className="text-sm text-muted-foreground">📍 {selectedProfile.location}</p>
              </div>
            </div>
            <div className="mb-3">
              <p className="mb-1 text-sm font-medium text-foreground">Fitness Goals</p>
              <div className="flex flex-wrap gap-1">{selectedProfile.fitnessGoals.map((g) => <span key={g} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{g}</span>)}</div>
            </div>
            <div className="mb-4">
              <p className="mb-1 text-sm font-medium text-foreground">Workouts</p>
              <div className="flex flex-wrap gap-1">{selectedProfile.preferredWorkouts.map((w) => <span key={w} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{w}</span>)}</div>
            </div>
            <button onClick={() => setSelectedProfile(null)} className="w-full rounded-xl bg-muted py-2.5 text-sm font-medium text-foreground hover:bg-muted/80">Close</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Suggested */}
        <FitnessCard title="Suggested Buddies" icon="✨">
          <div className="space-y-3">
            {suggested.map((b) => (
              <div key={b._id} className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedProfile(b)}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">{b.name.charAt(0)}</div>
                  <div>
                    <p className="font-medium text-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground">📍 {b.location}</p>
                  </div>
                </div>
                <button onClick={() => addBuddy(b)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Add</button>
              </div>
            ))}
            {suggested.length === 0 && <p className="py-4 text-center text-muted-foreground">No suggestions right now</p>}
          </div>
        </FitnessCard>

        {/* My Buddies */}
        <FitnessCard title="My Buddies" icon="💪">
          <div className="space-y-3">
            {myBuddies.map((b) => (
              <div key={b._id} className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedProfile(b)}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 font-bold text-success">{b.name.charAt(0)}</div>
                  <div>
                    <p className="font-medium text-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.preferredWorkouts.slice(0, 2).join(", ")}</p>
                  </div>
                </div>
                <button className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Share</button>
              </div>
            ))}
            {myBuddies.length === 0 && <p className="py-4 text-center text-muted-foreground">No buddies yet. Add some!</p>}
          </div>
        </FitnessCard>
      </div>
    </DashboardLayout>
  );
};

export default Buddies;
