import { useState } from "react";
import axios from "./api/axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const res = await axios.post("/auth/signin", {
        identifier,
        password,
      });

      console.log("API Response:", res);
      console.log("res.data:", res.data);

      if (!res.data?.accessToken) {
        toast.error("No token received. Something is wrong.");
        return;
      }

      localStorage.setItem("token", res.data.accessToken);
      toast.success("Login successful");
      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      console.error("error:", err);
      console.error("error response:", err.response?.data);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white font-sans px-4">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-6 tracking-wide">🔐 Welcome</h1>
        <input
          placeholder="Enter Email or User ID"
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full px-4 py-2 mb-4 bg-white/20 rounded-3xl placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 h-10"
        />
        <input
          type="password"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-4 bg-white/20 rounded-3xl placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 h-10"
        />
        <button
          onClick={handleSignIn}
          className="w-full py-2 px-4 rounded-full bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 font-medium"
        >
          Login
        </button>
        <ToastContainer position="top-center" theme="dark" />
      </div>
    </div>
  );
}
