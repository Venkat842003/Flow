import { Navigate, Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Loading from "../components/Loading";

function AppLayout() {
  const [searchIssue, setSearchIssue] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);
      setAuthLoading(false);
    }
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  if (authLoading) return <Loading />;
  if (!user) return <Navigate to="/signin" />;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        searchIssue={searchIssue}
        setSearchIssue={setSearchIssue}
        user={user}
      />
      <main className="flex-1 bg-neutral-800 text-white items-center ">
        <Outlet context={{ searchIssue, setSearchIssue, user }} />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
