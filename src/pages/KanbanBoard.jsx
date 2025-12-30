import { useEffect, useState, useContext } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function KanbanBoard() {
  const { auth } = useContext(AuthContext);
  const isAdmin = auth.role === "admin";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/tasks")
      .then((res) => setTasks(res.data))
      .finally(() => setLoading(false));
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId;

    // Frontend میں task move کریں
    const reorderedTasks = Array.from(tasks);
    const [movedTask] = reorderedTasks.splice(source.index, 1);
    movedTask.status = newStatus;
    reorderedTasks.splice(destination.index, 0, movedTask);

    setTasks(reorderedTasks);

    // Backend پر status update کریں
    try {
      await api.put(`/tasks/status/${movedTask.id}`, { status: newStatus });
    } catch (err) {
      alert("Error updating task status");
      // revert on error
      window.location.reload();
    }
  };

  const columns = {
    pending: { title: "To Do 📌", color: "from-yellow-600 to-amber-600" },
    "in-progress": { title: "In Progress ⚡", color: "from-blue-600 to-cyan-600" },
    completed: { title: "Done ✅", color: "from-green-600 to-emerald-600" },
  };

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="p-10 min-h-screen">
      <h2 className="text-5xl font-extrabold text-white mb-12 text-center drop-shadow-2xl">
        Kanban Board 🎯
      </h2>

      {loading ? (
        <p className="text-white text-center text-2xl">Loading board...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {Object.entries(columns).map(([status, { title, color }]) => (
              <div
                key={status}
                className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl"
              >
                <h3 className={`text-2xl font-bold text-white mb-6 text-center bg-gradient-to-r ${color} bg-clip-text text-transparent drop-shadow-lg`}>
                  {title}
                  <span className="block text-white/70 text-sm mt-2">
                    {getTasksByStatus(status).length} tasks
                  </span>
                </h3>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-96 rounded-xl transition-colors ${
                        snapshot.isDraggingOver ? "bg-white/20" : ""
                      }`}
                    >
                      {getTasksByStatus(status).map((task, index) => (
                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white/20 backdrop-blur-md rounded-2xl p-5 mb-4 border border-white/30 shadow-lg transform transition-all ${
                                snapshot.isDragging ? "scale-105 shadow-2xl rotate-3" : "hover:scale-102"
                              }`}
                            >
                              <h4 className="text-xl font-bold text-white mb-3">{task.title}</h4>

                              {task.due_date && (
                                <p className="text-white/80 text-sm mb-2">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </p>
                              )}

                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                task.priority === "high" ? "bg-red-500/30 text-red-300" :
                                task.priority === "low" ? "bg-green-500/30 text-green-300" :
                                "bg-yellow-500/30 text-yellow-300"
                              }`}>
                                {task.priority.toUpperCase()}
                              </span>

                              <p className="text-white/60 text-sm mt-3">
                                Assigned to User ID: {task.user_id}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}