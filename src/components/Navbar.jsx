
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import img from '../assets/logo.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faMagnifyingGlass,
  faBell,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="mx-4 mt-4 rounded-lg bg-[#101f32] px-5 py-3 text-white shadow-md sm:mx-6 sm:px-8">

      <div className="flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">

          <img
            src={img}
            alt="RaktSetu Logo"
            className="h-10 w-8 object-contain"
          />

          <h1 className="text-xl font-bold sm:text-2xl">
            RaktSetu
          </h1>

          <span className="ml-2 hidden border-l border-gray-500 pl-3 text-xs sm:block">
            Blood Bank
          </span>

        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-6 lg:flex">

          <Link
            to="/"
            className="px-1 py-2 text-sm hover:text-red-400"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="px-1 py-2 text-sm hover:text-red-400"
          >
            About
          </Link>

          <Link
            to="/blood-banks"
            className="px-1 py-2 text-sm hover:text-red-400"
          >
            Blood Banks
          </Link>

          <Link
            to="/contact"
            className="px-1 py-2 text-sm hover:text-red-400"
          >
            Contact
          </Link>

        </div>

        {/* Right Side Icons */}
        <div className="flex shrink-0 items-center gap-4 sm:gap-5">

          {/* Search Icon */}
          <button
            type="button"
            aria-label="Search"
            className="hover:text-red-400"
          >
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-lg"
            />
          </button>

          {/* Notification Icon */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative hover:text-red-400"
          >
            <FontAwesomeIcon
              icon={faBell}
              className="text-lg"
            />

            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#a61b2b] text-[10px]">
              3
            </span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">

            <button
              type="button"
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2"
              aria-label="Profile menu"
              aria-expanded={showProfile}
            >

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-500 text-sm font-semibold">
                TS
              </span>

              <FontAwesomeIcon
                icon={faChevronDown}
                className="hidden text-xs sm:block"
              />

            </button>

            {/* Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 top-12 z-50 w-40 rounded-lg bg-[#172b40] p-2 shadow-xl">

                <Link
                  to="/profile"
                  onClick={() => setShowProfile(false)}
                  className="block rounded px-3 py-2 text-sm hover:bg-slate-700"
                >
                  My Profile
                </Link>

                <Link
                  to="/login"
                  onClick={() => setShowProfile(false)}
                  className="block rounded px-3 py-2 text-sm hover:bg-slate-700"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setShowProfile(false)}
                  className="block rounded px-3 py-2 text-sm hover:bg-slate-700"
                >
                  Register
                </Link>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Mobile Navigation */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 border-t border-slate-700 pt-3 lg:hidden">

        <Link
          to="/"
          className="text-sm hover:text-red-400"
        >
          Home
        </Link>

        <Link
          to="/about"
          className="text-sm hover:text-red-400"
        >
          About
        </Link>

        <Link
          to="/blood-banks"
          className="text-sm hover:text-red-400"
        >
          Blood Banks
        </Link>

        <Link
          to="/contact"
          className="text-sm hover:text-red-400"
        >
          Contact
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;