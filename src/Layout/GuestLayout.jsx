import React from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ScrollProgress from "../components/ScrollProgress.jsx";

const GuestLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#181818] text-gray-100 flex flex-col">
      <ScrollProgress />
      <Header />
      <main className="flex-1 overflow-x-hidden max-w-6xl w-full mx-auto px-6 ">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default GuestLayout;
