import { CircleUserRound, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Header({ searchIssue, setSearchIssue, user }) {
  const navigate = useNavigate();

  async function handleLogout() {
    const confirmed = window.confirm("Are you sure you want to Logout");

    if (!confirmed) return;

    const { error } = await supabase.auth.signOut();
    navigate("/");

    if (error) {
      console.error(error.message);
    }
  }

  return (
    <header className="flex justify-between bg-slate-700 text-white items-center p-6">
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
          className="border rounded-3xl border-neutral-400   w-[320px] pl-10 pr-4 py-2"
          placeholder="Search issues"
          onChange={(e) => setSearchIssue(e.target.value)}
        />

        <div className="text-xl font-bold cursor-pointer flex gap-4 items-center">
          <CircleUserRound
            size={42}
            strokeWidth={1}
            onClick={() => navigate("/signin")}
          />
          {user && (
            <LogOut size={33} strokeWidth={1.5} onClick={handleLogout} />
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
