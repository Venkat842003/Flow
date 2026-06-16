import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { RiLogoutBoxFill } from "react-icons/ri";
import { isAuthenticated, logout } from "../utils/auth";
function Header({ searchIssue, setSearchIssue }) {
  const navigate = useNavigate();

  function handleLogout() {
    const confirmed = window.confirm("Are you sure you want to Logout");

    if (!confirmed) return;

    logout();
    navigate("/signin");
  }

  return (
    <header className="flex justify-between bg-gray-700 text-white items-center px-6 py-4">
      <h1
        className="font-bold  text-4xl  cursor-pointer"
        onClick={() => navigate("/")}
      >
        Flow
      </h1>
      <div className="flex gap-5 relative ">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 " />
        <input
          value={searchIssue}
          type="text"
          className="border rounded-3xl border-neutral-400    w-[320px] pl-10 pr-4 py-2 text-sm"
          placeholder="Search issues"
          onChange={(e) => setSearchIssue(e.target.value)}
        />

        <div className="text-xl font-bold cursor-pointer flex gap-4 items-center">
          <FaUserCircle size={30} onClick={() => navigate("/signin")} />
          {isAuthenticated() && (
            <RiLogoutBoxFill size={30} onClick={handleLogout} />
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
