import {Navigate} from "react-router-dom";
export default function ProtectedRoute({children}){
    const token=localStorage.getItem("token")
    return token?childern:<Navigate to="/signi" replace/>
}