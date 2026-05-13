import { useState } from "react";
import Button from "./Button";

function AuthForm({ onSubmit, error, mode = "signin" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-fit my-5">
      <h1 className="font-bold text-2xl">
        {mode === "signin" ? "Sign in" : "Create user"}
      </h1>
      <form
        onSubmit={(e) => onSubmit(e, email, password)}
        className="flex flex-col gap-5 border border-neutral-600 p-4 w-full max-w-md items-center rounded-lg"
      >
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Enter email..."
          className="border border-neutral-600 p-2 w-full rounded-lg"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password..."
          className="border border-neutral-600 p-2 w-full rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <Button>Submit</Button>
        </div>
      </form>
    </div>
  );
}

export default AuthForm;
