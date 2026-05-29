import { NavLink } from "react-router-dom";
import { Bug, ChevronsLeft, ChevronsRight, LayersPlus, UsersRound } from "lucide-react";
import { useState } from "react";

function SideBar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <aside
      className={`${sidebarOpen ? "w-64 " : "w-16 items-center"} transition-all duration-300 text-white p-2 border-r border-neutral-600 flex flex-col justify-between `}
    >
      <div className="flex flex-col gap-3 ">
        <button
          className={`cursor-pointer px-2 mb-3 ${sidebarOpen && "flex justify-end"}`}
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          {sidebarOpen ? <ChevronsLeft /> : <ChevronsRight />}
        </button>

        <nav className="flex flex-col gap-2 ">
          <NavLink
            className={({ isActive }) =>
              isActive
                ? "bg-neutral-700 p-1 px-2 rounded-md hover:bg-neutral-600 transition"
                : "py-1 px-2 hover:bg-neutral-600 transition rounded-md"
            }
            to="/admin/issues"
          >
            {sidebarOpen ? "Known Issues / Guides" : <Bug />}
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive
                ? "bg-neutral-700 py-1 px-2 rounded-md hover:bg-neutral-600 transition"
                : "py-1 px-2 hover:bg-neutral-600 transition rounded-md"
            }
            to="/admin/create-issue"
          >
            {sidebarOpen ? "Create Issue" : <LayersPlus />}
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive
                ? "bg-neutral-700 py-1 px-2 rounded-md hover:bg-neutral-600 transition"
                : "py-1 px-2 hover:bg-neutral-600 transition rounded-md"
            }
            to="/admin/users"
          >
            {sidebarOpen ? "Users" : <UsersRound />}
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}

export default SideBar;
