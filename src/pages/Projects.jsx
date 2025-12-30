import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects"); // JWT attached automatically
        setProjects(res.data); // expected array of { id, title, description }
      } catch (error) {
        console.error("Fetch projects error:", error.response?.data || error);
        alert(error.response?.data?.message || "Failed to load projects");
      }
    };
    fetchProjects();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  // Create new project
  const createProject = async () => {
    if (!newProject.title.trim()) return alert("Project title is required!");
    setLoading(true);
    try {
      const res = await api.post("/projects", newProject); // { title, description }
      setProjects([...projects, res.data]); // add new project instantly
      setNewProject({ title: "", description: "" });
      alert("Project created successfully! 🎉");
    } catch (error) {
      console.error("Create project error:", error.response?.data || error);
      alert(error.response?.data?.message || "Error creating project");
    } finally {
      setLoading(false);
    }
  };

  // Update existing project
  const updateProject = async (id) => {
    if (!newProject.title.trim()) return alert("Project title is required!");
    setLoading(true);
    try {
      const res = await api.put(`/projects/${id}`, newProject); // { title, description }
      setProjects(projects.map((p) => (p.id === id ? res.data : p)));
      setEditingId(null);
      setNewProject({ title: "", description: "" });
      alert("Project updated!");
    } catch (error) {
      console.error("Update project error:", error.response?.data || error);
      alert(error.response?.data?.message || "Error updating project");
    } finally {
      setLoading(false);
    }
  };

  // Delete project
  const deleteProject = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p.id !== id));
      alert("Project deleted!");
    } catch (error) {
      console.error("Delete project error:", error.response?.data || error);
      alert(error.response?.data?.message || "Error deleting project");
    }
  };

  // Start editing
  const startEdit = (project) => {
    setNewProject({ title: project.title, description: project.description || "" });
    setEditingId(project.id);
  };

  return (
    <div className="p-10">
      <h2 className="text-5xl font-extrabold text-white mb-12 text-center drop-shadow-2xl">
        Projects 📁
      </h2>

      {/* Create/Edit Form */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl mb-12 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-white mb-6">
          {editingId ? "Edit Project" : "Create New Project"}
        </h3>

        <input
          name="title"
          placeholder="Project Title"
          value={newProject.title}
          onChange={handleChange}
          className="input mb-4"
          disabled={loading}
        />

        <textarea
          name="description"
          placeholder="Description (optional)"
          value={newProject.description}
          onChange={handleChange}
          className="w-full px-6 py-4 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/50 transition mb-6 h-32 resize-none"
          disabled={loading}
        />

        <button
          onClick={editingId ? () => updateProject(editingId) : createProject}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Saving..." : editingId ? "Update Project" : "Create Project"}
        </button>

        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              setNewProject({ title: "", description: "" });
            }}
            className="ml-4 px-6 py-3 bg-gray-600 rounded-xl hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {projects.length === 0 ? (
          <p className="text-white/70 text-center col-span-full text-2xl mt-20">
            No projects yet. Create your first one! 🚀
          </p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl transform transition hover:scale-105 hover:shadow-purple-500/50"
            >
              <h3 className="text-3xl font-extrabold text-white mb-4 drop-shadow-md">
                {project.title || "Untitled Project"}
              </h3>

              <p className="text-white/80 mb-8 leading-relaxed">
                {project.description || "No description provided."}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => startEdit(project)}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition"
                >
                  Edit ✏️
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition"
                >
                  Delete 🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
