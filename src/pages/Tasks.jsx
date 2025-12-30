import { useEffect, useState, useContext } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Tasks() {
  const { auth } = useContext(AuthContext);
  const isAdmin = auth.role === "admin";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    project_id: "",
    user_id: "",
    due_date: "",
    priority: "medium",
    status: "pending",
  });

  const [commentInputs, setCommentInputs] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // ================= FETCH TASKS WITH COMMENTS & ATTACHMENTS =================
  useEffect(() => {
    const fetchTasksWithData = async () => {
      setLoading(true);
      try {
        const tasksRes = await api.get("/tasks");
        const tasksData = tasksRes.data;

        const tasksWithData = await Promise.all(
          tasksData.map(async (task) => {
            let comments = [];
            let attachments = [];

            try {
              const commentsRes = await api.get("/comments", {
                params: { task_id: task.id },
              });
              comments = commentsRes.data || [];
              console.log(`Comments for task ${task.id}:`, comments); // debug کے لیے
            } catch (err) {
              console.error(`Error loading comments for task ${task.id}`, err);
            }

            try {
              const attachmentsRes = await api.get("/files", {
                params: { task_id: task.id },
              });
              attachments = attachmentsRes.data || [];
            } catch (err) {
              console.error(
                `Error loading attachments for task ${task.id}`,
                err
              );
            }

            return {
              ...task,
              comments,
              attachments,
            };
          })
        );

        setTasks(tasksWithData);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        alert("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasksWithData();
  }, []);

  // ================= HANDLERS =================
  const handleChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  // ================= CREATE TASK =================
  const createTask = async () => {
    if (!newTask.title.trim()) return alert("❌ Task title is required");
    if (!newTask.project_id) return alert("❌ Project ID is required");
    if (!newTask.user_id) return alert("❌ User ID is required");

    try {
      const res = await api.post("/tasks", newTask);
      setTasks([...tasks, { ...res.data, comments: [], attachments: [] }]);
      setNewTask({
        title: "",
        project_id: "",
        user_id: "",
        due_date: "",
        priority: "medium",
        status: "pending",
      });
      alert("✅ Task created successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating task");
    }
  };

  // ================= UPDATE TASK =================
  const updateTask = async () => {
    if (!newTask.title.trim()) return alert("❌ Task title is required");

    try {
      const res = await api.put(`/tasks/${editingId}`, newTask);
      setTasks(tasks.map((t) => (t.id === editingId ? res.data : t)));
      setEditingId(null);
      setNewTask({
        title: "",
        project_id: "",
        user_id: "",
        due_date: "",
        priority: "medium",
        status: "pending",
      });
      alert("✅ Task updated");
    } catch (err) {
      alert(err.response?.data?.message || "Error updating task");
    }
  };

  // ================= DELETE TASK =================
  const deleteTask = async (id) => {
    if (!confirm("Are you sure?")) return;

    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
      alert("🗑️ Task deleted");
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting task");
    }
  };

  // ================= COMPLETE TASK =================
  const completeTask = async (id) => {
    try {
      const res = await api.put(`/tasks/status/${id}`, { status: "completed" });
      setTasks(tasks.map((t) => (t.id === id ? res.data : t)));
      alert("✅ Task completed!");
    } catch (err) {
      alert(err.response?.data?.message || "Error completing task");
    }
  };

  // ================= ADD COMMENT =================
  const addComment = async (taskId) => {
    const message = commentInputs[taskId]?.trim();
    if (!message) return;

    const task = tasks.find((t) => t.id === taskId);
    const project_id = task?.project_id || null;

    try {
      const res = await api.post("/comments", {
        task_id: taskId,
        project_id,
        message,
      });

      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, comments: [...(t.comments || []), res.data] }
            : t
        )
      );

      setCommentInputs({ ...commentInputs, [taskId]: "" });
    } catch (err) {
      alert("Error adding comment");
    }
  };

  // ================= START EDIT COMMENT =================
  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.message);
  };

  // ================= UPDATE COMMENT =================
  const updateComment = async (commentId, taskId) => {
    if (!editingCommentText.trim()) return alert("Comment cannot be empty");

    try {
      const res = await api.put(`/comments/${commentId}`, {
        message: editingCommentText,
      });

      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                comments: t.comments.map((c) =>
                  c.id === commentId ? res.data : c
                ),
              }
            : t
        )
      );

      setEditingCommentId(null);
      setEditingCommentText("");
      alert("Comment updated!");
    } catch (err) {
      alert("Error updating comment");
    }
  };

  // ================= DELETE COMMENT =================
  const deleteComment = async (commentId, taskId) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await api.delete(`/comments/${commentId}`);

      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, comments: t.comments.filter((c) => c.id !== commentId) }
            : t
        )
      );

      alert("Comment deleted");
    } catch (err) {
      alert("Error deleting comment");
    }
  };

  // ================= UPLOAD FILE =================
  const uploadFile = async (file, taskId) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("task_id", taskId);

    try {
      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, attachments: [...(t.attachments || []), res.data] }
            : t
        )
      );

      alert("File uploaded successfully! 📎");
    } catch (err) {
      alert("Error uploading file");
    }
  };

  // ================= DELETE ATTACHMENT =================
  const deleteAttachment = async (fileId, taskId) => {
    if (!confirm("Delete this file?")) return;

    try {
      await api.delete(`/files/${fileId}`);

      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                attachments: t.attachments.filter((a) => a.id !== fileId),
              }
            : t
        )
      );

      alert("File deleted");
    } catch (err) {
      alert("Error deleting file");
    }
  };

  // ================= EDIT TASK =================
  const startEdit = (task) => {
    setEditingId(task.id);
    setNewTask({
      title: task.title,
      project_id: task.project_id,
      user_id: task.user_id,
      due_date: task.due_date || "",
      priority: task.priority || "medium",
      status: task.status,
    });
  };

  // ================= STATUS & PRIORITY BADGES =================
  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
      "in-progress": "bg-blue-500/20 text-blue-300 border-blue-500/50",
      completed: "bg-green-500/20 text-green-300 border-green-500/50",
    };
    return `px-4 py-2 rounded-full border text-sm font-medium ${
      styles[status] || styles.pending
    }`;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: "bg-green-500/20 text-green-300 border-green-500/50",
      medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
      high: "bg-red-500/20 text-red-300 border-red-500/50",
    };
    return `px-4 py-2 rounded-full border text-sm font-medium ${
      styles[priority] || styles.medium
    }`;
  };

  // Check if task is overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today && task.status !== "completed";
  };

  // ================= UI =================
  return (
    <div className="p-10">
      <h2 className="text-5xl font-extrabold text-white mb-12 text-center drop-shadow-2xl">
        Tasks 📋
      </h2>

      {/* ================= ADMIN FORM ================= */}
      {isAdmin && (
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl mb-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6">
            {editingId ? "Edit Task" : "Create New Task"}
          </h3>

          <input
            name="title"
            placeholder="Task Title"
            value={newTask.title}
            onChange={handleChange}
            className="input mb-4"
          />

          <input
            name="project_id"
            placeholder="Project ID"
            value={newTask.project_id}
            onChange={handleChange}
            className="input mb-4"
          />

          <input
            name="user_id"
            placeholder="User ID"
            value={newTask.user_id}
            onChange={handleChange}
            className="input mb-4"
          />

          {/* Due Date Input */}
          <input
            name="due_date"
            type="date"
            placeholder="Due Date"
            value={newTask.due_date}
            onChange={handleChange}
            className="input mb-4"
          />

          {/* Priority Dropdown */}
          <select
            name="priority"
            value={newTask.priority}
            onChange={handleChange}
            className="w-full px-6 py-4 rounded-xl bg-white/80 backdrop-blur-md border border-white/30 text-black font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition mb-6 cursor-pointer"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button
            onClick={editingId ? updateTask : createTask}
            className="btn-primary"
          >
            {editingId ? "Update Task" : "Create Task"}
          </button>

          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setNewTask({
                  title: "",
                  project_id: "",
                  user_id: "",
                  due_date: "",
                  priority: "medium",
                  status: "pending",
                });
              }}
              className="ml-4 px-6 py-3 bg-gray-600 rounded-xl hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* ================= TASK LIST ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {loading ? (
          <p className="text-white text-center col-span-full text-2xl mt-20">
            Loading tasks...
          </p>
        ) : tasks.length === 0 ? (
          <p className="text-white/70 text-center col-span-full text-2xl mt-20">
            No tasks assigned yet 🚀
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`backdrop-blur-xl bg-white/10 rounded-3xl p-8 border shadow-2xl transform transition hover:scale-105 hover:shadow-purple-500/50 flex flex-col ${
                isOverdue(task.due_date) && task.status !== "completed"
                  ? "border-red-500/50 shadow-red-500/30"
                  : "border-white/20"
              }`}
            >
              <div className="flex-1">
                <h3 className="text-3xl font-extrabold text-white mb-4 break-words">
                  {task.title}
                </h3>

                {/* Status & Priority Badges */}
                <div className="flex gap-3 mb-6 flex-wrap">
                  <span className={getStatusBadge(task.status)}>
                    {task.status.toUpperCase()}
                  </span>
                  <span className={getPriorityBadge(task.priority)}>
                    {task.priority.toUpperCase()} PRIORITY
                  </span>
                </div>

                {/* Due Date */}
                {task.due_date && (
                  <p
                    className={`mb-6 text-lg font-medium ${
                      isOverdue(task.due_date) && task.status !== "completed"
                        ? "text-red-300"
                        : "text-white/80"
                    }`}
                  >
                    Due: {new Date(task.due_date).toLocaleDateString()}
                    {isOverdue(task.due_date) &&
                      task.status !== "completed" &&
                      " ⚠️ Overdue!"}
                  </p>
                )}

                <p className="text-white/80 mb-2">
                  Project ID: {task.project_id}
                </p>
                <p className="text-white/80 mb-6">User ID: {task.user_id}</p>

                {/* ================= COMMENTS ================= */}
                <div className="mt-8 border-t border-white/20 pt-6 flex flex-col">
                  <h4 className="text-xl font-bold text-white mb-4">
                    Comments 💬
                  </h4>

                  <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                    {task.comments && task.comments.length > 0 ? (
                      task.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-white/10 rounded-xl p-4 border border-white/10 relative"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-white font-semibold break-words">
                              {comment.user_name || "User"}
                            </p>

                            {/* صرف اپنا comment edit/delete کر سکے */}
                            {comment.user_id === auth.id && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEditComment(comment)}
                                  className="text-blue-300 hover:text-blue-100 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    deleteComment(comment.id, task.id)
                                  }
                                  className="text-red-300 hover:text-red-100 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>

                          {editingCommentId === comment.id ? (
                            <div>
                              <textarea
                                value={editingCommentText}
                                onChange={(e) =>
                                  setEditingCommentText(e.target.value)
                                }
                                rows="3"
                                className="w-full px-3 py-2 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white mb-2 resize-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    updateComment(comment.id, task.id)
                                  }
                                  className="px-4 py-1 bg-green-600 rounded hover:bg-green-700 text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingCommentText("");
                                  }}
                                  className="px-4 py-1 bg-gray-600 rounded hover:bg-gray-700 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-white/80 text-sm break-words">
                                {comment.message}
                              </p>
                              <p className="text-white/50 text-xs mt-2">
                                {new Date(comment.created_at).toLocaleString()}
                              </p>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-white/60 italic">
                        No comments yet. Start the conversation!
                      </p>
                    )}
                  </div>

                  {/* Add Comment */}
                  <div className="mt-auto">
                    <textarea
                      placeholder="Write your comment here..."
                      value={commentInputs[task.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({
                          ...commentInputs,
                          [task.id]: e.target.value,
                        })
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        (e.preventDefault(), addComment(task.id))
                      }
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition resize-none mb-4"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={() => addComment(task.id)}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-bold hover:shadow-lg transform hover:-translate-y-1 transition"
                      >
                        Send 🚀
                      </button>
                    </div>
                  </div>
                </div>

                {/* ================= ATTACHMENTS ================= */}
                <div className="mt-8 border-t border-white/20 pt-6">
                  <h4 className="text-xl font-bold text-white mb-4">
                    Attachments 📎
                  </h4>

                  <div className="space-y-3 mb-6">
                    {task.attachments && task.attachments.length > 0 ? (
                      task.attachments.map((file) => (
                        <div
                          key={file.id}
                          className="bg-white/10 rounded-xl p-4 border border-white/10 flex justify-between items-center"
                        >
                          <div className="flex-1">
                            <a
                              href={`http://localhost:5000/uploads/${file.filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-300 hover:text-blue-100 font-medium break-all"
                            >
                              {file.original_name}
                            </a>
                            <p className="text-white/50 text-xs mt-1">
                              Uploaded by {file.user_name || "User"} •{" "}
                              {new Date(file.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          {(file.user_id === auth.id || isAdmin) && (
                            <button
                              onClick={() => deleteAttachment(file.id, task.id)}
                              className="ml-4 text-red-300 hover:text-red-100"
                            >
                              Delete 🗑️
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-white/60 italic">No attachments yet</p>
                    )}
                  </div>

                  {/* File Upload */}
                  <div className="mt-4">
                    <input
                      type="file"
                      onChange={(e) =>
                        e.target.files[0] &&
                        uploadFile(e.target.files[0], task.id)
                      }
                      className="block w-full text-sm text-white/70 
                        file:mr-4 file:py-3 file:px-6 
                        file:rounded-full file:border-0 
                        file:text-sm file:font-semibold 
                        file:bg-gradient-to-r file:from-indigo-600 file:to-purple-600 
                        file:text-white 
                        hover:file:from-indigo-700 hover:file:to-purple-700 
                        cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* ================= ACTION BUTTONS ================= */}
              <div className="mt-8 flex flex-col gap-3">
                {task.status !== "completed" && task.user_id === auth.id && (
                  <button
                    onClick={() => completeTask(task.id)}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                  >
                    Mark as Completed ✅
                  </button>
                )}

                {isAdmin && (
                  <>
                    <button
                      onClick={() => startEdit(task)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                    >
                      Edit ✏️
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                    >
                      Delete 🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
