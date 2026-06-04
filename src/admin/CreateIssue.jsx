import { useState } from "react";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

function CreateIssue() {
  const [newIssue, setNewIssue] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newIssue.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("issues")
      .insert([{ description: newIssue }])
      .select()
      .single();
    setLoading(false);
    if (error) {
      console.error(error.message);
      return;
    }
    navigate(`/admin/issues/${data.id}/floweditor`);
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
    </div>
  );
}

export default CreateIssue;
