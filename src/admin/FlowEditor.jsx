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
import LoadingOverlay from "../components/LoadingOverlay";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 90;

function getLayoutedElements(nodes, edges) {
  /////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////

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
            <div className="font-semibold text-sm">Step {step.step_order}</div>

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
        steps.flatMap((step) => {
          if (step.is_question) {
            return (step.options || [])
              .filter((option) => option.next_issue_id)
              .map((option) => option.next_issue_id);
          }

          return step.next_issue_id ? [step.next_issue_id] : [];
        }),
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
      // Normal step
      if (!step.is_question) {
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

        if (step.next_issue_id) {
          edges.push({
            id: `${step.id}-issue`,
            source: step.id.toString(),
            target: `issue-${step.next_issue_id}`,
            label: "Issue",
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

        return;
      }

      // Question step
      (step.options || []).forEach((option) => {
        if (option.next_step_id) {
          edges.push({
            id: `${step.id}-${option.id}`,
            source: step.id.toString(),
            target: option.next_step_id.toString(),
            label: option.label,
            type: "smoothstep",
            animated: true,
            style: {
              strokeWidth: 2,
            },
            labelStyle: {
              fontWeight: 600,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        }

        if (option.next_issue_id) {
          edges.push({
            id: `${step.id}-${option.id}-issue`,
            source: step.id.toString(),
            target: `issue-${option.next_issue_id}`,
            label: option.label,
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
    });

    const allNodes = [...stepNodes, ...issueNodes];

    const layoutedNodes = getLayoutedElements(allNodes, edges);

    return {
      nodes: layoutedNodes,
      edges,
    };
  }, [steps, issues]);

  function handleAddOption(step) {
    const newOption = {
      id: crypto.randomUUID(),
      label: "",
      next_step_id: null,
      next_issue_id: null,
    };

    handleUpdate(step.id, { options: [...step.options, newOption] });
  }

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
      next_issue_id: null,
      cloudinary_public_id: null,
      options: [],
    };

    setSteps((prev) => [...prev, newStep]);
    setSelectedStepId(newStep.id);
  }

  function handleCreateNextStep(currentStep, option = null) {
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
      next_issue_id: null,
      cloudinary_public_id: null,
      options: [],
    };

    setSteps((prev) => [...prev, newStep]);

    if (option) {
      handleUpdate(currentStep.id, {
        options: currentStep.options.map((o) =>
          o.id === option.id ? { ...o, next_step_id: newStep.id || null } : o,
        ),
      });
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
  function validateReachability(steps) {
    const stepMap = new Map(steps.map((step) => [step.id, step]));

    const startStep = steps.find((step) => step.is_start);

    const visited = new Set();

    function dfs(step) {
      if (!step || visited.has(step.id)) return;

      visited.add(step.id);

      if (step.is_question) {
        for (const option of step.options || []) {
          if (option.next_step_id) {
            dfs(stepMap.get(option.next_step_id));
          }
        }
      } else if (step.next_step_id) {
        dfs(stepMap.get(step.next_step_id));
      }
    }

    dfs(startStep);

    const orphanSteps = steps.filter((step) => !visited.has(step.id));

    if (orphanSteps.length) {
      throw new Error(
        `Orphan steps found: ${orphanSteps
          .map((step) => step.step_order)
          .join(", ")}`,
      );
    }
  }

  function validateSteps(steps) {
    if (steps.length === 0) {
      throw new Error("At least one step is required");
    }

    const startSteps = steps.filter((s) => s.is_start);
    if (startSteps.length !== 1) {
      throw new Error("Exactly one Start step is required");
    }

    const endSteps = steps.filter((s) => s.is_end);
    if (endSteps.length < 1) {
      throw new Error("At least one End step is required");
    }

    // All valid step ids
    const stepIds = new Set(steps.map((s) => s.id));

    for (const step of steps) {
      // Instruction
      if (!step.instruction.trim()) {
        throw new Error(
          `Step ${step.step_order}: Step instruction is required`,
        );
      }

      // Normal step validation
      if (!step.is_question && !step.is_end) {
        if (!step.next_step_id) {
          throw new Error(`Step ${step.step_order}: Missing next step`);
        }

        if (!stepIds.has(step.next_step_id)) {
          throw new Error(`Step ${step.step_order}: Next step does not exist`);
        }
      }

      // End step validation
      if (step.is_end && step.next_step_id) {
        throw new Error(
          `Step ${step.step_order}: End step cannot have a next step`,
        );
      }

      // Question step validation
      if (step.is_question) {
        if (!step.options.length) {
          throw new Error(
            `Step ${step.step_order}: At least one option is required`,
          );
        }

        if (step.next_step_id) {
          throw new Error(
            `Step ${step.step_order}: Question steps must use options instead of next_step_id`,
          );
        }

        const labels = new Set();

        for (const option of step.options) {
          // Label
          if (!option.label.trim()) {
            throw new Error(
              `Step ${step.step_order}: Option label is required`,
            );
          }

          const normalizedLabel = option.label.trim().toLowerCase();

          if (labels.has(normalizedLabel)) {
            throw new Error(
              `Step ${step.step_order}: Duplicate option "${option.label}"`,
            );
          }

          labels.add(normalizedLabel);

          const hasStep = !!option.next_step_id;
          const hasIssue = !!option.next_issue_id;

          // Must connect somewhere
          if (!hasStep && !hasIssue) {
            throw new Error(
              `Step ${step.step_order}: Option "${option.label}" must connect to a step or an issue`,
            );
          }

          // Cannot connect to both
          if (hasStep && hasIssue) {
            throw new Error(
              `Step ${step.step_order}: Option "${option.label}" cannot connect to both a step and an issue`,
            );
          }

          // Step must exist
          if (hasStep && !stepIds.has(option.next_step_id)) {
            throw new Error(
              `Step ${step.step_order}: Option "${option.label}" points to a step that does not exist`,
            );
          }
        }
      }
    }
    validateReachability(steps);
  }

  async function handleImageUpload(stepId, file, publicId) {
    if (!file) return;

    try {
      setUploadingStepId(stepId);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("stepId", stepId);
      formData.append("publicId", publicId);

      const response = await apiFetch("/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      handleUpdate(stepId, {
        image_url: data.imageUrl,
        cloudinary_public_id: data.publicId,
      });
    } finally {
      setUploadingStepId(null);
    }
  }

  async function handleDeleteStep(id, publicId) {
    const confirmed = window.confirm(
      `Are you sure you want to delete Step: ${steps.find((s) => s.id === id)?.step_order} ?`,
    );
    if (!confirmed) return;
    setLoading(true);

    try {
      await deleteStep(id, publicId);
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
      <div style={{ height: "100%" }}>
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
      </div>

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
          handleAddOption={handleAddOption}
        />
      )}
      {saveLoading && <LoadingOverlay />}
    </div>
  );
}

export default FlowEditor;
