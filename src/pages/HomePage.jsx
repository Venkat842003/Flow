import { useEffect, useState } from "react";
import getIssues from "../hooks/getIssues";
import Button from "../components/Button";
import { useNavigate, useOutletContext } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";

function HomePage() {
  const { searchIssue } = useOutletContext();

  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchIssues() {
      const issues = await getIssues();
      setData(issues);
    }
    fetchIssues();
  }, []);

  function handleStartFlow(issue_id) {
    navigate(`/flow/${issue_id}`);
  }

  const debouncedSearch = useDebounce(searchIssue);
  const filteredIssues = data.filter((issue) =>
    issue.description.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  if (!data.length) return <div>Loading...</div>;

  if (filteredIssues.length < 1) {
    return <h1 className=" text-center">No issues found !!</h1>;
  }

  return (
    <div className=" flex flex-col gap-6 p-6 border border-neutral-600 min-h-screen rounded-3xl max-w-7xl m-auto my-5">
      {filteredIssues.map((issue) => (
        <div
          className="flex gap-4 text-lg justify-between pb-3 border-b border-neutral-600 "
          key={issue.id}
        >
          <h1>{issue.description}</h1>
          <Button onClick={() => handleStartFlow(issue.id)}> Start</Button>
        </div>
      ))}
    </div>
  );
}

export default HomePage;
