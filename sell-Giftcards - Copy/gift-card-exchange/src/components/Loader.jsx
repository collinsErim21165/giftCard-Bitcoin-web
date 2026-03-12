import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-[rgb(255,240,120)]">
      <div className="w-16 h-16 border-4 border-t-4 border-black border-t-[rgb(255,240,120)] rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;