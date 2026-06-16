import {apiFetch} from "../api/api";

export default async function getIssues() {
  // const response = await fetch("http://localhost:5000/api/issues");
  const response = await apiFetch("/issues");
  if (!response.ok) {
    throw new Error("Failed to fetch issues");
  }
  return response.json();
}
