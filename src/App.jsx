import { useContext, useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import KanbanBoard from "./pages/KanbanBoard"; // ← نیا import
import Sidebar from "./components/Sidebar";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { auth } = useContext(AuthContext);
  const isAdmin = auth?.role === "admin";

  // currentPage کو localStorage میں save کریں تاکہ refresh پر بھی رہے
  const [currentPage, setCurrentPage] = useState(() => {
    const stored = localStorage.getItem("currentPage");
    return stored || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  const [isSignup, setIsSignup] = useState(false);

  // اگر user logged in نہیں ہے تو Login/Signup دکھائیں
  if (!auth) {
    return isSignup ? (
      <Signup setIsSignup={setIsSignup} />
    ) : (
      <Login setIsSignup={setIsSignup} />
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        role={auth.role}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {currentPage === "dashboard" &&
          (auth.role === "admin" ? <AdminDashboard /> : <MemberDashboard />)}

        {currentPage === "projects" && <Projects />}

        {currentPage === "tasks" && <Tasks />}

        {/* ← نیا Kanban Board page */}
        {currentPage === "kanban" && <KanbanBoard />}
      </div>
    </div>
  );
}

export default App;