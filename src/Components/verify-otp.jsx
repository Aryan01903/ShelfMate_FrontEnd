import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "./api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VerifyOtp() {
  const [form, setForm] = useState({
    name: "",
    userId: "",
    email: "",
    password: "",
    otp: ""
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state) {
      setForm((prev) => ({
        ...prev,
        ...location.state,
      }));
    }
  }, [location.state]);

  const handleVerify = async () => {
    try {
      const res = await axios.post("/auth/verify-otp", form);
      localStorage.setItem("token", res.data.token);
      toast.success("Signup successful!");
      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      console.error("OTP Verify Error:", err);
      console.error("Error Response Data:", err.response?.data);
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white font-sans px-4">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-6 tracking-wide">🚀 Sign Up</h1>

        <input
          placeholder="Enter Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2 mb-4 bg-white/20 rounded-3xl placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 h-10"
        />

        <input
          placeholder="Enter Unique userId"
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: e.target.value })}
          className="w-full px-4 py-2 mb-4 bg-white/20 rounded-3xl placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 h-10"
        />

        <input
          placeholder="Enter Your Email"
          value={form.email}
          readOnly
          className="w-full px-4 py-2 mb-4 bg-white/20 rounded-3xl text-gray-300 cursor-not-allowed h-10"
        />

        <input
          placeholder="Enter Your Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-4 py-2 mb-4 bg-white/20 rounded-3xl placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 h-10"
        />

        <input
          placeholder="Enter OTP received on Email"
          value={form.otp}
          onChange={(e) => setForm({ ...form, otp: e.target.value })}
          className="w-full px-4 py-2 mb-4 bg-white/20 rounded-3xl placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 h-10"
        />

        <button
          onClick={handleVerify}
          className="w-full py-2 px-4 rounded-full bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 font-medium"
        >
          Complete Signup
        </button>

        <ToastContainer position="top-center" theme="dark" />
      </div>
    </div>
  );
}
