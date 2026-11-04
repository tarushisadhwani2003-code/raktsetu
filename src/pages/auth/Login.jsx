import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faDroplet } from '@fortawesome/free-solid-svg-icons';

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter your email and password');
      return;
    }

    alert('Login form submitted');
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-100 px-4 py-10">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg sm:p-10">

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#a61b2b]">
            <FontAwesomeIcon
              icon={faDroplet}
              className="text-3xl text-white"
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to your RaktSetu account
          </p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-[#a61b2b]0">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-gray-400"
              />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-0 bg-transparent px-3 py-3 outline-none"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-[#a61b2b]0">
              <FontAwesomeIcon
                icon={faLock}
                className="text-gray-400"
              />

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-0 bg-transparent px-3 py-3 outline-none"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-[#a61b2b]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                />
              </button>
            </div>
          </div>

          <div className="mb-6 flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-[#a61b2b] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#a61b2b] py-3 font-semibold text-white transition hover:bg-[#a61b2b]"
          >
            Login
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-[#a61b2b] hover:underline"
          >
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;