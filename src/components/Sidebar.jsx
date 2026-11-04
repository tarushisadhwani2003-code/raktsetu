
import React from 'react';
import { Link, useLocation} from 'react-router-dom';
import img from '../assets/logo.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faHouse,
  faFileLines,
  faMagnifyingGlass,
  faDroplet,
  faUser,
  faGear,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
  
 
function Sidebar() {
    const location = useLocation();
  return (
    <div className="sticky top-4 h-fit w-64 shrink-0  rounded-xl bg-[#101f32] p-4 text-white ">

      {/* Logo */}
      <Link to="/" className="mb-6 flex items-center gap-3">
        <img
          src={img}
          alt="RaktSetu Logo"
          className="h-12 w-9 object-contain"
        />

        <div>
          <h1 className="text-xl font-bold">RaktSetu</h1>
          <p className="text-xs text-gray-300">Blood Bank</p>
        </div>
      </Link>

      {/* Dashboard */}
      <Link
        to="/dashboard"
        className="mb-2 flex items-center gap-4 rounded-lg  px-4 py-3 text-sm  hover:bg-slate-700"
      >
        <FontAwesomeIcon icon={faHouse} className="text-lg" />
        Dashboard
      </Link>

      {/* My Requests */}
      <Link
        to="/my-requests"
        className="mb-2 flex items-center gap-4 rounded-lg px-4 py-3 text-sm hover:bg-slate-700"
      >
        <FontAwesomeIcon icon={faFileLines} className="text-lg" />
        My Requests
      </Link>

      {/* Find Blood Banks */}
      <Link
        to="/blood-banks"
        className="mb-2 flex items-center gap-4 rounded-lg px-4 py-3 text-sm hover:bg-slate-700"
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg" />
        Find Blood Banks
      </Link>

      {/* Blood Inventory */}
      <Link
        to="/blood-inventory"
        className="mb-2 flex items-center gap-4 rounded-lg px-4 py-3 text-sm hover:bg-slate-700"
      >
        <FontAwesomeIcon icon={faDroplet} className="text-lg" />
        Blood Inventory
      </Link>

      {/* Profile */}
      <Link
        to="/profile"
        className="mb-2 flex items-center gap-4 rounded-lg px-4 py-3 text-sm hover:bg-slate-700"
      >
        <FontAwesomeIcon icon={faUser} className="text-lg" />
        Profile
      </Link>

      {/* Settings */}
      <Link
        to="/settings"
        className="mb-5 flex items-center gap-4 rounded-lg px-4 py-3 text-sm hover:bg-slate-700"
      >
        <FontAwesomeIcon icon={faGear} className="text-lg" />
        Settings
      </Link>

      {/* Logout */}
      <div className="border-t border-slate-700 pt-4">
        <Link
          to="/login"
          className="flex items-center gap-4 rounded-lg px-4 py-3 text-sm hover:bg-slate-700"
        >
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="text-lg"
          />
          Logout
        </Link>
      </div>

    </div>
  );
}

export default Sidebar;
