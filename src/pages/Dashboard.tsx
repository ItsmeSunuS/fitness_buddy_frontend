import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import ProgressBar from "@/components/ProgressBar";
import AnimatedPage from "@/components/AnimatedPage";
import AnimatedCard from "@/components/AnimatedCard";
import CountUp from "@/components/CountUp";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

// Mock weekly data
const weeklyCalories = [
  { day: "Mon", calories: 420, duration: 45 },
  { day: "Tue", calories: 310, duration: 30 },
  { day: "Wed", calories: 580, duration: 60 },
  { day: "Thu", calories: 0, duration: 0 },
  { day: "Fri", calories: 490, duration: 50 },
  { day: "Sat", calories: 720, duration: 75 },
  { day: "Sun", calories: 350, duration: 40 },
];

const monthlyWeight = [
  { week: "W1", weight: 72 },
  { week: "W2", weight: 71.5 },
  { week: "W3", weight: 71.2 },
  { week: "W4", weight: 70.8 },
];

const workoutDistribution = [
  { name: "Running", value: 35 },
  { name: "Weights", value: 25 },
  { name: "Yoga", value: 20 },
  { name: "HIIT", value: 15 },
  { name: "Other", value: 5 },
];

const PIE_COLORS = [
  "hsl(160, 84%, 39%)",
  "hsl(172, 66%, 50%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(217, 91%, 60%)",
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const heightM = (user?.height || 175) / 100;
  const currentBMI = ((user?.weight || 70) / (heightM * heightM)).toFixed(1);
  const targetBMI = ((user?.targetWeight || 65) / (heightM * heightM)).toFixed(1);

  const caloriesBurned = 12450;
  const weightDiff = Math.abs((user?.weight || 70) - (user?.targetWeight || 65));
  const estimatedDays = Math.round(weightDiff * 7);

  const progressPercent = Math.min(
    100,
    Math.round(
      ((user?.weight || 70) - (user?.targetWeight || 65)) > 0
        ? ((user?.weight || 70) - (user?.weight || 70) + 2) / weightDiff * 100
        : 50
    )
  );

  const quickNavCards = [
    { icon: "🏋️", title: "Workouts", desc: "Log & track exercises", path: "/workouts" },
    { icon: "🤝", title: "Buddies", desc: "Find workout partners", path: "/buddies" },
    { icon: "🏆", title: "Challenges", desc: "Compete & achieve", path: "/challenges" },
    { icon: "👥", title: "Groups", desc: "Train together", path: "/groups" },
  ];

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

        {/* Stats cards with count-up */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatedCard index={0}>
            <FitnessCard icon="📏" title="Current BMI">
              <p className="text-3xl font-bold text-foreground">
                <CountUp end={Number(currentBMI)} decimals={1} duration={1.2} />
              </p>
              <p className="text-sm text-muted-foreground">
                {Number(currentBMI) < 18.5 ? "Underweight" : Number(currentBMI) < 25 ? "Normal" : Number(currentBMI) < 30 ? "Overweight" : "Obese"}
              </p>
            </FitnessCard>
          </AnimatedCard>

          <AnimatedCard index={1}>
            <FitnessCard icon="🎯" title="Target BMI">
              <p className="text-3xl font-bold text-foreground">
                <CountUp end={Number(targetBMI)} decimals={1} duration={1.2} />
              </p>
              <p className="text-sm text-muted-foreground">Goal weight: {user?.targetWeight || 65}kg</p>
            </FitnessCard>
          </AnimatedCard>

          <AnimatedCard index={2}>
            <FitnessCard icon="🔥" title="Calories Burned">
              <p className="text-3xl font-bold text-foreground">
                <CountUp end={caloriesBurned} duration={1.8} />
              </p>
              <p className="text-sm text-muted-foreground">Total calories</p>
            </FitnessCard>
          </AnimatedCard>

          <AnimatedCard index={3}>
            <FitnessCard icon="📅" title="Est. Days Left">
              <p className="text-3xl font-bold text-foreground">
                <CountUp end={estimatedDays} duration={1} />
              </p>
              <p className="text-sm text-muted-foreground">To reach target</p>
            </FitnessCard>
          </AnimatedCard>
        </div>

        {/* Progress */}
        <AnimatedCard index={4}>
          <FitnessCard title="Progress Toward Goal" icon="📈" className="mb-8">
            <ProgressBar value={progressPercent} label="Weight Goal Progress" size="lg" color="primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              {user?.weight || 70}kg → {user?.targetWeight || 65}kg • Keep going! 💪
            </p>
          </FitnessCard>
        </AnimatedCard>

        {/* Analytics Charts */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Weekly Calories Area Chart */}
          <AnimatedCard index={5}>
            <FitnessCard title="Weekly Calories Burned" icon="🔥">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyCalories}>
                    <defs>
                      <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 15%, 90%)" opacity={0.4} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(160, 15%, 90%)",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="monotone" dataKey="calories" stroke="hsl(160, 84%, 39%)"
                      strokeWidth={2.5} fill="url(#calorieGradient)"
                      animationDuration={1500} animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </FitnessCard>
          </AnimatedCard>

          {/* Weekly Duration Bar Chart */}
          <AnimatedCard index={6}>
            <FitnessCard title="Daily Workout Duration" icon="⏱️">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyCalories}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 15%, 90%)" opacity={0.4} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} unit=" min" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(160, 15%, 90%)",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="duration" fill="hsl(172, 66%, 50%)" radius={[8, 8, 0, 0]}
                      animationDuration={1200} animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FitnessCard>
          </AnimatedCard>

          {/* Weight Trend Line Chart */}
          <AnimatedCard index={7}>
            <FitnessCard title="Weight Trend (Monthly)" icon="⚖️">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyWeight}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 15%, 90%)" opacity={0.4} />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} unit=" kg" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(160, 15%, 90%)",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Line
                      type="monotone" dataKey="weight" stroke="hsl(142, 76%, 36%)"
                      strokeWidth={3} dot={{ r: 6, fill: "hsl(142, 76%, 36%)", stroke: "white", strokeWidth: 2 }}
                      activeDot={{ r: 8 }} animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </FitnessCard>
          </AnimatedCard>

          {/* Workout Distribution Pie Chart */}
          <AnimatedCard index={8}>
            <FitnessCard title="Workout Distribution" icon="🥧">
              <div className="h-64 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workoutDistribution}
                      cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      paddingAngle={4} dataKey="value"
                      animationDuration={1200} animationEasing="ease-out"
                    >
                      {workoutDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(160, 15%, 90%)",
                        borderRadius: "12px",
                      }}
                      formatter={(value: number) => [`${value}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 pr-4">
                  {workoutDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm whitespace-nowrap">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-semibold text-foreground">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </FitnessCard>
          </AnimatedCard>
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickNavCards.map((card, i) => (
            <AnimatedCard key={card.path} index={9 + i}>
              <FitnessCard
                icon={card.icon}
                title={card.title}
                subtitle={card.desc}
                onClick={() => navigate(card.path)}
                className="group"
              >
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
