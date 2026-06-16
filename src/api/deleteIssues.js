import { apiFetch } from "./api";

export default async function deleteIssue(id) {
  const response = await apiFetch(`/issues/${id}`, { method: "DELETE" });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete issue");
  }
  return data;
}
