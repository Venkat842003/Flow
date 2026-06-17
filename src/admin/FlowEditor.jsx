import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReactFlow, Background, Controls, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";

import getSteps from "../hooks/getSteps";
import getIssues from "../hooks/getIssues";
import StepEditModal from "../components/StepEditModal";
import Button from "../components/Button";
import Loading from "../components/Loading";
import saveSteps from "../api/savesSteps";
import deleteStep from "../api/deleteStep";
import { apiFetch } from "../api/api";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 90;

function getLayoutedElements(nodes, edges) {
  const dagreGraph = new dagre.graphlib.Graph();

  dagreGraph.setGraph({
    rankdir: "TB",
    nodesep: 80,
    ranksep: 120,
  });

  dagreGraph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const position = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      },
    };
  });
}

function FlowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [steps, setSteps] = useState([]);
  const [issues, setIssues] = useState([]);
  const [issue, setIssue] = useState(null);

  const [selectedStepId, setSelectedStepId] = useState(null);
  const [uploadingStepId, setUploadingStepId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [saveLoading, setSaveLoading] = useState(false);

  const selectedStep = steps.find((s) => s.id === selectedStepId);

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

  const { nodes, edges } = useMemo(() => {
    const stepNodes = steps.map((step) => ({
      id: step.id.toString(),
      data: {
        label: (
          <div className="text-center text-black px-2">
            <div className="font-semibold text-sm">Step {step.order}</div>

            <div className="text-xs mt-1 line-clamp-3">
              {step.instruction || "Untitled Step"}
            </div>

            <div className="mt-2 flex gap-1 justify-center text-[10px]">
              {step.is_start && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                  START
                </span>
              )}

              {step.is_end && (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                  END
                </span>
              )}

              {step.is_question && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  QUESTION
                </span>
              )}
            </div>
          </div>
        ),
      },
      position: { x: 0, y: 0 },
      style: {
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #d4d4d8",
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT,
        padding: "10px",
        cursor: "pointer",
      },
    }));

    const uniqueIssueIds = [
      ...new Set(
        steps
          .filter((step) => step.next_issue_id)
          .map((step) => step.next_issue_id),
      ),
    ];

    const issueNodes = uniqueIssueIds.map((issueId) => {
      const linkedIssue = issues.find((i) => i.id === issueId);

      return {
        id: `issue-${issueId}`,
        data: {
          label: linkedIssue?.description || "External Issue",
        },
        position: { x: 0, y: 0 },
        style: {
          background: "#581c87",
          color: "white",
          borderRadius: "12px",
          border: "1px dashed #c084fc",
          width: NODE_WIDTH,
          padding: "12px",
        },
      };
    });

    const edges = [];

    steps.forEach((step) => {
      if (step.next_step_id) {
        edges.push({
          id: `${step.id}-next`,
          source: step.id.toString(),
          target: step.next_step_id.toString(),
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      }

      if (step.next_step_yes) {
        edges.push({
          id: `${step.id}-yes`,
          source: step.id.toString(),
          target: step.next_step_yes.toString(),
          label: "YES",
          type: "smoothstep",
          animated: true,
          style: {
            stroke: "#22c55e",
            strokeWidth: 2,
          },
          labelStyle: {
            fill: "#22c55e",
            fontWeight: 600,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      }

      if (step.next_step_no) {
        edges.push({
          id: `${step.id}-no`,
          source: step.id.toString(),
          target: step.next_step_no.toString(),
          label: "NO",
          type: "smoothstep",
          animated: true,
          style: {
            stroke: "#ef4444",
            strokeWidth: 2,
          },
          labelStyle: {
            fill: "#ef4444",
            fontWeight: 600,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      }

      if (step.next_issue_id) {
        edges.push({
          id: `${step.id}-issue`,
          source: step.id.toString(),
          target: `issue-${step.next_issue_id}`,
          label: "NO → Issue",
          type: "smoothstep",
          style: {
            stroke: "#a855f7",
            strokeDasharray: "5 5",
          },
          labelStyle: {
            fill: "#a855f7",
            fontWeight: 600,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      }
    });

    const allNodes = [...stepNodes, ...issueNodes];

    const layoutedNodes = getLayoutedElements(allNodes, edges);

    return {
      nodes: layoutedNodes,
      edges,
    };
  }, [steps, issues]);

  function handleUpdate(id, updates) {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, ...updates } : step)),
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
      step_order: steps.length + 1,
      next_step_id: null,
      next_step_yes: null,
      next_step_no: null,
      next_issue_id: null,
    };

    setSteps((prev) => [...prev, newStep]);
    setSelectedStepId(newStep.id);
  }

  function handleCreateNextStep(currentStep, value) {
    const newStep = {
      id: crypto.randomUUID(),
      issue_id: id,
      instruction: "",
      image_url: null,
      is_question: false,
      is_start: false,
      is_end: false,
      step_order: steps.length + 1,
      next_step_id: null,
      next_step_yes: null,
      next_step_no: null,
      next_issue_id: null,
    };

    setSteps((prev) => [...prev, newStep]);

    if (value === "Next step if YES") {
      handleUpdate(currentStep.id, { next_step_yes: newStep.id });
    } else if (value === "Next step if NO") {
      handleUpdate(currentStep.id, { next_step_no: newStep.id });
    } else {
      handleUpdate(currentStep.id, { next_step_id: newStep.id });
    }

    setSelectedStepId(newStep.id);
  }

  async function handleSave(e) {
    e.preventDefault();

    try {
      setSaveLoading(true);
      validateSteps(steps);

      await saveSteps(steps);

      localStorage.removeItem("step-editor-history");
      alert("Saved successfully");
      navigate("/admin/issues");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaveLoading(false);
    }
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
        throw new Error(
          `Step ${step.step_order}: Step instruction is required`,
        );
      }

      if (!step.is_question && !step.next_step_id && !step.is_end) {
        throw new Error(`Step ${step.step_order}: Missing next step`);
      }

      if (step.is_question) {
        if (!step.next_step_yes) {
          throw new Error(`Step ${step.step_order}: Missing YES path`);
        }

        const hasNoStep = !!step.next_step_no;
        const hasNoIssue = !!step.next_issue_id;

        // Both selected
        if (hasNoStep && hasNoIssue) {
          throw new Error(
            `Step ${step.step_order}: NO cannot have both step and issue`,
          );
        }

        //  Neither selected
        if (!hasNoStep && !hasNoIssue) {
          throw new Error(
            `Step ${step.step_order}: NO must go to step or issue`,
          );
        }
      }
    }
  }

  async function handleImageUpload(stepId, file) {
    if (!file) return;
    setUploadingStepId(stepId);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("stepId", stepId);

    const response = await apiFetch("/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log(data);

    handleUpdate(stepId, {
      image_url: data.imageUrl,
      cloudinary_public_id: data.publicId,
    });
    setUploadingStepId(null);
  }

  async function handleDeleteStep(id) {
    const confirmed = window.confirm(
      `Are you sure you want to delete Step: ${steps.find((s) => s.id === id)?.step_order} ?`,
    );
    if (!confirmed) return;
    setLoading(true);

    try {
      await deleteStep(id);
      const remaining = steps.filter((s) => s.id !== id);
      setSteps(remaining);
      if (remaining.length === 0) {
        localStorage.removeItem("step-editor-history");
      }
    } catch (error) {
      console.error("Failed to delete step:", error);
      alert("Failed to delete step. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function onNodeClick(_, node) {
    if (node.id.startsWith("issue-")) return;

    setSelectedStepId(node.id);
  }
  if (loading) return <Loading />;

  return (
    <div className="w-full h-screen relative">
      <div className="flex gap-3 justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Issue description: {issue?.description}
        </h1>
        <div className="flex gap-2 justify-end">
          <Button onClick={handleAddStep}>Add Step</Button>

          <Button onClick={handleSave}>
            {saveLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
      >
        <Background />
        <Controls />
      </ReactFlow>

      {selectedStep && (
        <StepEditModal
          step={selectedStep}
          steps={steps}
          issues={issues}
          handleUpdate={handleUpdate}
          handleDeleteStep={handleDeleteStep}
          handleStartStepChange={handleStartStepChange}
          handleEndStepChange={handleEndStepChange}
          handleImageUpload={handleImageUpload}
          uploadingStepId={uploadingStepId}
          onClose={() => setSelectedStepId(null)}
          handleCreateNextStep={handleCreateNextStep}
          issue_id={id}
        />
      )}
    </div>
  );
}

export default FlowEditor;
