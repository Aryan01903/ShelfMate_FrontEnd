import { Routes, Route, Navigate } from "react-router-dom";
import SendOtp from "./Components/send-otp";
import VerifyOtp from "./Components/verify-otp";
import SignIn from "./Components/signin";
import Home from "./Components/Home";
import ProtectedRoute from "./Components/ProtectedRoute";
import SearchBooks from "./Components/searchBook";

function App(){
  return (
    <div className="App">
      <Routes>
        <Route path="/search" element={<SearchBooks/>}/>
        <Route path="/" element={<Navigate to="/send-otp" />} />
        <Route path="/login" element={<SignIn/>} />
        <Route path="/send-otp" element={<SendOtp/>}/>
        <Route path="/register" element={<VerifyOtp/>} />
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