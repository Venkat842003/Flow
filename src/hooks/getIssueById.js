
import getIssues from "./getIssues";

export async function getIssueById(id) {
  const issues = await getIssues();
  return issues.find((issue) => issue.id === id);
}
