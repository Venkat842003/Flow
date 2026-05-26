import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import HomePage from "./pages/HomePage";
import Troubleshooter from "./pages/Troubleshooter";
import AdminLayout from "./layout/AdminLayout";
import Issues from "./admin/Issues";
import CreateIssue from "./admin/CreateIssue";
import StepsEditorPage from "./admin/StepsEditorPage";
import Signin from "./pages/Signin";
import Users from "./admin/Users";
import FlowEditor from "./admin/FlowEditor";

function App() {
  return (
    <Routes>
      {/* user */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="flow/:id" element={<Troubleshooter />} />
        <Route path="signin" element={<Signin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Issues />} />
          <Route path="issues" element={<Issues />} />
          <Route path="create-issue" element={<CreateIssue />} />
          <Route path="issues/:id/steps" element={<StepsEditorPage />} />
          <Route path="issues/:id/floweditor" element={<FlowEditor />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Route>

      {/* admin */}
    </Routes>
  );
}

export default App;
