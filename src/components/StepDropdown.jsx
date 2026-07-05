function StepDropdown({ step, steps, handleNextStepChange, type, value }) {
  return (
    <div className="mb-2">
      <label>{type}</label>
      <select
        onChange={(e) => handleNextStepChange(step, e.target.value)}
        value={value || ""}
        className="border border-neutral-600 rounded-sm pl-2 pr-6 py-2 mt-2 w-full bg-neutral-800"
      >
        <option value="" className="w-full">
          --Select Next Step--
        </option>
        <option className="" value="create">Create next step +</option>
        {steps
          .filter((s) => s.id !== step.id)
          .map((s) => (
            <option key={s.id} value={s.id}>
              Step {s.step_order} - {s.instruction || "Untitled Step"}
            </option>
          ))}
      </select>
    </div>
  );
}

export default StepDropdown;
