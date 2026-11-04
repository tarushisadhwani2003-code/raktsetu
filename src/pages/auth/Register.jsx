import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDroplet,
  faUser,
  faEnvelope,
  faPhone,
  faLock,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

const Register = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('User');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    alert('Registration form submitted successfully');
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-100 px-4 py-10">

      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg sm:p-10">

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#a61b2b]">
            <FontAwesomeIcon
              icon={faDroplet}
              className="text-3xl text-white"
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Join RaktSetu and help save lives
          </p>
        </div>

        <form onSubmit={handleRegister}>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>

            <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-[#a61b2b]0">
              <FontAwesomeIcon icon={faUser} className="text-gray-400" />

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent px-3 py-3 outline-none"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-[#a61b2b]0">
              <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent px-3 py-3 outline-none"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Phone Number
            </label>

            <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-[#a61b2b]0">
              <FontAwesomeIcon icon={faPhone} className="text-gray-400" />

              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent px-3 py-3 outline-none"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Register As
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none focus:border-[#a61b2b]0"
            >
              <option value="User">User / Blood Seeker</option>
              <option value="Donor">Blood Donor</option>
              <option value="Hospital">Hospital</option>
              <option value="Blood Bank">Blood Bank</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-[#a61b2b]0">
              <FontAwesomeIcon icon={faLock} className="text-gray-400" />

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent px-3 py-3 outline-none"
                minLength={6}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-[#a61b2b]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-[#a61b2b]0">
              <FontAwesomeIcon icon={faLock} className="text-gray-400" />

              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent px-3 py-3 outline-none"
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-500 hover:text-[#a61b2b]"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#a61b2b] py-3 font-semibold text-white transition hover:bg-[#a61b2b]"
          >
            Create Account
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#a61b2b] hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;