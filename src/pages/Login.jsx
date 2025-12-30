import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function Login({ setIsSignup, onLoginSuccess }) {
  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault(); // prevent default form submit

    if (!email || !password) {
      alert("Please enter both email and password!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      // ✅ Only store token and set auth once
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("auth", JSON.stringify(res.data.user));
      setAuth(res.data.user);

      // ✅ Redirect to dashboard page
      if (onLoginSuccess) onLoginSuccess();

      alert(`Welcome, ${res.data.user.name}! 🎉`);
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const switchToSignup = () => setIsSignup(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-300 to-indigo-400">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-10 border border-white/20 transform transition hover:scale-105">
          <h2 className="text-4xl font-extrabold text-center text-white mb-8 drop-shadow-lg">
            Welcome 👋
          </h2>

          <form onSubmit={login}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-6 py-4 mb-6 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/50 transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-6 py-4 mb-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/50 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-white/80 mt-8">
            Don't have an account?{" "}
            <span
              onClick={switchToSignup}
              className="font-bold cursor-pointer hover:underline text-white"
            >
              Sign Up
            </span>
          </p>

          <p className="text-center text-white/70 mt-6 text-sm">
            Smart Project Management System ✨
          </p>
        </div>
      </div>
    </div>
  );
}
