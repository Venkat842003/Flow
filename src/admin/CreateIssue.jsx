import { useState } from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import createIssue from "../api/createIssue";
import LoadingOverlay from "../components/LoadingOverlay";

function CreateIssue() {
  const [newIssue, setNewIssue] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newIssue.trim()) return;
    setLoading(true);
    try {
      const data = await createIssue(newIssue);
      localStorage.removeItem("step-editor-history");
      navigate(`/admin/issues/${data.id}/floweditor`);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className=" flex flex-col gap-5">
      <h1 className="text-3xl font-bold">Create issue</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-7xl items-center"
      >
        <input
          type="text"
          placeholder="Enter issue description..."
          className="border border-neutral-600 rounded-sm p-2 w-full"
          onChange={(e) => setNewIssue(e.target.value)}
        />
        <div>
          <Button>{loading ? "Creating issue..." : "Create Issue"}</Button>
        </div>
      </form>
      {loading && <LoadingOverlay>Creating Issue...</LoadingOverlay>}
    </div>
  );
}

export default CreateIssue;
