import { LayoutDashboard, Folder, CheckSquare, LogOut } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar({ currentPage, setCurrentPage, role }) {
  const { setAuth } = useContext(AuthContext);

  const logout = () => {
    setAuth(null);
    setCurrentPage("dashboard");
     localStorage.removeItem("auth");
  localStorage.removeItem("currentPage"); 
    alert("Logged out successfully!");
  };

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "projects", icon: Folder, label: "Projects", adminOnly: true }, // صرف Admin دیکھے گا
    { id: "tasks", icon: CheckSquare, label: "Tasks" },
    { id: "kanban", icon: LayoutDashboard, label: "Kanban Board", adminOnly: false },
  ];

  const handleClick = (id) => {
    setCurrentPage(id);
  };

  return (
    <div className="w-72 min-h-screen backdrop-blur-2xl bg-white/5 border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-8 border-b border-white/10">
        <h1 className="text-4xl font-extrabold text-center text-white drop-shadow-2xl">
          Project<span className="text-pink-400">MS</span>
        </h1>
        <p className="text-center text-white/70 mt-2 text-sm">Smart Management System</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-6">
        <div className="space-y-3">
          {menuItems.map((item) => (
            // Admin only items کو Member نہ دکھائیں
            (!item.adminOnly || role === "admin") && (
              <div
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border ${
                  currentPage === item.id
                    ? "bg-white/20 text-white shadow-xl scale-105 border-white/30"
                    : "text-white/70 hover:bg-white/10 hover:text-white hover:scale-105 hover:border-white/20 border-transparent"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-lg font-medium">{item.label}</span>
              </div>
            )
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 text-white font-medium hover:from-red-500/40 hover:to-pink-500/40 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-white/10"
        >
          <LogOut className="w-6 h-6" />
          Logout
        </button>
      </div>
    </div>
  );
}