import { apiFetch } from "../api/api";

export default async function getSteps(issue_id) {
  const response = await apiFetch(`/steps/${issue_id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch steps");
  }
  return response.json();
}
