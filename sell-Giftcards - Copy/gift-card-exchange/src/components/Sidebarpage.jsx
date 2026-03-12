import React, { useState, useEffect, useContext } from 'react';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { IoHome } from "react-icons/io5";
import { CiCreditCard2 } from "react-icons/ci";
import { FaBitcoin } from "react-icons/fa";
import { BiSolidLogOut } from "react-icons/bi";
import { CiCoinInsert } from "react-icons/ci";
import { MdAdminPanelSettings } from "react-icons/md";
import { MdOutlineCardGiftcard } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { GiHamburgerMenu } from 'react-icons/gi';
import { RiAdminFill } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarContext } from './SidebarContext';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import NairaNexus from "../assets/NairaNexus.png";

export const Sidebarpage = ({ isCollapsed, toggleSidebar }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { activeButton, setActiveButton, activePage, setActivePage } = useContext(SidebarContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const handleClick = (index, path, page) => {
    setActiveButton(index);
    setActivePage(page);
    localStorage.setItem("activeButton", index);
    navigate(path);
    setIsMobileOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  useEffect(() => {
    const savedActiveButton = localStorage.getItem("activeButton");
    if (savedActiveButton) {
      setActiveButton(parseInt(savedActiveButton, 10));
    }
  }, [setActiveButton]);

  useEffect(() => {
    switch (location.pathname) {
      case "/dashboard":
        setActiveButton(0);
        setActivePage('dashboard');
        break;
      case "/Admin-Dashboard":
        setActiveButton(0.9);
        setActivePage('admindashboard');
        break;
      case "/submit-gift-card":
        setActiveButton(1);
        setActivePage('giftcard');
        break;
      case "/sell-bitcoin":
        setActiveButton(2);
        setActivePage('sellbitcoin');
        break;
      case "/transactions":
        setActiveButton(3);
        setActivePage('transactions');
        break;
      case "/History":
        setActiveButton(4);
        setActivePage('history');
        break;
      case "/payment-panel":
        setActiveButton(5);
        setActivePage('paymentparnel');
        break;
      case "/Settings":
        setActiveButton(6);
        setActivePage('settings');
        break;
      case "/logout":
        setActiveButton(7);
        setActivePage('logout');
        break;
      default:
        setActiveButton(null);
    }
  }, [location.pathname, setActiveButton, setActivePage]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        }
      }
    };
    fetchUserRole();
  }, []);

  const Logo = ({ className = "" }) => (
    <div className={`font-bold text-[rgb(255,240,120)] ${className}`}>
      <div className="text-2xl"><img src={NairaNexus}  alt="" /></div>
    </div>
  );

  const renderSidebarContent = () => (
    <div
      className='bg-black h-screen z-50 transition-all duration-300 ease-in-out flex flex-col'
      style={{
        width: isMobile
          ? '100vw'
          : isCollapsed
          ? '80px'
          : '200px',
        maxWidth: isMobile ? '100vw' : '200px',
        padding: '0',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Logo Section - Only on Desktop */}
      {!isMobile && (
        <div className={`flex items-center justify-center py-6 px-4 border-b border-gray-700 ${isCollapsed ? 'px-2' : ''}`}>
          {isCollapsed ? (
            <Logo className=" " />
          ) : (
            <Logo className='md:-mt-12 md:-mb-28 md:w-56 md:h-48 ' />
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 ">
        <ul className='flex flex-col items-center justify-start gap-3 list-none md:pt-0 pt-14 p-0 m-0'>
          <li className="w-full flex justify-center">
            <button
              onClick={() => handleClick(0, '/dashboard', 'dashboard')}
              className={`${isCollapsed && !isMobile ? 'w-12 h-12 p-0 justify-center' : 'w-full max-w-[176px] pl-3 h-12'} group hover:bg-[rgb(255,240,120)] hover:border-none transition-all duration-200 ease-in-out flex flex-row items-center gap-2 border rounded-lg ${
                activeButton === 0 ? 'bg-[rgb(255,240,120)] border-none' : 'bg-transparent border-white'
              } ${isCollapsed && !isMobile ? 'border-none' : 'border border-white'}`}
            >
              <IoHome className={`h-6 w-6 ${isCollapsed && !isMobile ? '' : 'flex-shrink-0'} group-hover:text-black ${activeButton === 0 ? 'text-black' : 'text-white'}`} />
              {(!isCollapsed || isMobile) && (
                <p className={`text-sm md:text-base group-hover:text-black ${activeButton === 0 ? 'text-black' : 'text-white'}`}>
                  Dashboard
                </p>
              )}
            </button>
          </li>

          {isAdmin && (
            <li className="w-full flex justify-center">
              <button
                onClick={() => handleClick(0.9, '/Admin-Dashboard', 'admindashboard')}
                className={`${isCollapsed && !isMobile ? 'w-12 h-12 p-0 justify-center' : 'w-full max-w-[176px] pl-3 h-12'} group hover:bg-[rgb(255,240,120)] hover:border-none transition-all duration-200 ease-in-out flex flex-row items-center gap-2 border rounded-lg ${
                  activeButton === 0.9 ? 'bg-[rgb(255,240,120)] border-none' : 'bg-transparent border-white'
                } ${isCollapsed && !isMobile ? 'border-none' : 'border border-white'}`}
              >
                <RiAdminFill className={`h-6 w-6 ${isCollapsed && !isMobile ? '' : 'flex-shrink-0'} group-hover:text-black ${activeButton === 0.9 ? 'text-black' : 'text-white'}`} />
                {(!isCollapsed || isMobile) && (
                  <p className={`text-sm md:text-base group-hover:text-black ${activeButton === 0.9 ? 'text-black' : 'text-white'}`}>
                    Admin Board
                  </p>
                )}
              </button>
            </li>
          )}

          <li className="w-full flex justify-center">
            <button
              onClick={() => handleClick(1, '/submit-gift-card', 'giftcard')}
              className={`${isCollapsed && !isMobile ? 'w-12 h-12 p-0 justify-center' : 'w-full max-w-[176px] pl-3 h-12'} group hover:bg-[rgb(255,240,120)] hover:border-none transition-all duration-200 ease-in-out flex flex-row items-center gap-2 border rounded-lg ${
                activeButton === 1 ? 'bg-[rgb(255,240,120)] border-none' : 'bg-transparent border-white'
              } ${isCollapsed && !isMobile ? 'border-none' : 'border border-white'}`}
            >
              <CiCreditCard2 className={`h-6 w-6 ${isCollapsed && !isMobile ? '' : 'flex-shrink-0'} group-hover:text-black ${activeButton === 1 ? 'text-black' : 'text-white'}`} />
              {(!isCollapsed || isMobile) && (
                <p className={`text-sm md:text-base group-hover:text-black ${activeButton === 1 ? 'text-black' : 'text-white'}`}>
                  Gift Card
                </p>
              )}
            </button>
          </li>

          <li className="w-full flex justify-center">
            <button
              onClick={() => handleClick(2, '/sell-bitcoin', 'sellbitcoin')}
              className={`${isCollapsed && !isMobile ? 'w-12 h-12 p-0 justify-center' : 'w-full max-w-[176px] pl-3 h-12'} group hover:bg-[rgb(255,240,120)] hover:border-none transition-all duration-200 ease-in-out flex flex-row items-center gap-2 border rounded-lg ${
                activeButton === 2 ? 'bg-[rgb(255,240,120)] border-none' : 'bg-transparent border-white'
              } ${isCollapsed && !isMobile ? 'border-none' : 'border border-white'}`}
            >
              <FaBitcoin className={`h-6 w-6 ${isCollapsed && !isMobile ? '' : 'flex-shrink-0'} group-hover:text-black ${activeButton === 2 ? 'text-black' : 'text-white'}`} />
              {(!isCollapsed || isMobile) && (
                <p className={`text-sm md:text-base group-hover:text-black ${activeButton === 2 ? 'text-black' : 'text-white'}`}>
                  Sell Bitcoin
                </p>
              )}
            </button>
          </li>

          <li className="w-full flex justify-center">
            <button
              onClick={() => handleClick(3, '/transactions', 'transactions')}
              className={`${isCollapsed && !isMobile ? 'w-12 h-12 p-0 justify-center' : 'w-full max-w-[176px] pl-3 h-12'} group hover:bg-[rgb(255,240,120)] hover:border-none transition-all duration-200 ease-in-out flex flex-row items-center gap-2 border rounded-lg ${
                activeButton === 3 ? 'bg-[rgb(255,240,120)] border-none' : 'bg-transparent border-white'
              } ${isCollapsed && !isMobile ? 'border-none' : 'border border-white'}`}
            >
              <MdOutlineCardGiftcard className={`h-6 w-6 ${isCollapsed && !isMobile ? '' : 'flex-shrink-0'} group-hover:text-black ${activeButton === 3 ? 'text-black' : 'text-white'}`} />
              {(!isCollapsed || isMobile) && (
                <p className={`text-sm md:text-base group-hover:text-black ${activeButton === 3 ? 'text-black' : 'text-white'}`}>
                  Card History
                </p>
              )}
            </button>
          </li>

          <li className="w-full flex justify-center">
            <button
              onClick={() => handleClick(4, '/History', 'history')}
              className={`${isCollapsed && !isMobile ? 'w-12 h-12 p-0 justify-center' : 'w-full max-w-[176px] pl-3 h-12'} group hover:bg-[rgb(255,240,120)] hover:border-none transition-all duration-200 ease-in-out flex flex-row items-center gap-2 border rounded-lg ${
                activeButton === 4 ? 'bg-[rgb(255,240,120)] border-none' : 'bg-transparent border-white'
              } ${isCollapsed && !isMobile ? 'border-none' : 'border border-white'}`}
            >
              <CiCoinInsert className={`h-6 w-6 ${isCollapsed && !isMobile ? '' : 'flex-shrink-0'} group-hover:text-black ${activeButton === 4 ? 'text-black' : 'text-white'}`} />
              {(!isCollapsed || isMobile) && (
                <p className={`text-sm md:text-base group-hover:text-black ${activeButton === 4 ? 'text-black' : 'text-white'}`}>
                  Bitcoin History
                </p>
              )}
            </button>
          </li>

          {isAdmin && (
            <li className="w-full flex justify-center">
              <button
                onClick={() => handleClick(5, '/payment-panel', 'paymentparnel')}
                className={`${isCollapsed && !isMobile ? 'w-12 h-12 p-0 justify-center' : 'w-full max-w-[176px] pl-3 h-12'} group hover:bg-[rgb(255,240,120)] hover:border-none transition-all duration-200 ease-in-out flex flex-row items-center gap-2 border rounded-lg ${
                  activeButton === 5 ? 'bg-[rgb(255,240,120)] border-none' : 'bg-transparent border-white'
                } ${isCollapsed && !isMobile ? 'border-none' : 'border border-white'}`}
              >
                <MdAdminPanelSettings className={`h-6 w-6 ${isCollapsed && !isMobile ? '' : 'flex-shrink-0'} group-hover:text-black ${activeButton === 5 ? 'text-black' : 'text-white'}`} />
                {(!isCollapsed || isMobile) && (
                  <p className={`text-sm md:text-base group-hover:text-black ${activeButton === 5 ? 'text-black' : 'text-white'}`}>
                    Admin Panel
                  </p>
                )}
              </button>
            </li>
          )}

          <li className="w-full flex justify-center">
            <button
              onClick={() => handleClick(6, '/Settings', 'settings')}
              className={`${isCollapsed && !isMobile ? 'w-12 h-12 p-0 justify-center' : 'w-full max-w-[176px] pl-3 h-12'} group hover:bg-[rgb(255,240,120)] hover:border-none transition-all duration-200 ease-in-out flex flex-row items-center gap-2 border rounded-lg ${
                activeButton === 6 ? 'bg-[rgb(255,240,120)] border-none' : 'bg-transparent border-white'
              } ${isCollapsed && !isMobile ? 'border-none' : 'border border-white'}`}
            >
              <IoSettingsSharp className={`h-6 w-6 ${isCollapsed && !isMobile ? '' : 'flex-shrink-0'} group-hover:text-black ${activeButton === 6 ? 'text-black' : 'text-white'}`} />
              {(!isCollapsed || isMobile) && (
                <p className={`text-sm md:text-base group-hover:text-black ${activeButton === 6 ? 'text-black' : 'text-white'}`}>
                  Settings
                </p>
              )}
            </button>
          </li>

          <li className="w-full flex justify-center">
            <button
              onClick={() => handleClick(7, '/logout', 'logout')}
              className={`${isCollapsed && !isMobile ? 'w-12 h-12 p-0 justify-center' : 'w-full max-w-[176px] pl-3 h-12'} group hover:bg-[rgb(255,240,120)] hover:border-none transition-all duration-200 ease-in-out flex flex-row items-center gap-2 border rounded-lg ${
                activeButton === 7 ? 'bg-[rgb(255,240,120)] border-none' : 'bg-transparent border-white'
              } ${isCollapsed && !isMobile ? 'border-none' : 'border border-white'}`}
            >
              <BiSolidLogOut className={`h-6 w-6 ${isCollapsed && !isMobile ? '' : 'flex-shrink-0'} text-red-700`} />
              {(!isCollapsed || isMobile) && (
                <p className={`text-sm md:text-base group-hover:text-black ${activeButton === 7 ? 'text-black' : 'text-white'}`}>
                  Logout
                </p>
              )}
            </button>
          </li>
        </ul>
      </div>

      {!isMobile && (
        <div className="py-4 border-t border-gray-700 flex justify-center">
          <button
            onClick={toggleSidebar}
            className="bg-transparent text-white p-2 rounded-full hover:bg-gray-800 transition-all duration-200"
          >
            {isCollapsed ? <FaArrowRight className="h-5 w-5" /> : <FaArrowLeft className="h-5 w-5" />}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Menu Bar - Higher z-index to be above sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-black border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <button
          onClick={toggleMobileMenu}
          className="text-white p-2 rounded-md hover:bg-gray-800 transition-all duration-200"
        >
          {isMobileOpen ? <IoMdClose className="h-6 w-6" /> : <GiHamburgerMenu className="h-8 w-8" />}
        </button>
        
        <Logo className="w-52 h-52 -mt-10 -mb-28" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleMobileMenu}
          />
          <div className="fixed top-0 left-0 z-50 md:hidden" style={{ paddingTop: '60px' }}>
            {renderSidebarContent()}
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div className="fixed top-0 left-0 z-30 h-screen">
          {renderSidebarContent()}
        </div>
      </div>
    </>
  );
};

export default Sidebarpage;