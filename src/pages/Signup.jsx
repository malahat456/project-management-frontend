import { useState } from "react";
import { api } from "../services/api";

export default function Signup({ setIsSignup }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const signup = async () => {
    try {
      await api.post("/auth/signup", form);
      alert("Account created successfully! Please login.");
      setIsSignup(false);
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Signup failed."));
    }
  };

  const switchToLogin = () => setIsSignup(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-300 to-indigo-400">
      <div className="w-full max-w-lg">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-10 border border-white/20 transform transition hover:scale-105">
          <h2 className="text-4xl font-extrabold text-center text-white mb-4 drop-shadow-lg">
            Create Account ✨
          </h2>
          <p className="text-center text-white/80 mb-8">
            Smart Project Management System
          </p>

          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-6 py-4 mb-4 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/50"
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full px-6 py-4 mb-4 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/50"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-6 py-4 mb-6 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/50"
          />

          {/* Beautiful Role Dropdown */}
          <div className="relative mb-8">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-6 py-4 pl-6 pr-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white focus:outline-none focus:ring-4 focus:ring-white/50 transition appearance-none cursor-pointer hover:bg-white/30"
            >
              <option value="member" className="bg-gray-800 text-white">
                Team Member
              </option>
              <option value="admin" className="bg-gray-800 text-white">
                Admin
              </option>
            </select>

            {/* Custom Down Arrow Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
              <svg
                className="w-6 h-6 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <button
            onClick={signup}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition"
          >
            Sign Up
          </button>

          <p className="text-center text-white/80 mt-6">
            Already have an account?{" "}
            <span
              onClick={switchToLogin}
              className="font-bold cursor-pointer hover:underline text-white"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
