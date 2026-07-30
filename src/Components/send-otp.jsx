import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axiosInstance from "./api/axios";

export default function SendOtp() {
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);

  const navigate = useNavigate();
  const handleSendOtp = async () => {
    setLoader(true);
    try {
      const res = await axiosInstance.post("/auth/send-otp", {
        email,
      });

      console.log("Response:", res.data);
      toast.success("OTP sent successfully!");
      navigate("/register", {
        state: {
          email,
          name: "",
          userId: "",
          password: "",
          otp: "",
        },
      });
      setLoader(false);
    } catch (err) {
      console.error("Send OTP error:", err.response?.data || err.message);
      toast.error("User present with this email!");
      setLoader(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F3E9D2] px-4">
      <div className="bg-[#FBF6EC] border border-[#D9C9A3] p-8 sm:p-10 rounded-lg shadow-xl w-full max-w-md relative overflow-hidden">
        {/* Wood spine accent */}
        <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-[#8B5E34] via-[#6F4520] to-[#4A2E15]" />

        <div className="pl-2">
          <p className="text-[#9C7B4A] text-xs tracking-[0.3em] uppercase text-center mb-2">
            New member registration
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#3B2A1A] text-center mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Join the library
          </h1>

          <input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 mb-4 rounded-md border border-[#D9C9A3] bg-white text-[#3B2A1A] placeholder-[#9C8B6A] focus:outline-none focus:ring-2 focus:ring-[#8B5E34]"
          />

          <button
            onClick={handleSendOtp}
            disabled={loader}
            className={`w-full py-3 px-4 rounded-md bg-[#7A2E2E] text-[#F5E9D3] font-semibold hover:bg-[#621F1F] transition-all duration-300 ${
              loader ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loader ? "Sending..." : "Send OTP"}
          </button>

          <p className="mt-5 text-center text-sm text-[#6B5B3E]">
            Already a member?{" "}
            <Link to="/login" className="text-[#7A2E2E] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <ToastContainer position="top-center" theme="dark" />
      </div>
    </div>
  );
}