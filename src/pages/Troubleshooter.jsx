import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import getSteps from "../hooks/getSteps";
import Button from "../components/Button";
import Breadcrumbs from "../components/Breadcrumbs";
import { getIssueById } from "../hooks/getIssueById";

function Troubleshooter() {
  const { id } = useParams();
  const location = useLocation();

  const [steps, setSteps] = useState([]);
  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);

  const [currentStep, setCurrentStep] = useState(null);

  const [previousIssue, setPreviousIssue] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSteps() {
      const steps = await getSteps(id);
      const issue = await getIssueById(id);
      console.log(issue);
      setSteps(steps);
      setIssue(issue);

      setHistory([]);

      const resumeStepId = location.state?.stepId;

      if (resumeStepId) {
        setPreviousIssue(null);
        const resumeStep = steps.find((s) => s.id === resumeStepId);

        if (resumeStep) {
          setCurrentStep(resumeStep);
          return;
        }
      }

      const firstStep = steps.find((step) => step.is_start);
      setCurrentStep(firstStep);
    }
    fetchSteps();
  }, [id, location.state]);

  function getStepById(id) {
    return steps.find((s) => s.id === id);
  }

  function handlePrevious() {
    if (history.length === 0) return;

    const prevStep = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    setCurrentStep(prevStep);
  }

  function handleNextStep() {
    const nextStep = getStepById(currentStep.next_step_id);
    if (!nextStep) return;
    setHistory((prev) => [...prev, currentStep]);
    setCurrentStep(nextStep);
  }

  function handleJumpToStep(index) {
    const selectedStep = history[index];
    setCurrentStep(selectedStep);
    setHistory((prev) => prev.slice(0, index));
  }

  function handleAnswer(answer) {
    if (answer === "yes") {
      const nextStep = getStepById(currentStep.next_step_yes);
      setHistory((prev) => [...prev, currentStep]);
      setCurrentStep(nextStep);
    }
    if (answer === "no" && !currentStep.next_issue_id) {
      const nextStep = getStepById(currentStep.next_step_no);
      setHistory((prev) => [...prev, currentStep]);
      setCurrentStep(nextStep);
    }

    if (answer === "no" && currentStep.next_issue_id) {
      setPreviousIssue({ issueId: id, step: currentStep });
      navigate(`/flow/${currentStep.next_issue_id}`);
    }
  }
  function handleJumpToPreviousIssue() {
    navigate(`/flow/${previousIssue.issueId}`, {
      state: { stepId: previousIssue.step.id },
    });
  }

  if (!currentStep) return <div>Loading...</div>;

  return (
    <div className=" max-w-9/10 m-auto my-5 p-4">
      <div className="flex justify-center items-center relative mb-5 ">
        <button
          className="absolute text-neutral-300 border-b border-neutral-400 cursor-pointer  left-0"
          onClick={() => navigate("/")}
        >
          ⬅ Back to issue list
        </button>

        <h1 className="text-2xl font-bold ">Issue : {issue.description}</h1>
        <div />
      </div>
      <div className="border-b border-neutral-600 p-2 mb-5">
        <Breadcrumbs
          history={history}
          currentStep={currentStep}
          onJump={handleJumpToStep}
        />
      </div>
      <div className="flex flex-col gap-6 items-center ">
        <div className="flex gap-4 justify-center ">
          {previousIssue && (
            <Button onClick={handleJumpToPreviousIssue}>
              Bact to Previous Issue
            </Button>
          )}
          {history.length > 0 && (
            <Button onClick={handlePrevious}>Previous</Button>
          )}
          <h1>{currentStep.instruction}</h1>
          {currentStep.is_question ? (
            <div className="flex gap-4">
              <Button onClick={() => handleAnswer("yes")}>Yes</Button>
              <Button onClick={() => handleAnswer("no")}>No</Button>
            </div>
          ) : (
            <Button onClick={handleNextStep}>Next</Button>
          )}
        </div>
        <img className="w-full max-w-7xl object-contain  h-auto" src={currentStep.image_url} alt={currentStep.image_url} />
      </div>
    </div>
  );
}

export default Troubleshooter;
