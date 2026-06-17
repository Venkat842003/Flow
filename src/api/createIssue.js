import { apiFetch } from "./api";

export default async function createIssue(description) {
  const response = await apiFetch("/issues", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    throw new Error("Failed to create issue");
  }
  return response.json();
}
