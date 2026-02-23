import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import ProgressBar from "@/components/ProgressBar";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculate BMI from user profile
  const heightM = (user?.height || 175) / 100;
  const currentBMI = ((user?.weight || 70) / (heightM * heightM)).toFixed(1);
  const targetBMI = ((user?.targetWeight || 65) / (heightM * heightM)).toFixed(1);

  // Mock data for demo
  const caloriesBurned = 12450;
  const weightDiff = Math.abs((user?.weight || 70) - (user?.targetWeight || 65));
  const estimatedDays = Math.round(weightDiff * 7); // rough estimate: ~1kg/week

  const progressPercent = Math.min(
    100,
    Math.round(((user?.weight || 70) - (user?.targetWeight || 65)) > 0
      ? ((user?.weight || 70) - (user?.weight || 70) + 2) / weightDiff * 100
      : 50)
  );

  const quickNavCards = [
    { icon: "🏋️", title: "Workouts", desc: "Log & track exercises", path: "/workouts" },
    { icon: "🤝", title: "Buddies", desc: "Find workout partners", path: "/buddies" },
    { icon: "🏆", title: "Challenges", desc: "Compete & achieve", path: "/challenges" },
    { icon: "👥", title: "Groups", desc: "Train together", path: "/groups" },
  ];

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Welcome back, <span className="text-gradient">{user?.name || "Champ"}</span> 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Here's your fitness overview for today</p>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FitnessCard icon="📏" title="Current BMI">
          <p className="text-3xl font-bold text-foreground">{currentBMI}</p>
          <p className="text-sm text-muted-foreground">
            {Number(currentBMI) < 18.5 ? "Underweight" : Number(currentBMI) < 25 ? "Normal" : Number(currentBMI) < 30 ? "Overweight" : "Obese"}
          </p>
        </FitnessCard>

        <FitnessCard icon="🎯" title="Target BMI">
          <p className="text-3xl font-bold text-foreground">{targetBMI}</p>
          <p className="text-sm text-muted-foreground">Goal weight: {user?.targetWeight || 65}kg</p>
        </FitnessCard>

        <FitnessCard icon="🔥" title="Calories Burned">
          <p className="text-3xl font-bold text-foreground">{caloriesBurned.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total calories</p>
        </FitnessCard>

        <FitnessCard icon="📅" title="Est. Days Left">
          <p className="text-3xl font-bold text-foreground">{estimatedDays}</p>
          <p className="text-sm text-muted-foreground">To reach target</p>
        </FitnessCard>
      </div>

      {/* Progress */}
      <FitnessCard title="Progress Toward Goal" icon="📈" className="mb-8">
        <ProgressBar value={progressPercent} label="Weight Goal Progress" size="lg" color="primary" />
        <p className="mt-3 text-sm text-muted-foreground">
          {user?.weight || 70}kg → {user?.targetWeight || 65}kg • Keep going! 💪
        </p>
      </FitnessCard>

      {/* Quick Nav */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickNavCards.map((card) => (
          <FitnessCard
            key={card.path}
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
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
