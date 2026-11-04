
import React from "react";
import { Link } from "react-router-dom";
import {
  faHeart,
  faUsers,
  faHospital,
  faDroplet,
  faEye,
  faMagnifyingGlass,
  faShieldHeart,
  faUser,
  faHandshake,
  faArrowRight,
  faLocationDot,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const About = () => {
  return (
    <div className="w-full overflow-hidden bg-white text-[#172b40]">

      {/* Hero Section */}
      <section className=" bg-linear-to-r from-red-200 via-white to-rose-100 px-5 py-16 text-center sm:py-20">
        <span className="rounded-full bg-[#a61b2b] px-4 py-1 text-sm font-semibold text-red-100">
          About Us
        </span>

        <h1 className="mt-5 text-3xl font-bold sm:text-5xl">
          About <span className="text-[#a61b2b]">RaktSetu</span>
        </h1>

        <h2 className="mt-3 text-xl font-bold sm:text-2xl">
          Connecting Hearts, Saving Lives
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
          RaktSetu is a platform that connects blood donors, blood banks,
          hospitals and people in need. We believe that every drop of blood
          can make a difference, and together we can build a healthier,
          safer and stronger community.
        </p>

        <div className="mt-5 flex items-center justify-center gap-3 text-[#a61b2b]">
          <span className="h-0.5 w-12 bg-[#a61b2b]"></span>
          <FontAwesomeIcon icon={faHeart} />
          <span className="h-0.5 w-12 bg-[#a61b2b]"></span>
        </div>
      </section>

      {/* Who We Are */}
      <section className="px-5 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">

          <div>
            <span className="rounded-full bg-[#a61b2b] px-3 py-1 text-sm font-semibold text-white">
              Who We Are
            </span>

            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              More Than Just a Platform
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              RaktSetu is designed to help people find blood-related
              services and connect with registered blood banks, hospitals
              and eligible donors. Our goal is to make finding and donating
              blood simple, safe and accessible for everyone.
            </p>
          </div>

          <div className="space-y-6 border-gray-200 md:border-l md:pl-10">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#a61b2b] text-2xl text-white">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div>
                <h3 className="font-bold">Connects Donors</h3>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Brings together willing donors and people in need.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#a61b2b] text-2xl text-white">
                <FontAwesomeIcon icon={faHospital} />
              </div>
              <div>
                <h3 className="font-bold">Supports Hospitals</h3>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Helps hospitals coordinate blood-related requests.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#a61b2b] text-2xl text-white">
                <FontAwesomeIcon icon={faDroplet} />
              </div>
              <div>
                <h3 className="font-bold">Builds Stronger Communities</h3>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Encourages a culture of giving and caring for others.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Mission and Vision */}
      <section className="bg-[#a61b2b]/60 px-5 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="rounded-full bg-[#a61b2b] px-3 py-1 text-sm font-semibold text-white">
              Our Mission and Vision
            </span>

            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              Why We Exist
            </h2>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#a61b2b] bg-white p-7 sm:flex-row sm:p-8">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#a61b2b] text-4xl text-white">
                <FontAwesomeIcon icon={faHeart} />
              </div>

              <div>
                <h3 className="text-xl font-bold">Our Mission</h3>
                <p className="mt-3 leading-7 text-gray-600">
                  To make it easier for people to access blood-related
                  services and support those in need when they need it most.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#a61b2b] bg-white p-7 sm:flex-row sm:p-8">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#a61b2b] text-4xl text-white">
                <FontAwesomeIcon icon={faEye} />
              </div>

              <div>
                <h3 className="text-xl font-bold">Our Vision</h3>
                <p className="mt-3 leading-7 text-gray-600">
                  To build a connected community where access to blood
                  services is faster, easier and more reliable for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose RaktSetu */}
      <section className="px-5 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="rounded-full bg-[#a61b2b] px-3 py-1 text-sm font-semibold text-white">
              Why Choose RaktSetu?
            </span>

            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              What Makes Us Different
            </h2>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl bg-gray-50 p-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#a61b2b] text-2xl text-white">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </div>
              <h3 className="mt-4 font-bold">Easy Search</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Find blood banks and relevant services quickly.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#a61b2b] text-2xl text-white">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3 className="mt-4 font-bold">Community Support</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Connect with potential donors and help others.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#a61b2b] text-2xl text-white">
                <FontAwesomeIcon icon={faHospital} />
              </div>
              <h3 className="mt-4 font-bold">Healthcare Network</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Access hospital and blood bank information in one place.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#a61b2b] text-2xl text-white">
                <FontAwesomeIcon icon={faShieldHeart} />
              </div>
              <h3 className="mt-4 font-bold">Trust and Safety</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Encourages responsible donation and verified information.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#a61b2b]/40 px-5 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="rounded-full bg-[#a61b2b] px-3 py-1 text-sm font-semibold text-white">
              How It Works
            </span>

            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              Simple Steps to Save Lives
            </h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#a61b2b] font-bold text-white">
                1
              </div>
              <div>
                <div className="mb-3 text-2xl text-[#a61b2b]">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <h3 className="font-bold">Register / Log In</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Create your account or log in to get started.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#a61b2b] font-bold text-white">
                2
              </div>
              <div>
                <div className="mb-3 text-2xl text-[#a61b2b]">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </div>
                <h3 className="font-bold">Search or Request</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Find blood groups or submit a blood request.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#a61b2b] font-bold text-white">
                3
              </div>
              <div>
                <div className="mb-3 text-2xl text-[#a61b2b]">
                  <FontAwesomeIcon icon={faHandshake} />
                </div>
                <h3 className="font-bold">Connect</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Connect with a registered blood bank or donor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="px-5 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 rounded-2xl  bg-linear-to-r from-red-300  to-red-300 p-7 text-center text-white sm:flex-row sm:px-10 sm:text-left">
          <div className="flex items-center gap-5">
            <FontAwesomeIcon
              icon={faHeart}
              className="hidden text-5xl text-[#a61b2b] sm:block"
            />
            <div>
              <h2 className="text-2xl font-bold text-red-900">Join Our Mission</h2>
              <p className="mt-2 text-sm leading-6 text-[#a61b2b]">
                Be a part of RaktSetu and help save lives.
                <br />
                Your small step can make a big difference.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="rounded-lg bg-white px-5 py-3 font-semibold text-[#a61b2b] transition hover:bg-red-100"
            >
              Become a Donor
            </Link>

            <Link
              to="/login"
              className="rounded-lg border border-white px-5 py-3 font-semibold transition hover:bg-white hover:text-[#a61b2b]"
            >
              Get Started <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
