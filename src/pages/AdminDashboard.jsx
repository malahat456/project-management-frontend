import { useEffect, useState, useContext } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function AdminDashboard() {
  const { auth } = useContext(AuthContext); // get logged-in admin info

  const [stats, setStats] = useState({ projects: 0, tasks: 0, members: 0 });

  useEffect(() => {
    // Fetch stats
    api.get("/dashboard/admin")
      .then(res => setStats(res.data))
      .catch(err => console.error("Error fetching admin stats:", err));
  }, []);

  const cards = [
    { label: "Total Projects", value: stats.projects, color: "from-blue-500 to-cyan-500" },
    { label: "Total Tasks", value: stats.tasks, color: "from-purple-500 to-pink-500" },
    { label: "Team Members", value: stats.members, color: "from-indigo-500 to-purple-500" }
  ];

  return (
    <div className="p-10 w-full">
      {/* ✅ Welcome message using auth.name */}
      <h2 className="text-5xl font-extrabold text-white mb-12 text-center drop-shadow-2xl">
        Welcome, {auth?.name || "Admin"}! 👋
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {cards.map((item, i) => (
          <div
            key={i}
            className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl transform transition hover:scale-110 hover:shadow-purple-500/50"
          >
            <p className="text-white/80 text-lg mb-4">{item.label}</p>
            <h3 className={`text-6xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
              {item.value || 0}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
