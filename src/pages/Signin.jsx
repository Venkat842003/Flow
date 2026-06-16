import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { login } from "../api/auth";
import { isAuthenticated } from "../utils/auth";

// const { user } = useOutletContext();
function Signin() {
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSignin(e, email, password) {
    e.preventDefault();
    setError("");

    try {
      const data = await login(email, password);

      localStorage.setItem("token", data.token);

      navigate("/admin/issues");
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }

  // if (user) return <Navigate to="/admin/issues" />;

  if (isAuthenticated()) {
    return <Navigate to="/admin/issues" />;
  }

  return <AuthForm onSubmit={handleSignin} error={error} />;
}

export default Signin;
