import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import getSteps from "../hooks/getSteps";
import Button from "../components/Button";
import Breadcrumbs from "../components/Breadcrumbs";
import { getIssueById } from "../hooks/getIssueById";
import Loading from "../components/Loading";

function Troubleshooter() {
  const { id } = useParams();
  const location = useLocation();

  const [steps, setSteps] = useState([]);
  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [transitioning, setTransitioning] = useState(false);

  const [currentStep, setCurrentStep] = useState(null);

  const [previousIssue, setPreviousIssue] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!currentStep) return;

    const flowState = {
      issueId: id,
      history,
      currentStep,
      previousIssue,
    };

    localStorage.setItem("flow-state", JSON.stringify(flowState));
  }, [currentStep, history, previousIssue, id]);

  useEffect(() => {
    async function fetchSteps() {
      const steps = await getSteps(id);
      const issue = await getIssueById(id);

      setSteps(steps);
      setIssue(issue);

      const resumeStepId = location.state?.stepId;
      const resumeHistory = location.state?.history;
      const resumePreviousIssue = location.state?.previousIssue;

      if (resumeStepId) {
        const resumeStep = steps.find((s) => s.id === resumeStepId);

        if (resumeStep) {
          setCurrentStep(resumeStep);
          setHistory(resumeHistory || []);
          setPreviousIssue(resumePreviousIssue || null);
          setTransitioning(false);

          return;
        }
      }

      const savedState = localStorage.getItem("flow-state");
      if (savedState) {
        const parsedState = JSON.parse(savedState);

        if (parsedState) {
          setHistory(parsedState.history || []);
          setPreviousIssue(parsedState.previousIssue || null);

          const restoredStep = steps.find(
            (s) => s.id === parsedState.currentStep.id,
          );
          if (restoredStep) {
            setCurrentStep(restoredStep);
            return;
          }
        }
      }

      const firstStep = steps.find((step) => step.is_start);
      setCurrentStep(firstStep);
      setTransitioning(false);
    }
    fetchSteps();
  }, [id, location.state]);

  function getStepById(id) {
    return steps.find((s) => s.id === id);
  }

  /*  const getStepById = useCallback(
    (id) => {
      return steps.find((s) => s.id === id);
    },
    [steps],
  );
 */
  /*  function preloadImage(url) {
      if (!url) return;
      const img = new Image();
      img.src = url;
    } */

  /*  useEffect(() => {
    if (!currentStep) return;
    

    // preload next possible images
    if (currentStep.next_step_id) {
      const next = getStepById(currentStep.next_step_id);
      preloadImage(next?.image_url);
    }
    if (currentStep.next_step_yes) {
      const next = getStepById(currentStep.next_step_yes);
      preloadImage(next?.image_url);
    }
    if (currentStep.next_step_no) {
      const next = getStepById(currentStep.next_step_no);
      preloadImage(next?.image_url);
    }
  }, [currentStep, getStepById]); */

  function handlePrevious() {
    if (history.length === 0) return;

    const prevStep = history[history.length - 1];

    if (prevStep.issueId === id) {
      setCurrentStep(prevStep.step);
      setHistory((prev) => prev.slice(0, -1));
      return;
    }
    setTransitioning(true);

    navigate(`/flow/${prevStep.issueId}`, {
      state: {
        stepId: prevStep.step.id,
        history: history.slice(0, -1),
        previousIssue:
          prevStep.issueId === previousIssue?.issueId ? null : previousIssue,
      },
    });
  }

  function handleNextStep() {
    const nextStep = getStepById(currentStep.next_step_id);
    if (!nextStep) return;
    setHistory((prev) => [...prev, { step: currentStep, issueId: id }]);
    setCurrentStep(nextStep);
  }

  function handleJumpToStep(step, index) {
    const confirmed = window.confirm(
      "Are you sure you want to jump to this step? Your progress after this step will be lost.",
    );
    if (!confirmed) return;

    if (step.issueId === id) {
      setCurrentStep(step.step);
      setHistory(history.slice(0, index));
      return;
    }
    setTransitioning(true);

    navigate(`/flow/${step.issueId}`, {
      state: {
        stepId: step.step.id,
        history: history.slice(0, index),
        previousIssue:
          previousIssue?.issueId === step?.issueId ? null : previousIssue,
      },
    });
  }

  function handleAnswer(answer) {
    if (answer === "yes") {
      const nextStep = getStepById(currentStep.next_step_yes);
      setHistory((prev) => [...prev, { step: currentStep, issueId: id }]);
      setCurrentStep(nextStep);
    }
    if (answer === "no" && !currentStep.next_issue_id) {
      const nextStep = getStepById(currentStep.next_step_no);
      setHistory((prev) => [...prev, { step: currentStep, issueId: id }]);
      setCurrentStep(nextStep);
    }

    if (answer === "no" && currentStep.next_issue_id) {
      setPreviousIssue({ issueId: id, step: currentStep, history: history });
      setHistory((prev) => [...prev, { step: currentStep, issueId: id }]);
      setTransitioning(true);

      navigate(`/flow/${currentStep.next_issue_id}`);
    }
  }

  function handleJumpToPreviousIssue() {
    const confirmed = window.confirm(
      "Are you sure you want to jump back to the previous issue? Your current progress will be lost.",
    );
    if (!confirmed) return;
    setTransitioning(true);

    navigate(`/flow/${previousIssue.issueId}`, {
      state: { stepId: previousIssue.step.id, history: previousIssue.history },
    });
  }

  function handleRestart() {
    const confirmed = window.confirm(
      "Are you sure you want to restart the troubleshooting flow? Your progress and history will be cleared.",
    );
    if (confirmed) {
      localStorage.removeItem("flow-state");

      setHistory([]);
      setPreviousIssue(null);

      const firstStep = steps.find((step) => step.is_start);

      setCurrentStep(firstStep);
    }
  }

  function handleEndFlow() {
    const confirmed = window.confirm(
      "Are you sure you want to end the troubleshooting flow? Your progress and history will be cleared.",
    );
    if (!confirmed) return;
    localStorage.removeItem("flow-state");
    navigate("/");
  }

  if (!currentStep) return <Loading />;

  if (transitioning) return <Loading>Switching issue...</Loading>;

  return (
    <div className=" max-w-9/10 m-auto my-5 p-4">
      <div className="flex justify-center items-center relative mb-5 gap-3">
        <button
          className="absolute text-neutral-300 border-b border-neutral-400 cursor-pointer  left-0"
          onClick={() => navigate("/")}
        >
          ⬅ Back to issue list
        </button>

        <h1 className="text-2xl font-bold ">Issue : {issue?.description}</h1>
        <Button onClick={handleRestart}>Restart</Button>
        <Button onClick={handleEndFlow}>End Flow</Button>
        {previousIssue && (
          <Button onClick={handleJumpToPreviousIssue}>
            Back to Previous Issue
          </Button>
        )}
      </div>
      <div className="border-b border-neutral-600 p-2 mb-5 ">
        <Breadcrumbs
          history={history}
          currentStep={currentStep}
          onJump={handleJumpToStep}
        />
      </div>
      <div className="flex flex-col gap-6 items-center ">
        <div className="flex gap-4 justify-between w-full items-center mb-5">
          <div className="w-28">
            {history.length > 0 ? (
              <Button onClick={handlePrevious} text="md">
                Previous
              </Button>
            ) : (
              <div></div>
            )}
          </div>
          <div className="max-w-7xl rounded-lg bg-neutral-700 p-4 w-full flex justify-center">
            <h1 className="text-xl ">{currentStep.instruction}</h1>
          </div>

          <div className="w-28 ">
            {currentStep.is_question ? (
              <div className="flex gap-1 w-full">
                <Button onClick={() => handleAnswer("yes")} text="md">
                  Yes
                </Button>
                <Button onClick={() => handleAnswer("no")} text="md">
                  No
                </Button>
              </div>
            ) : !currentStep.is_end ? (
              <Button onClick={handleNextStep} text="md">
                Next
              </Button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
        <img
          className="w-full max-w-7xl object-contain  h-auto"
          src={currentStep.image_url}
          alt={currentStep.image_url}
        />
      </div>
    </div>
  );
}

export default Troubleshooter;
