import { apiFetch } from "./api";

export default async function deleteStep(stepId, publicId) {
  const response = await apiFetch(`/steps/${stepId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      publicId: publicId,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete step");
  }
  return data;
}
