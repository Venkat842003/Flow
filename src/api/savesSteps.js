import { apiFetch } from "./api";

export default async function saveSteps(steps) {

  const response = await apiFetch("/steps/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ steps }),
  });
  if (!response.ok) {
    throw new Error("Failed to save steps");
  }
  return response.json();
}
