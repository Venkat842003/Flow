import { apiFetch } from "./api";

export default async function saveSteps(steps) {


  const response = await apiFetch("/steps/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ steps }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save steps");
  }
  return data;
}
