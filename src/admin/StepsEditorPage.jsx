import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import getSteps from "../hooks/getSteps";
import Button from "../components/Button";
import Loading from "../components/Loading";
import getIssues from "../hooks/getIssues";
import { supabase } from "../lib/supabase";

function StepsEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [steps, setSteps] = useState([]);
  const [issues, setIssues] = useState([]);
  const [issue, setIssue] = useState(null);
  const [uploadingStepId, setUploadingStepId] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (steps.length === 0) return;

    const stepHistory = {
      issueId: id,
      steps,
    };
    localStorage.setItem("step-editor-history", JSON.stringify(stepHistory));
  }, [steps, id]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const issueData = await getIssues();
      const current = issueData.find((issue) => issue.id === id);
      setIssues(issueData);
      setIssue(current);

      const savedHistory = localStorage.getItem("step-editor-history");
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setSteps(parsedHistory.steps || []);
        setLoading(false);
        return;
      }

      const stepsData = await getSteps(id);
      setSteps(stepsData || []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  /* Editing step */
  function handleUpdate(id, updates) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  }

  function handleStartStepChange(id) {
    setSteps((prev) => {
      const clickedStep = prev.find((s) => s.id === id);

      if (clickedStep.is_start) {
        return prev.map((s) => (s.id === id ? { ...s, is_start: false } : s));
      }

      return prev.map((s) => ({
        ...s,
        is_start: s.id === id,
      }));
    });
  }

  function handleEndStepChange(id) {
    setSteps((prev) => {
      const clickedStep = prev.find((s) => s.id === id);

      if (clickedStep.is_end) {
        return prev.map((s) => (s.id === id ? { ...s, is_end: false } : s));
      }

      return prev.map((s) => (s.id === id ? { ...s, is_end: true } : s));
    });
  }

  function handleAddStep() {
    const newStep = {
      id: crypto.randomUUID(),
      issue_id: id,
      instruction: "",
      image_url: null,
      is_question: false,
      is_start: false,
      is_end: false,
      order: steps.length + 1,
      next_step_id: null,
      next_step_yes: null,
      next_step_no: null,
      next_issue_id: null,
    };

    setSteps((prev) => [...prev, newStep]);
  }

  async function handleSave(e) {
    e.preventDefault();

    try {
      setSaveLoading(true);
      validateSteps(steps);
      console.log("Saving steps: ", steps);

      const { error } = await supabase.from("steps").upsert(steps);
      if (error) throw error;
      localStorage.removeItem("step-editor-history");
      navigate("/admin/issues");
      alert("Saved successfully");
    } catch (err) {
      console.error(err);
      alert("error: " + (err.message || "Something went wrong"));
    } finally {
      setSaveLoading(false);
    }
  }
  async function handleDeleteStep(id) {
    const confirmed = window.confirm(
      `Are you sure you want to delete Step: ${steps.find((s) => s.id === id)?.order} ?`,
    );
    if (!confirmed) return;
    setLoading(true);

    const { error } = await supabase.from("steps").delete().eq("id", id);
    if (error) {
      console.error(error.message);
      setLoading(false);
      return;
    }

    const remaining = steps.filter((s) => s.id !== id);
    setSteps(remaining);

    // ✅ Clear localStorage immediately if no steps left
    if (remaining.length === 0) {
      localStorage.removeItem("step-editor-history");
    }
    setLoading(false);
  }

  function validateSteps(steps) {
    if (steps.length === 0) {
      throw new Error("Atleast one step is required");
    }
    const startSteps = steps.filter((s) => s.is_start);
    if (startSteps.length !== 1) {
      throw new Error("Exactly one Start step is required");
    }
    const EndSteps = steps.filter((s) => s.is_end);
    if (EndSteps.length < 1) {
      throw new Error("Atleast one End step is required");
    }

    for (const step of steps) {
      if (!step.instruction) {
        throw new Error(`Step ${step.order}: Step instruction is required`);
      }

      if (!step.is_question && !step.next_step_id && !step.is_end) {
        throw new Error(`Step ${step.order}: Missing next step`);
      }

      if (step.is_question) {
        if (!step.next_step_yes) {
          throw new Error(`Step ${step.order}: Missing YES path`);
        }

        const hasNoStep = !!step.next_step_no;
        const hasNoIssue = !!step.next_issue_id;

        // Both selected
        if (hasNoStep && hasNoIssue) {
          throw new Error(
            `Step ${step.order}: NO cannot have both step and issue`,
          );
        }

        //  Neither selected
        if (!hasNoStep && !hasNoIssue) {
          throw new Error(`Step ${step.order}: NO must go to step or issue`);
        }
      }
    }
  }

  async function handleImageUpload(stepId, file) {
    if (!file) return;
    setUploadingStepId(stepId);

    const step = steps.find((s) => s.id === stepId);

    if (step.image_url) {
      const oldPath = decodeURIComponent(step.image_url.split("/").pop());

      const { error } = await supabase.storage
        .from("step-images")
        .remove([oldPath]);

      if (error) {
        console.error(error.message);
      }
    }

    const fileName = `${crypto.randomUUID()}-${file.name}`;

    const { error } = await supabase.storage
      .from("step-images")
      .upload(fileName, file);

    if (error) {
      console.error(error.message);
      return;
    }

    const { data } = await supabase.storage
      .from("step-images")
      .getPublicUrl(fileName);

    handleUpdate(stepId, { image_url: data.publicUrl });
    setUploadingStepId(null);
  }

  if (loading) return <Loading />;

  return (
    <div>
      <form className=" flex flex-col gap-6 ">
        <h1 className="text-2xl font-bold">
          Issue description: {issue?.description}
        </h1>
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex gap-3 bg-neutral-900 rounded-sm w-full p-4"
          >
            <div className="flex  flex-1 flex-col gap-4  ">
              <div className="flex gap-3">
                <h1 className="text-xl font-bold">Step :{step.order}</h1>
                <Button
                  color="red"
                  type="button"
                  onClick={() => handleDeleteStep(step.id)}
                >
                  Delete Step
                </Button>
              </div>
              <input
                type="text"
                value={step.instruction}
                className="border border-neutral-600 rounded-sm p-2 w-full"
                onChange={(e) =>
                  handleUpdate(step.id, { instruction: e.target.value })
                }
              />
              {!step.is_end && (
                <div className="flex gap-2">
                  <label>Is question</label>
                  <input
                    type="checkbox"
                    checked={step.is_question}
                    onChange={(e) =>
                      handleUpdate(step.id, { is_question: e.target.checked })
                    }
                  />
                </div>
              )}
              {!step.is_end && (
                <div className="flex gap-2">
                  <label>Is Start</label>
                  <input
                    type="checkbox"
                    checked={step.is_start}
                    onChange={() => handleStartStepChange(step.id)}
                  />
                </div>
              )}
              {!step.is_start && (
                <div className="flex gap-2">
                  <label>Is End</label>
                  <input
                    type="checkbox"
                    checked={step.is_end}
                    onChange={() => handleEndStepChange(step.id)}
                  />
                </div>
              )}
              {!step.is_question && !step.is_end && (
                <div className="mb-2">
                  <label>Next step:</label>
                  <select
                    onChange={(e) =>
                      handleUpdate(step.id, {
                        next_step_id: e.target.value || null,
                      })
                    }
                    value={step.next_step_id || ""}
                    className="border border-neutral-600 rounded-sm pl-2 pr-6 py-2 mt-2 w-full bg-neutral-800"
                  >
                    <option value="" className="w-full">
                      --Select Next Step--
                    </option>
                    {steps
                      .filter((s) => s.id !== step.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          Step {s.order} - {s.instruction || "Untitled Step"}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Question anser yes or no */}
              {step.is_question && (
                <div>
                  <div className="mb-2">
                    <label>Next step if YES:</label>
                    <select
                      onChange={(e) =>
                        handleUpdate(step.id, {
                          next_step_yes: e.target.value || null,
                        })
                      }
                      value={step.next_step_yes || ""}
                      className="border border-neutral-600 rounded-sm pl-2 pr-6 py-2 mt-2  w-full bg-neutral-800"
                    >
                      <option value="" className="w-full">
                        --Select Next Step--
                      </option>
                      {steps
                        .filter((s) => s.id !== step.id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            Step {s.order} - {s.instruction || "Untitled Step"}
                          </option>
                        ))}
                    </select>
                  </div>
                  {!step.next_issue_id && (
                    <div className="mb-2">
                      <label>Next step if NO:</label>
                      <select
                        onChange={(e) =>
                          handleUpdate(step.id, {
                            next_step_no: e.target.value || null,
                          })
                        }
                        value={step.next_step_no || ""}
                        className="border border-neutral-600 rounded-sm pl-2 pr-6 py-2 mt-2 w-full bg-neutral-800"
                      >
                        <option value="" className="w-full">
                          --Select Next Step--
                        </option>
                        {steps
                          .filter((s) => s.id !== step.id)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              Step {s.order} -{" "}
                              {s.instruction || "Untitled Step"}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  {!step.next_step_no && (
                    <div className="mb-2">
                      <label>Next issue if NO:</label>
                      <select
                        onChange={(e) =>
                          handleUpdate(step.id, {
                            next_issue_id: e.target.value || null,
                          })
                        }
                        value={step.next_issue_id || ""}
                        className="border border-neutral-600 rounded-sm pl-2 pr-6 py-2 mt-2 w-full bg-neutral-800"
                      >
                        <option value="" className="w-full">
                          --Select Next Issue--
                        </option>
                        {issues
                          .filter((issue) => issue.id !== id)
                          .map((issue) => (
                            <option key={issue.id} value={issue.id}>
                              {issue.description}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className=" flex flex-col gap-6 max-w-sm w-full items-center">
              <label className="bg-sky-600 px-4 py-2 rounded-xl cursor-pointer hover:bg-sky-500">
                {step.image_url
                  ? uploadingStepId === step.id
                    ? "Uploading..."
                    : " Change Image"
                  : "Add Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageUpload(step.id, e.target.files[0])
                  }
                  className="hidden"
                  disabled={uploadingStepId === step.id}
                />
              </label>
              {step.image_url && (
                <img
                  src={step.image_url}
                  alt="step"
                  className="w-full max-h-50 object-cover rounded "
                />
              )}
            </div>
          </div>
        ))}
        <div className="flex gap-6 justify-center">
          <Button type="button" onClick={handleAddStep}>
            Add Step
          </Button>
          <Button onClick={handleSave}>
            {saveLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default StepsEditorPage;
