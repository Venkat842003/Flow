import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {  useState } from "react";

function AppLayout() {
  const [searchIssue, setSearchIssue] = useState("");


  return (
    <div className="flex flex-col min-h-screen">
      <Header
        searchIssue={searchIssue}
        setSearchIssue={setSearchIssue}
      />
      <main className="flex-1 bg-neutral-800 text-white items-center ">
        <Outlet context={{ searchIssue, setSearchIssue }} />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
