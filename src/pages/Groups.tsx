import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const MEMBER_COLORS = [
  "hsl(160, 84%, 39%)", "hsl(172, 66%, 50%)", "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)", "hsl(217, 91%, 60%)",
];

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

  // Aggregated stats for overview chart
  const overviewBarData = groups.map((g) => ({
    name: g.name,
    burned: g.totalCalories,
    goal: g.weeklyGoal,
  }));

  return (
    <DashboardLayout>
      <AnimatedPage>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-foreground">Group Workouts 👥</h1>
          <motion.button
            onClick={() => setShowCreate(!showCreate)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-primary-glow hover:opacity-90"
          >
            {showCreate ? "Cancel" : "+ New Group"}
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
                <form onSubmit={handleCreate} className="flex gap-3">
                  <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} required
                    className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-theme"
                    placeholder="Group name (3-5 members)" />
                  <button type="submit" className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">Create</button>
                </form>
              </FitnessCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overview Chart */}
        {groups.length > 0 && (
          <AnimatedCard index={0} className="mb-6">
            <FitnessCard title="Group Performance Overview" icon="📊">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 15%, 90%)" opacity={0.4} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(160, 15%, 90%)" }} />
                    <Bar dataKey="burned" name="Burned" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} animationDuration={1200} />
                    <Bar dataKey="goal" name="Goal" fill="hsl(160, 84%, 39%)" opacity={0.2} radius={[6, 6, 0, 0]} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FitnessCard>
          </AnimatedCard>
        )}

        {/* Group cards with pie charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {groups.map((group, gi) => {
            const pieData = group.members.map((m) => ({ name: m.name, value: m.caloriesBurned }));
            return (
              <AnimatedCard key={group._id} index={gi + 1}>
                <FitnessCard title={group.name} icon="👥">
                  {/* Combined progress */}
                  <ProgressBar
                    value={(group.totalCalories / group.weeklyGoal) * 100}
                    label={`${group.totalCalories.toLocaleString()} / ${group.weeklyGoal.toLocaleString()} cal`}
                    size="lg"
                    color="accent"
                  />

                  {/* Member pie chart */}
                  <div className="mt-4 flex items-center">
                    <div className="h-40 w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value" animationDuration={1200}>
                            {pieData.map((_, i) => <Cell key={i} fill={MEMBER_COLORS[i % MEMBER_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: "12px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-2">
                      <p className="text-sm font-medium text-foreground mb-2">Contributions</p>
                      {group.members.map((m, i) => (
                        <div key={m.name} className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: MEMBER_COLORS[i % MEMBER_COLORS.length] }} />
                          <span className="text-sm text-muted-foreground flex-1">{m.name}</span>
                          <span className="text-sm font-semibold text-foreground">
                            <CountUp end={m.caloriesBurned} duration={1} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FitnessCard>
              </AnimatedCard>
            );
          })}
        </div>
      </AnimatedPage>
    </DashboardLayout>
  );
};

export default Groups;
