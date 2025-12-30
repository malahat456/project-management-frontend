import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function MemberDashboard() {
  const { auth } = useContext(AuthContext);

  const [assignedProjects, setAssignedProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Fetch assigned projects
    api.get("/projects/member-projects")
      .then(res => setAssignedProjects(res.data))
      .catch(err => console.error("Projects fetch error:", err));

    // Fetch member tasks
    api.get("/tasks/member-tasks")
      .then(res => setTasks(res.data))
      .catch(err => console.error("Tasks fetch error:", err));
  }, []);

  const pendingTasks = tasks.filter(t => t.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed");

  const cards = [
    {
      label: "Assigned Projects",
      value: assignedProjects.length,
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Pending Tasks",
      value: pendingTasks.length,
      color: "from-purple-500 to-pink-500"
    },
    {
      label: "Completed Tasks",
      value: completedTasks.length,
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="p-10 w-full">
      <h2 className="text-5xl font-extrabold text-white mb-12 text-center drop-shadow-2xl">
        Welcome, {auth.name || "Team Member"}! 👋
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {cards.map((item, i) => (
          <div
            key={i}
            className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl transform transition hover:scale-110 hover:shadow-purple-500/50"
          >
            <p className="text-white/80 text-lg mb-4">{item.label}</p>
            <h3
              className={`text-6xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}
            >
              {item.value || 0}
            </h3>
          </div>
        ))}
      </div>

      {/* Optional Quick Tips */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl max-w-4xl mx-auto mt-10">
        <h3 className="text-2xl font-bold text-white mb-4">Quick Tips</h3>
        <ul className="text-white/80 list-disc pl-5 space-y-2">
          <li>Check your assigned projects regularly.</li>
          <li>Update task status once completed.</li>
          <li>Communicate with your team effectively.</li>
        </ul>
      </div>
    </div>
  );
}
