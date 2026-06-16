import { apiFetch } from "./api";

export default async function deleteStep(stepId) {
  // const response = await fetch(`http://localhost:5000/api/steps/${stepId}`, {
  //   method: "DELETE",
  // });

  const response = await apiFetch(`/steps/${stepId}`, { method: "DELETE" });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete step");
  }
  return data;
}
