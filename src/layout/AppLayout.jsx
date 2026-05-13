import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AppLayout() {
  const [searchIssue, setSearchIssue] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      console.log(data);
      setUser(data.user);
    }
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );
    console.log(listener);

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header searchIssue={searchIssue} setSearchIssue={setSearchIssue} user={user}/>
      <main className="flex-1 bg-neutral-800 text-white items-center ">
        <Outlet context={{ searchIssue, setSearchIssue, user }} />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
