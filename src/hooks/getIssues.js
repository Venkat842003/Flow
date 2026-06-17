import {apiFetch} from "../api/api";

export default async function getIssues() {
  const response = await apiFetch("/issues");
  if (!response.ok) {
    throw new Error("Failed to fetch issues");
  }
  return response.json();
}
