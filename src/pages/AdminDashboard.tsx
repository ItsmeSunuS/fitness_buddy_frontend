import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import FitnessCard from "@/components/FitnessCard";
import api from "@/services/api";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileCompleted: boolean;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/api/admin/users");
        setUsers(res.data);
      } catch {
        // Mock data
        setUsers([
          { _id: "1", name: "John Doe", email: "john@example.com", role: "user", profileCompleted: true, createdAt: "2024-01-15" },
          { _id: "2", name: "Sarah Chen", email: "sarah@example.com", role: "user", profileCompleted: true, createdAt: "2024-02-10" },
          { _id: "3", name: "Mike Johnson", email: "mike@example.com", role: "user", profileCompleted: false, createdAt: "2024-03-05" },
          { _id: "4", name: "Admin User", email: "admin@example.com", role: "admin", profileCompleted: true, createdAt: "2024-01-01" },
        ]);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try { await api.delete(`/api/admin/users/${id}`); } catch { /* mock */ }
    setUsers(users.filter((u) => u._id !== id));
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Admin Dashboard ⚙️</h1>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FitnessCard icon="👤" title="Total Users"><p className="text-3xl font-bold text-foreground">{users.length}</p></FitnessCard>
        <FitnessCard icon="✅" title="Active Profiles"><p className="text-3xl font-bold text-foreground">{users.filter((u) => u.profileCompleted).length}</p></FitnessCard>
        <FitnessCard icon="🛡️" title="Admins"><p className="text-3xl font-bold text-foreground">{users.filter((u) => u.role === "admin").length}</p></FitnessCard>
      </div>

      {/* User table */}
      <FitnessCard title="All Users" icon="📋">
        {loading ? (
          <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Name</th>
                  <th className="pb-3 font-medium text-muted-foreground">Email</th>
                  <th className="pb-3 font-medium text-muted-foreground">Role</th>
                  <th className="pb-3 font-medium text-muted-foreground">Profile</th>
                  <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-border/50">
                    <td className="py-3 font-medium text-foreground">{u.name}</td>
                    <td className="py-3 text-muted-foreground">{u.email}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs ${u.profileCompleted ? "text-success" : "text-warning"}`}>
                        {u.profileCompleted ? "✓ Complete" : "⏳ Pending"}
                      </span>
                    </td>
                    <td className="py-3">
                      {u.role !== "admin" && (
                        <button onClick={() => deleteUser(u._id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FitnessCard>
    </DashboardLayout>
  );
};

export default AdminDashboard;
