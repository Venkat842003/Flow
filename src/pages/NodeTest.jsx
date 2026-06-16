import { useEffect, useState } from "react";

export default function NodeTest() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/issues")
      .then((res) => res.json())
      .then((data) => {
        setIssues(data);
        console.log(data);
      });
  }, []);

  return (
    <div>
      <h1>Node Test</h1>
      <p>This is a test page for Node.js functionality.</p>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id}>
            <h2>{issue.title}</h2>  
            <p>{issue.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
