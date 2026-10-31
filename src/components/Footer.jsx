
import React from 'react';
import { Link } from 'react-router-dom';
import img from '../assets/logo.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';

import {
  faLocationDot,
  faEnvelope,
  faPhone,
  faHeart,
} from '@fortawesome/free-solid-svg-icons';

function Footer() {
  return (
    <footer className="mt-10 bg-[#101f32] text-white">

      {/* Main Footer */}
      <div className="mx-auto grid grid-cols-1 gap-10 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-12">

        {/* Column 1: Logo and Description */}
        <div>
          <div className="mb-4 flex items-center gap-3">

            <img
              src={img}
              alt="RaktSetu Logo"
              className="h-12 w-9 object-contain"
            />

            <h1 className="text-2xl font-bold">
              RaktSetu
            </h1>

            <span className="ml-2 border-l border-gray-500 pl-3 text-xs">
              Blood Bank
            </span>

          </div>

          <p className="mb-3 text-sm text-gray-300">
            Donate Blood <span className="mx-1">•</span> Save Lives
          </p>

          <p className="mb-5 max-w-xs text-sm leading-6 text-gray-200">
            A reliable platform connecting donors, blood banks and hospitals
            for a healthier tomorrow.
          </p>

          {/* Social Media Icons */}
         {/* Social Media Icons */}
<div className="flex items-center gap-4">

  <Link to="/facebook" aria-label="Facebook">
    <FontAwesomeIcon
      icon={faFacebook}
      className="text-xl hover:text-red-400"
    />
  </Link>

  <Link to="/instagram" aria-label="Instagram">
    <FontAwesomeIcon
      icon={faInstagram}
      className="text-xl hover:text-red-400"
    />
  </Link>

  <Link to="/twitter" aria-label="Twitter">
    <FontAwesomeIcon
      icon={faTwitter}
      className="text-xl hover:text-red-400"
    />
  </Link>

  <Link to="/linkedin" aria-label="LinkedIn">
    <FontAwesomeIcon
      icon={faLinkedin}
      className="text-xl hover:text-red-400"
    />
  </Link>

  <Link to="/youtube" aria-label="YouTube">
    <FontAwesomeIcon
      icon={faYoutube}
      className="text-xl hover:text-red-400"
    />
  </Link>

</div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h2 className="mb-4 text-base font-semibold">
            Quick Links
          </h2>

          <ul className="space-y-3 text-sm text-gray-200">

            <li>
              <Link to="/" className="hover:text-red-400">
                Home
              </Link>
            </li>

            <li>
              <Link to="/about" className="hover:text-red-400">
                About Us
              </Link>
            </li>

            <li>
              <Link to="/blood-banks" className="hover:text-red-400">
                Blood Banks
              </Link>
            </li>

            <li>
              <Link to="/donors" className="hover:text-red-400">
                Donors
              </Link>
            </li>

            <li>
              <Link to="/contact" className="hover:text-red-400">
                Contact
              </Link>
            </li>

          </ul>
        </div>

        {/* Column 3: Support */}
        <div>
          <h2 className="mb-4 text-base font-semibold">
            Support
          </h2>

          <ul className="space-y-3 text-sm text-gray-200">

            <li>
              <Link to="/faq" className="hover:text-red-400">
                Help & FAQ
              </Link>
            </li>

            <li>
              <Link to="/terms" className="hover:text-red-400">
                Terms & Conditions
              </Link>
            </li>

            <li>
              <Link to="/privacy" className="hover:text-red-400">
                Privacy Policy
              </Link>
            </li>

            <li>
              <Link to="/blood-donation-guide" className="hover:text-red-400">
                Blood Donation Guide
              </Link>
            </li>

          </ul>
        </div>

        {/* Column 4: Contact Us */}
        <div>
          <h2 className="mb-4 text-base font-semibold">
            Contact Us
          </h2>

          <ul className="space-y-4 text-sm text-gray-200">

            <li className="flex items-center gap-3">
              <FontAwesomeIcon icon={faLocationDot} className="text-base" />
              <span>Jaipur, Rajasthan</span>
            </li>

            <li className="flex items-center gap-3">
              <FontAwesomeIcon icon={faEnvelope} className="text-base" />
              <a
                href="mailto:support@raktsetu.com"
                className="hover:text-red-400"
              >
                support@raktsetu.com
              </a>
            </li>

            <li className="flex items-center gap-3">
              <FontAwesomeIcon icon={faPhone} className="text-base" />
              <a
                href="tel:+919876543210"
                className="hover:text-red-400"
              >
                +91 98765 43210
              </a>
            </li>

          </ul>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-slate-600">

        <div className="mx-auto flex flex-col gap-3 px-6 py-4 text-xs text-gray-300 sm:flex-row sm:items-center sm:justify-between lg:px-12">

          <p>
            © 2026 RaktSetu. All Rights Reserved.
          </p>

          <p className="flex items-center gap-2">
            Made with
            <FontAwesomeIcon icon={faHeart} className="text-[#a61b2b]0" />
            for a healthier tomorrow
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;
