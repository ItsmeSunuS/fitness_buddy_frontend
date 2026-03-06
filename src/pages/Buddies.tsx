import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import AnimatedPage from "@/components/AnimatedPage";
import AnimatedCard from "@/components/AnimatedCard";
import CountUp from "@/components/CountUp";
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
  const navigate = useNavigate();
  const [suggested, setSuggested] = useState<Buddy[]>([]);
  const [myBuddies, setMyBuddies] = useState<Buddy[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Buddy | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"my" | "suggested">("my");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sugRes, myRes] = await Promise.allSettled([
          api.get("/api/buddies/suggestions"),
          api.get("/api/buddies"),
        ]);
        if (sugRes.status === "fulfilled") setSuggested(sugRes.value.data);
        if (myRes.status === "fulfilled") setMyBuddies(myRes.value.data);
      } catch {
        setSuggested([
          { _id: "1", name: "Sarah Chen", fitnessGoals: ["Lose Weight", "Build Muscle"], preferredWorkouts: ["Running", "HIIT"], location: "New York" },
          { _id: "2", name: "Mike Johnson", fitnessGoals: ["Build Muscle"], preferredWorkouts: ["Weight Training"], location: "Los Angeles" },
          { _id: "3", name: "Emily Davis", fitnessGoals: ["Improve Cardio", "Stay Active"], preferredWorkouts: ["Cycling", "Swimming"], location: "Chicago" },
          { _id: "5", name: "Jordan Lee", fitnessGoals: ["Flexibility"], preferredWorkouts: ["Yoga", "Pilates"], location: "Austin" },
        ]);
        setMyBuddies([
          { _id: "4", name: "Alex Rivera", fitnessGoals: ["Build Muscle"], preferredWorkouts: ["Weight Training", "HIIT"], location: "Miami", isBuddy: true },
        ]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const addBuddy = async (buddy: Buddy) => {
    try {
      await api.post(`/api/buddies/${buddy._id}`);
    } catch { /* mock fallback */ }
    setMyBuddies((prev) => [...prev, { ...buddy, isBuddy: true }]);
    setSuggested((prev) => prev.filter((s) => s._id !== buddy._id));
  };

  const removeBuddy = async (buddy: Buddy) => {
    try {
      await api.delete(`/api/buddies/${buddy._id}`);
    } catch { /* mock fallback */ }
    setMyBuddies((prev) => prev.filter((b) => b._id !== buddy._id));
  };

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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-display text-3xl font-bold text-foreground">Workout Buddies 🤝</h1>
          <button
            onClick={() => navigate("/messages")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            💬 Messages
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <AnimatedCard index={0}>
            <FitnessCard icon="🤝" title="My Buddies">
              <p className="text-3xl font-bold text-foreground"><CountUp end={myBuddies.length} duration={1} /></p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </FitnessCard>
          </AnimatedCard>
          <AnimatedCard index={1}>
            <FitnessCard icon="✨" title="Suggestions">
              <p className="text-3xl font-bold text-foreground"><CountUp end={suggested.length} duration={1} /></p>
              <p className="text-sm text-muted-foreground">Available</p>
            </FitnessCard>
          </AnimatedCard>
          <AnimatedCard index={2}>
            <FitnessCard icon="💬" title="Conversations">
              <p className="text-3xl font-bold text-foreground"><CountUp end={myBuddies.length} duration={1} /></p>
              <p className="text-sm text-muted-foreground">Active chats</p>
            </FitnessCard>
          </AnimatedCard>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTab("my")}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
              tab === "my" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            My Buddies ({myBuddies.length})
          </button>
          <button
            onClick={() => setTab("suggested")}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
              tab === "suggested" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Find Buddies ({suggested.length})
          </button>
        </div>

        {/* Profile modal */}
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedProfile(null)}>
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
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
                <div className="flex flex-wrap gap-1">
                  {selectedProfile.fitnessGoals.map((g) => (
                    <span key={g} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{g}</span>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <p className="mb-1 text-sm font-medium text-foreground">Preferred Workouts</p>
                <div className="flex flex-wrap gap-1">
                  {selectedProfile.preferredWorkouts.map((w) => (
                    <span key={w} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-foreground">{w}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                {!selectedProfile.isBuddy && (
                  <button
                    onClick={() => { addBuddy(selectedProfile); setSelectedProfile(null); }}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    Add Buddy
                  </button>
                )}
                {selectedProfile.isBuddy && (
                  <button
                    onClick={() => navigate("/messages")}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    💬 Message
                  </button>
                )}
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="flex-1 rounded-xl bg-muted py-2.5 text-sm font-medium text-foreground hover:bg-muted/80"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Buddy lists */}
        {tab === "my" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myBuddies.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <span className="mb-4 block text-5xl">🤝</span>
                <h3 className="font-display text-lg font-semibold text-foreground">No buddies yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Switch to "Find Buddies" to add workout partners!</p>
              </div>
            ) : (
              myBuddies.map((b, i) => (
                <AnimatedCard key={b._id} index={i}>
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                        {b.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{b.name}</p>
                        <p className="text-xs text-muted-foreground">📍 {b.location}</p>
                      </div>
                    </div>
                    <div className="mb-4 flex flex-wrap gap-1">
                      {b.preferredWorkouts.slice(0, 3).map((w) => (
                        <span key={w} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{w}</span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedProfile(b)} className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-foreground hover:bg-muted">
                        Profile
                      </button>
                      <button onClick={() => navigate("/messages")} className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:opacity-90">
                        💬 Message
                      </button>
                      <button onClick={() => removeBuddy(b)} className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10">
                        Remove
                      </button>
                    </div>
                  </div>
                </AnimatedCard>
              ))
            )}
          </div>
        )}

        {tab === "suggested" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggested.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <span className="mb-4 block text-5xl">✨</span>
                <h3 className="font-display text-lg font-semibold text-foreground">No suggestions right now</h3>
                <p className="mt-1 text-sm text-muted-foreground">Check back later for new buddy recommendations</p>
              </div>
            ) : (
              suggested.map((b, i) => (
                <AnimatedCard key={b._id} index={i}>
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent-foreground">
                        {b.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{b.name}</p>
                        <p className="text-xs text-muted-foreground">📍 {b.location}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Goals</p>
                      <div className="flex flex-wrap gap-1">
                        {b.fitnessGoals.map((g) => (
                          <span key={g} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">{g}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Workouts</p>
                      <div className="flex flex-wrap gap-1">
                        {b.preferredWorkouts.map((w) => (
                          <span key={w} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{w}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedProfile(b)} className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-foreground hover:bg-muted">
                        View Profile
                      </button>
                      <button onClick={() => addBuddy(b)} className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:opacity-90">
                        ➕ Add Buddy
                      </button>
                    </div>
                  </div>
                </AnimatedCard>
              ))
            )}
          </div>
        )}
      </AnimatedPage>
    </DashboardLayout>
  );
};

export default Buddies;
