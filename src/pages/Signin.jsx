import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Navigate, useNavigate, useOutletContext } from "react-router-dom";
import AuthForm from "../components/AuthForm";

function Signin() {
  const { user } = useOutletContext();

  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSignin(e, email, password) {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log(data);

    if (error) {
      setError(error.message);
      console.error(error.message);
    }
    if (data.user) {
      navigate("/admin");
    }
  }

  

  if (user) return <Navigate to="/admin/issues" />;

  return <AuthForm onSubmit={handleSignin} error={error} />;
}

export default Signin;
