import { useEffect, useState } from "react";
import Button from "../components/Button";
import AuthForm from "../components/AuthForm";
import createUser from "../api/createUser";
import getUsers from "../api/getUsers";
import Loading from "../components/Loading";

function Users() {
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const users = await getUsers();
      setUsers(users);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  async function loadUsers() {
    const data = await getUsers();
    setUsers(data);
  }

  async function handleSignup(e, email, password, role = "admin") {
    e.preventDefault();
    setError("");

    try {
      await createUser(email, password, role);
      setFormOpen(false);
      await loadUsers();
      alert("User created successfully");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className=" text-2xl font-bold">Users</h1>
      <div className="flex flex-col  border border-neutral-600 rounded-sm ">
        {users.map((user, index) => (
          <div
            className={`flex gap-4 text-lg justify-between pb-3 border-b border-neutral-600  ${index % 2 === 0 ? "bg-neutral-800" : "bg-neutral-700"} items-center p-3 rounded-sm relative`}
            key={user.email}
          >
            <h1>{user.email}</h1>
            <h1>{user.role}</h1>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <Button onClick={() => setFormOpen((prev) => !prev)}>Add user</Button>
      </div>
      {formOpen && (
        <AuthForm mode="signup" onSubmit={handleSignup} error={error} />
      )}
    </div>
  );
}

export default Users;
