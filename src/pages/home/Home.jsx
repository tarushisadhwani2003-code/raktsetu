import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDroplet,
  faUsers,
  faBuilding,
  faHospital,
  faFileMedical,
  faHeart,
  faMagnifyingGlass,
  faUser,
  faArrowRight,
  faEnvelope,
  faPhone,
  faLocationDot,
  faHandHoldingHeart,
  faUserPlus,
  faHandshake,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faTwitter,
  faYoutube
} from '@fortawesome/free-brands-svg-icons';

const Home = () => {
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleSearch = () => {
    window.location.href = `/blood-banks?bloodGroup=${encodeURIComponent(bloodGroup)}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-800">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-r from-red-200 via-white to-rose-100">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">

          <div>
            <span className="inline-block rounded-full bg-[#a61b2b] px-4 py-2 text-sm font-semibold text-white">
              Donate Blood • Save Lives
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Every Drop Counts,
              <br />
              Every Life <span className="text-[#a61b2b]">Matters</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              RaktSetu connects blood donors, blood banks, hospitals,
              and people in need. Together, we can build a healthier,
              safer, and stronger community.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/blood-banks"
                className="rounded-lg bg-[#a61b2b] px-6 py-3 font-semibold text-white transition hover:bg-[#a61b2b]"
              >
                <FontAwesomeIcon icon={faDroplet} className="mr-2" />
                Find Blood
              </Link>

              <Link
                to="/register"
                className="rounded-lg border border-[#a61b2b] px-6 py-3 font-semibold text-[#a61b2b] transition hover:bg-red-50"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Become a Donor
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1000&q=80"
              alt="Blood donation"
              className="h-72 w-full rounded-3xl object-cover shadow-xl sm:h-96"
            />

            <div className="absolute -bottom-5 left-4 rounded-xl bg-white p-4 shadow-lg sm:left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#a61b2b] text-white">
                  <FontAwesomeIcon icon={faHeart} className="text-xl" />
                </div>

                <div>
                  <p className="font-bold text-slate-800">Be a Lifesaver</p>
                  <p className="text-sm text-slate-500">Donate blood today</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Impact Statistics */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="mb-10 text-center">
            <p className="font-semibold text-[#a61b2b]">Our Impact</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Together We Make a Difference
            </h2>
            <p className="mt-3 text-slate-600">
              Your support helps us save lives and build a healthier tomorrow.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-[#a61b2b] bg-red-300 p-6 text-center">
              <FontAwesomeIcon icon={faUsers} className="text-3xl text-[#a61b2b]" />
              <h3 className="mt-3 text-3xl font-bold text-[#a61b2b]">1,248</h3>
              <p className="mt-1 text-sm text-slate-600">Registered Donors</p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">
              <FontAwesomeIcon icon={faDroplet} className="text-3xl text-blue-600" />
              <h3 className="mt-3 text-3xl font-bold text-blue-600">56</h3>
              <p className="mt-1 text-sm text-slate-600">Blood Banks</p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
              <FontAwesomeIcon icon={faFileMedical} className="text-3xl text-green-600" />
              <h3 className="mt-3 text-3xl font-bold text-green-600">320</h3>
              <p className="mt-1 text-sm text-slate-600">Blood Requests</p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50 p-6 text-center">
              <FontAwesomeIcon icon={faHeart} className="text-3xl text-purple-600" />
              <h3 className="mt-3 text-3xl font-bold text-purple-600">1,865</h3>
              <p className="mt-1 text-sm text-slate-600">Lives Saved</p>
            </div>

          </div>
        </div>
      </section>

      {/* Find Blood Section */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">

          <div>
            <p className="font-semibold text-[#a61b2b]">Find Blood</p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Need Blood? Find It Here
            </h2>

            <p className="mt-4 max-w-lg leading-7 text-slate-600">
              Select the required blood group to search for available
              blood banks and blood-related services.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

              <button
                type="button"
                onClick={() => setBloodGroup('A+')}
                className={`rounded-lg border py-3 font-bold transition ${
                  bloodGroup === 'A+'
                    ? 'border-[#a61b2b] bg-[#a61b2b] text-white'
                    : 'border-[#a61b2b] bg-white text-[#a61b2b] hover:bg-red-700 hover:text-amber-50'
                }`}
              >
                A+
              </button>

              <button
                type="button"
                onClick={() => setBloodGroup('A-')}
                className={`rounded-lg border py-3 font-bold transition ${
                  bloodGroup === 'A-'
                    ? 'border-[#a61b2b] bg-[#a61b2b] text-white'
                    : 'border-[#a61b2b] bg-white text-[#a61b2b]  hover:bg-red-700 hover:text-amber-50'
                }`}
              >
                A−
              </button>

              <button
                type="button"
                onClick={() => setBloodGroup('B+')}
                className={`rounded-lg border py-3 font-bold transition ${
                  bloodGroup === 'B+'
                    ? 'border-[#a61b2b] bg-[#a61b2b] text-white'
                    : 'border-[#a61b2b] bg-white text-[#a61b2b]  hover:bg-red-700 hover:text-amber-50'
                }`}
              >
                B+
              </button>

              <button
                type="button"
                onClick={() => setBloodGroup('B-')}
                className={`rounded-lg border py-3 font-bold transition ${
                  bloodGroup === 'B-'
                    ? 'border-[#a61b2b] bg-[#a61b2b] text-white'
                    : 'border-[#a61b2b] bg-white text-[#a61b2b]  hover:bg-red-700 hover:text-amber-50'
                }`}
              >
                B−
              </button>

              <button
                type="button"
                onClick={() => setBloodGroup('AB+')}
                className={`rounded-lg border py-3 font-bold transition ${
                  bloodGroup === 'AB+'
                    ? 'border-[#a61b2b] bg-[#a61b2b] text-white'
                    : 'border-[#a61b2b] bg-white text-[#a61b2b]  hover:bg-red-700 hover:text-amber-50'
                }`}
              >
                AB+
              </button>

              <button
                type="button"
                onClick={() => setBloodGroup('AB-')}
                className={`rounded-lg border py-3 font-bold transition ${
                  bloodGroup === 'AB-'
                    ? 'border-[#a61b2b] bg-[#a61b2b] text-white'
                    : 'border-[#a61b2b] bg-white text-[#a61b2b]  hover:bg-red-700 hover:text-amber-50'
                }`}
              >
                AB−
              </button>

              <button
                type="button"
                onClick={() => setBloodGroup('O+')}
                className={`rounded-lg border py-3 font-bold transition ${
                  bloodGroup === 'O+'
                    ? 'border-[#a61b2b] bg-[#a61b2b] text-white'
                    : 'border-[#a61b2b] bg-white text-[#a61b2b]  hover:bg-red-700 hover:text-amber-50'
                }`}
              >
                O+
              </button>

              <button
                type="button"
                onClick={() => setBloodGroup('O-')}
                className={`rounded-lg border py-3 font-bold transition ${
                  bloodGroup === 'O-'
                    ? 'border-[#a61b2b] bg-[#a61b2b] text-white'
                    : 'border-[#a61b2b] bg-white text-[#a61b2b]  hover:bg-red-700 hover:text-amber-50'
                }`}
              >
                O−
              </button>

            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="mt-5 w-full rounded-lg bg-[#a61b2b] py-3 font-semibold text-white transition  hover:bg-red-700 hover:text-amber-50"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
              Search Blood
            </button>
          </div>

          <div className="text-center">
            <img
              src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=80"
              alt="Healthcare professional helping a patient"
              className="mx-auto h-72 w-full max-w-lg rounded-3xl object-cover shadow-lg sm:h-96"
            />
            <p className="mt-4 text-xl font-bold text-[#a61b2b]">
              Give Blood, Give Hope
            </p>
          </div>

        </div>
      </section>

      {/* Services Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="mb-10">
            <p className="font-semibold text-[#a61b2b]">Our Services</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              What We Do
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-slate-600">
              We provide a complete blood donation ecosystem to help people in need.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <FontAwesomeIcon icon={faUsers} className="text-3xl text-[#a61b2b]" />
              <h3 className="mt-5 text-xl font-bold">Find Donors</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Find eligible donors by blood group and location.
              </p>
              <Link to="/blood-banks" className="mt-5 inline-block font-semibold text-[#a61b2b] hover:text-[#a61b2b]">
                Learn More <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <FontAwesomeIcon icon={faBuilding} className="text-3xl text-[#a61b2b]" />
              <h3 className="mt-5 text-xl font-bold">Blood Banks</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Discover registered blood banks and their information.
              </p>
              <Link to="/blood-banks" className="mt-5 inline-block font-semibold text-[#a61b2b] hover:text-[#a61b2b]">
                Learn More <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <FontAwesomeIcon icon={faHospital} className="text-3xl text-[#a61b2b]" />
              <h3 className="mt-5 text-xl font-bold">Hospitals</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Access information about registered hospitals.
              </p>
              <Link to="/hospitals" className="mt-5 inline-block font-semibold text-[#a61b2b] hover:text-[#a61b2b]">
                Learn More <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <FontAwesomeIcon icon={faFileMedical} className="text-3xl text-[#a61b2b]" />
              <h3 className="mt-5 text-xl font-bold">Blood Requests</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Submit and track your blood requests.
              </p>
              <Link to="/my-requests" className="mt-5 inline-block font-semibold text-[#a61b2b] hover:text-[#a61b2b]">
                Learn More <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="mb-10 text-center">
            <p className="font-semibold text-[#a61b2b]">How It Works</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Simple Steps to Save Lives
            </h2>
            <p className="mt-3 text-slate-600">
              Getting blood is easy. Follow these three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

            <div className="rounded-2xl bg-white p-7 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#a61b2b] text-white">
                <FontAwesomeIcon icon={faUserPlus} className="text-2xl" />
              </div>
              <span className="mt-4 inline-block rounded-full bg-[#a61b2b] px-3 py-1 text-sm font-bold text-white">
                Step 1
              </span>
              <h3 className="mt-3 text-xl font-bold">Register / Log In</h3>
              <p className="mt-2 leading-6 text-slate-600">
                Create your account or log in to get started.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#a61b2b] text-white">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-2xl" />
              </div>
              <span className="mt-4 inline-block rounded-full bg-[#a61b2b] px-3 py-1 text-sm font-bold text-white">
                Step 2
              </span>
              <h3 className="mt-3 text-xl font-bold">Search or Request</h3>
              <p className="mt-2 leading-6 text-slate-600">
                Find blood banks or submit a blood request.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#a61b2b] text-white">
                <FontAwesomeIcon icon={faHandshake} className="text-2xl" />
              </div>
              <span className="mt-4 inline-block rounded-full bg-[#a61b2b] px-3 py-1 text-sm font-bold text-white">
                Step 3
              </span>
              <h3 className="mt-3 text-xl font-bold">Connect</h3>
              <p className="mt-2 leading-6 text-slate-600">
                Connect with a registered blood bank or eligible donor.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Become a Donor CTA */}
      <section className="bg-slate-50 px-5 pb-16 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 rounded-2xl bg-linear-to-r from-red-700 to-red-200 0 p-8 text-center text-white shadow-lg sm:p-10 md:flex-row md:text-left">

          <div className="flex items-center gap-5">
            <FontAwesomeIcon icon={faHandHoldingHeart} className="hidden text-5xl sm:block" />

            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Become a Blood Donor
              </h2>
              <p className="mt-2 text-[#eadfe1]">
                Your donation can give someone a second chance at life.
              </p>
            </div>
          </div>

          <Link
            to="/register"
            className="shrink-0 rounded-lg bg-white px-6 py-3 font-bold text-[#a61b2b] transition hover:bg-[#a61b2b] hover:text-white"
          >
            Register as a Donor <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </Link>

        </div>
      </section>


    </div>
  );
};

export default Home;