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
}) {
  async function handleNextStepChange(currentStep, value, type) {
    if (value === type) {
      await handleCreateNextStep(currentStep, type);
      return;
    }

    if (type === "Next step if YES") {
      handleUpdate(currentStep.id, {
        next_step_yes: value || null,
      });
    } else if (type === "Next step if NO") {
      handleUpdate(currentStep.id, {
        next_step_no: value || null,
      });
    } else {
      handleUpdate(currentStep.id, {
        next_step_id: value || null,
      });
    }
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
                onClick={() => handleDeleteStep(step.id)}
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

            {/* Question anser yes or no */}
            {step.is_question && (
              <div>
                <StepDropdown
                  step={step}
                  steps={steps}
                  value={step.next_step_yes}
                  handleNextStepChange={handleNextStepChange}
                  type="Next step if YES"
                />
                {!step.next_issue_id && (
                  <StepDropdown
                    step={step}
                    steps={steps}
                    value={step.next_step_no}
                    handleNextStepChange={handleNextStepChange}
                    type="Next step if NO"
                  />
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
                        .filter((issue) => issue.id !== issue_id)
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
                onChange={(e) => handleImageUpload(step.id, e.target.files[0])}
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
