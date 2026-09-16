// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const isTokenValid = () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
        return false;
    }

    try {
        const payload = JSON.parse(
            atob(token.split(".")[1])
        );

        return payload.exp * 1000 > Date.now();

    } catch {
        return false;
    }
};

const ProtectedRoute = ({ children }) => {

    if (!isTokenValid()) {

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;