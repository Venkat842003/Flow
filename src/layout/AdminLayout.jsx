import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import SideBar from "../components/SideBar";

function AdminLayout() {
  const { user } = useOutletContext();

  const context = useOutletContext();

  if (!user) return <Navigate to="/signin" />;

  return (
    <div className="flex flex-col  bg-neutral-800">
      <div className="flex min-h-screen">
        <SideBar />

        <main className="flex-1 text-white p-6">
          <Outlet context={context}/>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
