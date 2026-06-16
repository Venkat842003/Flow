import { apiFetch } from "./api";

export default async function getUsers() {
  const response = await apiFetch("/auth/users");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }
  return data;
}
