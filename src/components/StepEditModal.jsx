import { Trash } from "lucide-react";
import Button from "./Button";
import StepDropdown from "./StepDropdown";

function StepEditModal({
  issue_id,
  step,
  steps,
  issues,
  handleUpdate,
  handleDeleteStep,
  handleStartStepChange,
  handleEndStepChange,
  handleImageUpload,
  uploadingStepId,
  handleCreateNextStep,
  onClose,
  handleAddOption,
}) {

  async function handleNextStepChange(currentStep, value, option = null) {
    if (value === "create") {
      await handleCreateNextStep(currentStep, option);
      return;
    }

    if (option) {
      handleUpdate(currentStep.id, {
        options: currentStep.options.map((o) =>
          o.id === option.id ? { ...o, next_step_id: value || null } : o,
        ),
      });
    } else {
      handleUpdate(currentStep.id, {
        next_step_id: value || null,
      });
    }
  }

  function handleDeleteOption(stepId, optionId) {
    const confirm = window.confirm(
      "Are you sure you want to delete this option?",
    );
    if (!confirm) return;

    const step = steps.find((s) => s.id === stepId);

    handleUpdate(stepId, {
      options: step.options.filter((o) => o.id !== optionId),
    });
  }

  return (
    <div className=" fixed inset-0 z-50 bg-black/50 ">
      <div
        className="max-w-3xl mx-auto mt-10 bg-neutral-800 rounded-lg p-4 overflow-y-auto max-h-[90vh] shadow-lg shadow-neutral-900 border border-neutral-700"
        onClick={(e) => e.stopPropagation()} // ← prevent clicks inside closing modal
      >
        <div className=" flex justify-end">
          <Button color="sky" type="button" onClick={onClose}>
            Done
          </Button>
        </div>
        <div
          key={step.id}
          className="flex gap-3 rounded-sm  p-4   items-center justify-center  "
        >
          <div className="flex  flex-1 flex-col gap-4  ">
            <div className="flex gap-3">
              <h1 className="text-xl font-bold">Step :{step.step_order}</h1>
              <Button
                color="red"
                type="button"
                onClick={() =>
                  handleDeleteStep(step.id, step.cloudinary_public_id)
                }
              >
                Delete Step
              </Button>
            </div>
            <textarea
              rows={4}
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
              <StepDropdown
                step={step}
                steps={steps}
                value={step.next_step_id}
                handleNextStepChange={handleNextStepChange}
                type="Next step"
              />
            )}

            {/* ///////////////////////////////////////OPTIONS///////////////////////////////
             */}

            {step.is_question && (
              <div className=" flex flex-col gap-3">
                {step.options.map((option, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div className=" flex gap-3">
                      <label> {`Option ${index + 1} :`}</label>
                      <Button
                        color="red"
                        onClick={() => handleDeleteOption(step.id, option.id)}
                      >
                        <Trash size={15} />
                      </Button>
                    </div>
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) =>
                        handleUpdate(step.id, {
                          options: step.options.map((o) =>
                            o.id === option.id
                              ? { ...o, label: e.target.value }
                              : o,
                          ),
                        })
                      }
                      className="border border-neutral-600 rounded-sm p-2 w-full"
                    />
                    <select
                      onChange={(e) =>
                        handleNextStepChange(step, e.target.value, option)
                      }
                      value={option.next_step_id || ""}
                      className="border border-neutral-600 rounded-sm pl-2 pr-6 py-2 mt-2 w-full bg-neutral-800"
                    >
                      <option value="">--Select Next Step--</option>
                      <option value="create">Create next step +</option>
                      {steps
                        .filter((s) => s.id !== step.id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            Step {s.step_order} -{" "}
                            {s.instruction || "Untitled Step"}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
                <Button onClick={() => handleAddOption(step)}>
                  Add Option
                </Button>
              </div>
            )}
          </div>

          <div className=" flex flex-col gap-6  items-center max-w-sm w-full">
            <label className="bg-sky-600 px-4 py-2 rounded-xl cursor-pointer hover:bg-sky-500">
              {uploadingStepId === step.id
                ? "Uploading..."
                : step.image_url
                  ? "Change image"
                  : "Add image"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageUpload(
                    step.id,
                    e.target.files[0],
                    step.cloudinary_public_id,
                  )
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
      </div>
    </div>
  );
}

export default StepEditModal;
