import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import ProgressBar from "@/components/ProgressBar";
import api from "@/services/api";

interface GroupMember {
  name: string;
  caloriesBurned: number;
}

interface Group {
  _id: string;
  name: string;
  members: GroupMember[];
  totalCalories: number;
  weeklyGoal: number;
}

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/api/groups");
        setGroups(res.data);
      } catch {
        setGroups([
          {
            _id: "1", name: "Morning Runners", weeklyGoal: 5000,
            totalCalories: 3200,
            members: [
              { name: "You", caloriesBurned: 1200 },
              { name: "Sarah", caloriesBurned: 1100 },
              { name: "Mike", caloriesBurned: 900 },
            ],
          },
          {
            _id: "2", name: "Iron Squad", weeklyGoal: 8000,
            totalCalories: 4500,
            members: [
              { name: "You", caloriesBurned: 1500 },
              { name: "Alex", caloriesBurned: 1800 },
              { name: "Emily", caloriesBurned: 1200 },
            ],
          },
        ]);
      }
    };
    fetch();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newGroup: Group = {
      _id: Date.now().toString(),
      name: newGroupName,
      members: [{ name: "You", caloriesBurned: 0 }],
      totalCalories: 0,
      weeklyGoal: 5000,
    };
    try {
      const res = await api.post("/api/groups", { name: newGroupName });
      setGroups([res.data, ...groups]);
    } catch {
      setGroups([newGroup, ...groups]);
    }
    setNewGroupName("");
    setShowCreate(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Group Workouts 👥</h1>
        <button onClick={() => setShowCreate(!showCreate)}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-primary-glow hover:opacity-90">
          {showCreate ? "Cancel" : "+ New Group"}
        </button>
      </div>

      {showCreate && (
        <FitnessCard className="mb-6">
          <form onSubmit={handleCreate} className="flex gap-3">
            <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} required
              className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-theme"
              placeholder="Group name (3-5 members)" />
            <button type="submit" className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">Create</button>
          </form>
        </FitnessCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {groups.map((group) => (
          <FitnessCard key={group._id} title={group.name} icon="👥">
            {/* Combined progress */}
            <ProgressBar
              value={(group.totalCalories / group.weeklyGoal) * 100}
              label={`${group.totalCalories.toLocaleString()} / ${group.weeklyGoal.toLocaleString()} cal`}
              size="lg"
              color="accent"
            />

            {/* Member breakdown (simple bar chart) */}
            <div className="mt-5 space-y-3">
              <p className="text-sm font-medium text-foreground">Member Contributions</p>
              {group.members.map((m) => {
                const pct = group.totalCalories > 0 ? (m.caloriesBurned / group.totalCalories) * 100 : 0;
                return (
                  <div key={m.name} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{m.name}</span>
                        <span className="text-muted-foreground">{m.caloriesBurned} cal</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </FitnessCard>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Groups;
