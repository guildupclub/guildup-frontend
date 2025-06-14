import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default Loader;
