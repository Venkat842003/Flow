import { apiFetch } from "./api";

export default async function deleteStep(stepId) {
 

  const response = await apiFetch(`/steps/${stepId}`, { method: "DELETE" });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete step");
  }
  return data;
}
