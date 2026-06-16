import { apiFetch } from "./api";

export default async function createUser(email, password, role) {
  const response = await apiFetch("/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, role }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create user");
  }
  return data;
}
