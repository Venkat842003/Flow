import { useEffect, useState } from "react";
import getIssues from "../hooks/getIssues";
import Button from "../components/Button";
import { useNavigate, useOutletContext } from "react-router-dom";
import Loading from "../components/Loading";
import { supabase } from "../lib/supabase";
import useDebounce from "../hooks/useDebounce";
import getSteps from "../hooks/getSteps";
import { Network, Pencil, Trash } from "lucide-react";

function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]);

  const { searchIssue } = useOutletContext();

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchIssues() {
      setLoading(true);
      const data = await getIssues();
      setIssues(data);
      const savedHistory = localStorage.getItem("step-editor-history");
      const parsedHistory = savedHistory ? JSON.parse(savedHistory) : null;
      if (parsedHistory) {
        const issueId = parsedHistory.issueId;
        const stepsData = await getSteps(issueId);
        setSteps(stepsData);
      }

      setLoading(false);
    }
    fetchIssues();
  }, []);
  const debouncedSearch = useDebounce(searchIssue);
  const filteredIssues = issues.filter((issue) =>
    issue.description.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  async function handleDeleteIssue(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this issue, This will delete all the steps associated with this step",
    );
    if (!confirmed) return;

    const { error } = await supabase.from("issues").delete().eq("id", id);

    if (error) {
      console.error(error.message);
    } else {
      setIssues((prev) => prev.filter((issue) => issue.id !== id));
      alert("Issue deleted succesfully");
    }
  }

  const savedHistory = localStorage.getItem("step-editor-history");
  const parsedHistory = savedHistory ? JSON.parse(savedHistory) : null;

  const currentEditingIssue = parsedHistory ? parsedHistory.issueId : null;

  const hasChanges =
    parsedHistory &&
    steps.length > 0 &&
    JSON.stringify(parsedHistory.steps) !== JSON.stringify(steps);

  function handleEditIssue(id) {
    localStorage.removeItem("step-editor-history");
    navigate(`/admin/issues/${id}/steps`);
  }

  function handleContinueEditing(id) {
    navigate(`/admin/issues/${id}/steps`);
  }
  function handleFlowEdit(id) {
    localStorage.removeItem("step-editor-history");
    navigate(`/admin/issues/${id}/floweditor`);
  }

  function handleContinueFlowEditing(id) {
    navigate(`/admin/issues/${id}/floweditor`);
  }

  if (loading) return <Loading />;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Issue / Guide list</h1>
      </div>
      {filteredIssues.map((issue) => (
        <div
          className="flex gap-3 justify-between border p-2 rounded-md border-neutral-600 max-w-7xl bg-neutral-900 items-center p-3"
          key={issue.id}
        >
          <h1>{issue.description} </h1>{" "}
          <div className=" flex gap-3">
            {currentEditingIssue === issue.id && hasChanges ? (
              <Button
                onClick={() => handleContinueEditing(issue.id)}
                color="orange"
              >
                Continue Editing
              </Button>
            ) : (
              <Button
                color="primary"
                hoverColor="hover:bg-sky-600"
                onClick={() => handleEditIssue(issue.id)}
              >
                <Pencil size={16} /> Edit
              </Button>
            )}
            {currentEditingIssue === issue.id && hasChanges ? (
              <Button
                onClick={() => handleContinueFlowEditing(issue.id)}
                color="orange"
              >
                Continue Flow Editing
              </Button>
            ) : (
              <Button
                onClick={() => handleFlowEdit(issue.id)}
                color="primary"
                hoverColor="hover:bg-fuchsia-800"
              >
                <Network size={16} /> Flow-Edit
              </Button>
            )}
            <Button
              color="primary"
              hoverColor="hover:bg-red-600"
              onClick={() => handleDeleteIssue(issue.id)}
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Issues;
