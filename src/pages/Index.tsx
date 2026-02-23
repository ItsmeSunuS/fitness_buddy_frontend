import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

const Index = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background transition-theme">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💪</span>
          <span className="font-display text-xl font-bold text-foreground">
            Fitness<span className="text-primary">Buddy</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
            Sign In
          </Link>
          <Link to="/register" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-primary-glow hover:opacity-90">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center px-6 py-20 text-center lg:py-32">
        <span className="mb-6 inline-block text-7xl">🏃‍♂️</span>
        <h1 className="mb-4 max-w-3xl font-display text-5xl font-extrabold leading-tight text-foreground lg:text-6xl">
          Your Fitness Journey{" "}
          <span className="text-gradient">Starts Here</span>
        </h1>
        <p className="mb-8 max-w-xl text-lg text-muted-foreground">
          Track workouts, find fitness buddies, join challenges, and achieve your health goals — all in one beautiful platform.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/register" className="rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-primary-glow transition-all hover:opacity-90">
            Start Free →
          </Link>
          <Link to="/login" className="rounded-xl border border-border bg-card px-8 py-3.5 font-semibold text-foreground shadow-fitness hover:bg-muted">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: "🏋️", title: "Workout Tracking", desc: "Log exercises, track calories, and monitor your weekly progress." },
          { icon: "🤝", title: "Buddy Matching", desc: "Find workout partners who share your fitness goals." },
          { icon: "🏆", title: "Challenges", desc: "Create and join challenges to stay motivated." },
          { icon: "👥", title: "Group Workouts", desc: "Train with small groups and track combined progress." },
          { icon: "📍", title: "Gym Finder", desc: "Discover nearby gyms and fitness centers." },
          { icon: "📊", title: "Smart Dashboard", desc: "BMI tracking, calorie stats, and goal projections." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-fitness transition-all duration-300 hover:shadow-fitness-hover">
            <span className="mb-3 inline-block text-3xl">{f.icon}</span>
            <h3 className="mb-1 font-display text-lg font-bold text-card-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        © 2026 FitnessBuddy. Built with ❤️ for fitness enthusiasts.
      </footer>
    </div>
  );
};

export default Index;
