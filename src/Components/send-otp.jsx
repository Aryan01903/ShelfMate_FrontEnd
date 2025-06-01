import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
export default function SendOtp() {
  const [email, setEmail] = useState("");
  
  const navigate=useNavigate();
  const handleSendOtp = async () => {
    try {
      const res = await axios.post("https://shelfmateapi.onrender.com/shelfmate/api/auth/send-otp", {
        email,
      });

      console.log("Response:", res.data);
      toast.success("OTP sent successfully!");
      navigate("/register",{state : {
        email,
        name :"",
        userId : "",
        password : "",
        otp : ""
      }});
    } catch (err) {
      console.error("Send OTP error:", err.response?.data || err.message);
      toast.error("Failed to send OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white font-sans px-4">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-6 tracking-wide">🚀 Email Authentication</h1>
        <input
        type="email"
        value={email}
        placeholder="enter your email"
        onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 mb-4 rouded-lg bg-white/20 rounded-3xl placeholder-gray-300 focus-outline-none focus:ring-2 focus:ring-cyan-400 h-14"/>
        <button onClick={handleSendOtp} className="w-full py-2 px-4 rounded-full bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 font-medium">Send OTP</button>
        <p className="mt-4 text-center text-sm text-gray-300">
        Already have an account?{" "} <Link to="/login" className="text-cyan-500 hover:underline">Login</Link>
        </p>
        <ToastContainer position="top-center" theme="dark"/>
      </div>
    </div>
  );
}
