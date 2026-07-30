import { useState } from "react";
import axios from "./api/axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setLoader(true);
    try {
      const res = await axios.post("/auth/signin", {
        identifier,
        password,
      });

      if (!res.data?.accessToken) {
        toast.error("No token received. Something is wrong.");
        return;
      }

      localStorage.setItem("token", res.data.accessToken);
      toast.success("Login successful");
      navigate("/home");
      setLoader(false);
    } catch (err) {
      console.error("error:", err);
      console.error("error response:", err.response?.data);
      toast.error(err.response?.data?.message || "Login failed");
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3E9D2] px-4">
      <div className="bg-[#FBF6EC] border border-[#D9C9A3] p-8 sm:p-10 rounded-lg shadow-xl w-full max-w-md relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-[#8B5E34] via-[#6F4520] to-[#4A2E15]" />

        <div className="pl-2">
          <p className="text-[#9C7B4A] text-xs tracking-[0.3em] uppercase text-center mb-2">
            Reading room access
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#3B2A1A] text-center mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Welcome back
          </h1>

          <input
            placeholder="Email or user ID"
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3 mb-4 rounded-md border border-[#D9C9A3] bg-white text-[#3B2A1A] placeholder-[#9C8B6A] focus:outline-none focus:ring-2 focus:ring-[#8B5E34]"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 mb-4 rounded-md border border-[#D9C9A3] bg-white text-[#3B2A1A] placeholder-[#9C8B6A] focus:outline-none focus:ring-2 focus:ring-[#8B5E34]"
          />

          <button
            onClick={handleSignIn}
            disabled={loader}
            className={`w-full py-3 px-4 rounded-md bg-[#7A2E2E] text-[#F5E9D3] font-semibold hover:bg-[#621F1F] transition-all duration-300 ${
              loader ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loader ? "Signing in..." : "Sign in"}
          </button>
        </div>
        <ToastContainer position="top-center" theme="dark" />
      </div>
    </div>
  );
}