import { useEffect, useState } from "react";
import getIssues from "../hooks/getIssues";
import Button from "../components/Button";
import { useNavigate, useOutletContext } from "react-router-dom";
import Loading from "../components/Loading";
import { supabase } from "../lib/supabase";
import useDebounce from "../hooks/useDebounce";
import getSteps from "../hooks/getSteps";
import { Network,  Trash } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]);
  const [optionsOpen, setOptionsOpen] = useState(null);

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

 /*  function handleEditIssue(id) {
    localStorage.removeItem("step-editor-history");
    navigate(`/admin/issues/${id}/steps`);
  }

  function handleContinueEditing(id) {
    navigate(`/admin/issues/${id}/steps`);
  } */
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
      <div className="flex flex-col  border border-neutral-600 min-h-screen rounded-sm ">
        {filteredIssues.map((issue, index) => (
          <div
            className={`flex gap-4 text-lg justify-between pb-3 border-b border-neutral-600  ${index % 2 === 0 ? "bg-neutral-800" : "bg-neutral-700"} items-center p-3 rounded-sm relative`}
            key={issue.id}
          >
            <h1>{issue.description} </h1>{" "}
            <div className="flex items-center gap-3 ">
              {optionsOpen === issue.id && (
                <div className=" flex gap-3 ">
                 {/*  {currentEditingIssue === issue.id && hasChanges ? (
                    <Button
                      onClick={() => handleContinueEditing(issue.id)}
                      color={index % 2 === 0 ? "primary" : "secondary"}
                    >
                      Continue Editing
                    </Button>
                  ) : (
                    <Button
                      color={index % 2 === 0 ? "primary" : "secondary"}
                      hoverColor="hover:bg-sky-600"
                      onClick={() => handleEditIssue(issue.id)}
                    >
                      <Pencil size={16} /> Edit
                    </Button>
                  )} */}
                  {currentEditingIssue === issue.id && hasChanges ? (
                    <Button
                      color={index % 2 === 0 ? "primary" : "secondary"}
                      onClick={() => handleContinueFlowEditing(issue.id)}
                      color="orange"
                    >
                      Continue Flow Editing
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleFlowEdit(issue.id)}
                      color={index % 2 === 0 ? "primary" : "secondary"}
                      hoverColor="hover:bg-fuchsia-800"
                    >
                      <Network size={16} /> Flow-Edit
                    </Button>
                  )}
                  <Button
                    color={index % 2 === 0 ? "primary" : "secondary"}
                    hoverColor="hover:bg-red-600"
                    onClick={() => handleDeleteIssue(issue.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              )}
              <button
                className="cursor-pointer"
                onClick={() =>
                  setOptionsOpen((prev) =>
                    prev ? (prev === issue.id ? null : issue.id) : issue.id,
                  )
                }
              >
                <SlOptionsVertical />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Issues;
