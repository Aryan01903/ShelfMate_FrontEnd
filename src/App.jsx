import { Routes, Route, Navigate } from "react-router-dom";
import SendOtp from "./Components/send-otp";
import VerifyOtp from "./Components/verify-otp"
import SignIn from "./Components/signin";
import Home from "./Components/Home";
import ProtectedRoute from "./Components/ProtectedRoute";

function App(){
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/send-otp" />} />
        <Route path="/signin" element={<SignIn/>} />
        <Route path="/send-otp" element={<SendOtp/>}/>
        <Route path="/signup" element={
            <ProtectedRoute>
              <VerifyOtp/>
            </ProtectedRoute>
          } />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home/>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App;