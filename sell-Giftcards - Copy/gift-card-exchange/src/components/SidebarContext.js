// SidebarContext.js
import React, { createContext, useState } from "react";

export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [activeButton, setActiveButton] = useState(null);
  const [activePage, setActivePage] = useState('withdrawal');

  return (
    <SidebarContext.Provider value={{ activeButton, setActiveButton, activePage, setActivePage }}>
      {children}
    </SidebarContext.Provider>
  );
};