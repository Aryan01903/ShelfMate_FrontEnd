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
    otp: "",
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

  const inputClass =
    "w-full px-4 py-3 mb-4 rounded-md border border-[#D9C9A3] bg-white text-[#3B2A1A] placeholder-[#9C8B6A] focus:outline-none focus:ring-2 focus:ring-[#8B5E34]";

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F3E9D2] px-4 py-8">
      <div className="bg-[#FBF6EC] border border-[#D9C9A3] p-8 sm:p-10 rounded-lg shadow-xl w-full max-w-md relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-[#8B5E34] via-[#6F4520] to-[#4A2E15]" />

        <div className="pl-2">
          <p className="text-[#9C7B4A] text-xs tracking-[0.3em] uppercase text-center mb-2">
            Library card registration
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#3B2A1A] text-center mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Complete your profile
          </h1>

          <input
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />

          <input
            placeholder="Unique user ID"
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
            className={inputClass}
          />

          <input
            placeholder="Your email"
            value={form.email}
            readOnly
            className={`${inputClass} bg-[#EFE6D0] text-[#8A7B5F] cursor-not-allowed`}
          />

          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />

          <input
            placeholder="OTP received on email"
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value })}
            className={inputClass}
          />

          <button
            onClick={handleVerify}
            className="w-full py-3 px-4 rounded-md bg-[#4A6B3E] text-white font-semibold hover:bg-[#3A5530] transition-all duration-300"
          >
            Complete registration
          </button>
        </div>
        <ToastContainer position="top-center" theme="dark" />
      </div>
    </div>
  );
}