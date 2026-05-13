import { useState } from "react";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import AuthForm from "../components/AuthForm";

function Users() {
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);

  async function handleSignup(e, email, password) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      console.error(error.message);
    } else {
      alert("User successfully created");
      setFormOpen(false);
    }
  }

  return (
    <div>
      <Button onClick={() => setFormOpen((prev) => !prev)}>Add user</Button>
      {formOpen && (
        <AuthForm mode="signup" onSubmit={handleSignup} error={error} />
      )}
    </div>
  );
}

export default Users;
