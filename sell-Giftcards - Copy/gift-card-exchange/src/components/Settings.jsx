import React, { useState } from 'react';
import { Sidebarpage } from './Sidebarpage';
import { IoPersonCircle } from "react-icons/io5";
import { BsBank2 } from "react-icons/bs";
import { FaLock, FaUserLock } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import ProfileInfo from './ProfileInfo';
import AddBankAccount from './AddBankAccount';
import ChangeTransactionPin from './ChangeTransactionPin';
import ChangePassword from './ChangePassword';
import DeleteAccount from './DeleteAccount';

const Settings = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activePage, setActivePage] = useState('withdrawal');
  const [settingsPage, setSettingsPage] = useState('ProfileInfo');

  const renderPage = () => {
    switch (settingsPage) {
      case 'ProfileInfo':
        return <ProfileInfo />;
      case 'AddBankAccount':
        return <AddBankAccount />;
      case 'ChangeTransactionPin':
        return <ChangeTransactionPin />;
      case 'ChangePassword':
        return <ChangePassword />;
      case 'DeleteAccount':
        return <DeleteAccount />;
      default:
        return <ProfileInfo />;
    }
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const buttonBase =
    'flex group items-center justify-start gap-2 p-2 w-full sm:w-56 border rounded-md border-black hover:bg-black transition-all duration-200 ease-in-out delay-75';
  const activeButtonClass = 'bg-black text-white';

  return (
    <div className="flex flex-col lg:flex-row items-start justify-start bg-[rgb(255,240,120)] w-full min-h-screen">
      {/* Sidebar Section */}
      <div className="w-full lg:w-auto flex justify-center lg:justify-start">
        <div className={`${isCollapsed ? 'mr-0 lg:mr-24' : 'mr-0 lg:mr-52'} w-full`}>
          <Sidebarpage
            isCollapsed={isCollapsed}
            toggleSidebar={toggleSidebar}
            setActivePage={setActivePage}
          />
        </div>
      </div>

      {/* Settings Buttons Section */}
      <div className="flex flex-col gap-6 md:pt-0 pt-20 mt-8 lg:mt-12 px-4 lg:px-8 w-full lg:w-auto">
        <h1 className="font-bold text-xl text-center lg:text-left">
          Profile Settings
        </h1>

        <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-md mx-auto lg:mx-0">
          <button
            onClick={() => setSettingsPage('ProfileInfo')}
            className={`${buttonBase} ${
              settingsPage === 'ProfileInfo' ? activeButtonClass : ''
            }`}
          >
            <IoPersonCircle
              size={20}
              className={`${
                settingsPage === 'ProfileInfo'
                  ? 'text-white'
                  : 'group-hover:text-white'
              }`}
            />
            <p
              className={`${
                settingsPage === 'ProfileInfo'
                  ? 'text-white'
                  : 'group-hover:text-white'
              }`}
            >
              Profile Info
            </p>
          </button>

          <button
            onClick={() => setSettingsPage('AddBankAccount')}
            className={`${buttonBase} ${
              settingsPage === 'AddBankAccount' ? activeButtonClass : ''
            }`}
          >
            <BsBank2
              size={20}
              className={`${
                settingsPage === 'AddBankAccount'
                  ? 'text-white'
                  : 'group-hover:text-white'
              }`}
            />
            <p
              className={`${
                settingsPage === 'AddBankAccount'
                  ? 'text-white'
                  : 'group-hover:text-white'
              }`}
            >
              Add Bank Account
            </p>
          </button>

          <button
            onClick={() => setSettingsPage('ChangeTransactionPin')}
            className={`${buttonBase} ${
              settingsPage === 'ChangeTransactionPin' ? activeButtonClass : ''
            }`}
          >
            <FaLock
              size={20}
              className={`${
                settingsPage === 'ChangeTransactionPin'
                  ? 'text-white'
                  : 'group-hover:text-white'
              }`}
            />
            <p
              className={`${
                settingsPage === 'ChangeTransactionPin'
                  ? 'text-white'
                  : 'group-hover:text-white'
              }`}
            >
              Change Transaction Pin
            </p>
          </button>

          <button
            onClick={() => setSettingsPage('ChangePassword')}
            className={`${buttonBase} ${
              settingsPage === 'ChangePassword' ? activeButtonClass : ''
            }`}
          >
            <FaUserLock
              size={20}
              className={`${
                settingsPage === 'ChangePassword'
                  ? 'text-white'
                  : 'group-hover:text-white'
              }`}
            />
            <p
              className={`${
                settingsPage === 'ChangePassword'
                  ? 'text-white'
                  : 'group-hover:text-white'
              }`}
            >
              Change Password
            </p>
          </button>

          <button
            onClick={() => setSettingsPage('DeleteAccount')}
            className={`flex group items-center justify-start gap-2 p-2 w-full sm:w-56 rounded-md ${
              settingsPage === 'DeleteAccount' ? 'bg-red-900' : 'bg-red-600'
            } text-white hover:bg-red-900 transition-all duration-200 ease-in-out delay-75`}
          >
            <MdDeleteForever size={20} className="group-hover:text-white" />
            <p className="group-hover:text-white">Delete Account</p>
          </button>
        </div>
      </div>

      {/* Page Content Section */}
      <div className="w-[90%]  lg:w-[55%] xl:w-[50%] mt-8 lg:mt-12 mb-10 bg-black border border-white/10 rounded-md p-4 sm:p-6 mx-4 ">
        {renderPage()}
      </div>
    </div>
  );
};

export default Settings;