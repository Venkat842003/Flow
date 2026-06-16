import { useEffect, useState } from "react";
import getIssues from "../hooks/getIssues";
import Button from "../components/Button";
import { useNavigate, useOutletContext } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";
import Loading from "../components/Loading";

function HomePage() {
  const { searchIssue } = useOutletContext();

  const [data, setData] = useState([]);

  const [test, setTest] = useState("");
  const navigate = useNavigate();

  const savedState = localStorage.getItem("flow-state");
  const parsedState = savedState ? JSON.parse(savedState) : null;
  const activeFlow = parsedState ? parsedState.issueId : null;

  useEffect(() => {
    async function fetchIssues() {
      const issues = await getIssues();
      setData(issues);
    }
    fetchIssues();
  }, []);

  function handleStartFlow(issue_id) {
    localStorage.removeItem("flow-state");
    navigate(`/flow/${issue_id}`);
  }
  function handleContinue(issue_id) {
    navigate(`/flow/${issue_id}`);
  }

  const debouncedSearch = useDebounce(searchIssue);
  const filteredIssues = data.filter((issue) =>
    issue.description.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  if (!data.length) return <Loading />;

  if (filteredIssues.length < 1) {
    return <h1 className=" text-center">No matching issues found.</h1>;
  }

  return (
    <div className=" flex flex-col   border border-neutral-600 min-h-screen rounded-sm max-w-9/10 mx-auto  mt-10  mb-5">
      {filteredIssues.map((issue, index) => (
        <div
          className={`flex gap-4 text-lg justify-between pb-3 border-b border-neutral-600  ${index % 2 === 0 ? "bg-neutral-800" : "bg-neutral-700"} items-center p-3 rounded-sm`}
          key={issue.id}
        >
          <h1>{issue.description}</h1>
          <p>{test}</p>
          {activeFlow === issue.id ? (
            <Button onClick={() => handleContinue(issue.id)} color="orange">
              {" "}
              Continue
            </Button>
          ) : (
            <Button onClick={() => handleStartFlow(issue.id)}> Start</Button>
          )}
        </div>
      ))}
    </div>
  );
}

export default HomePage;
