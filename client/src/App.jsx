import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout from './components/layout/PublicLayout';
import RequireAuth from './components/routing/RequireAuth';
import RequireRole from './components/routing/RequireRole';
import ScrollToTop from './components/routing/ScrollToTop';
import Home from './pages/public/Home';

// Pages are loaded on demand to keep the first download small.
const FindBlood = lazy(() => import('./pages/public/FindBlood'));
const BloodBankDetail = lazy(() => import('./pages/public/BloodBankDetail'));
const Donate = lazy(() => import('./pages/public/Donate'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Faq = lazy(() => import('./pages/public/Faq'));
const Terms = lazy(() => import('./pages/public/Terms'));
const Privacy = lazy(() => import('./pages/public/Privacy'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const MyRequests = lazy(() => import('./pages/dashboard/requests/MyRequests'));
const NewRequest = lazy(() => import('./pages/dashboard/requests/NewRequest'));
const RequestDetail = lazy(() => import('./pages/dashboard/requests/RequestDetail'));
const MatchingRequests = lazy(() => import('./pages/dashboard/donor/MatchingRequests'));
const DonationHistory = lazy(() => import('./pages/dashboard/donor/DonationHistory'));
const BankRequests = lazy(() => import('./pages/dashboard/bank/BankRequests'));
const Inventory = lazy(() => import('./pages/dashboard/bank/Inventory'));
const BankDonations = lazy(() => import('./pages/dashboard/bank/BankDonations'));
const Users = lazy(() => import('./pages/dashboard/admin/Users'));
const Verifications = lazy(() => import('./pages/dashboard/admin/Verifications'));
const AllRequests = lazy(() => import('./pages/dashboard/admin/AllRequests'));
const Messages = lazy(() => import('./pages/dashboard/admin/Messages'));

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="find-blood" element={<FindBlood />} />
          <Route path="blood-banks/:id" element={<BloodBankDetail />} />
          <Route path="donate" element={<Donate />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<Faq />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          {/* Old links from the first version of the site */}
          <Route path="blood-banks" element={<Navigate to="/find-blood" replace />} />
          <Route path="signup" element={<Navigate to="/register" replace />} />
          <Route path="profile" element={<Navigate to="/dashboard/profile" replace />} />
          <Route path="donor/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
        </Route>

        <Route
          path="dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route element={<RequireRole roles={['seeker', 'hospital', 'bloodbank', 'admin']} />}>
            <Route path="requests/:id" element={<RequestDetail />} />
          </Route>
          <Route element={<RequireRole roles={['seeker', 'hospital']} />}>
            <Route path="requests" element={<MyRequests />} />
            <Route path="requests/new" element={<NewRequest />} />
          </Route>
          <Route element={<RequireRole roles={['donor']} />}>
            <Route path="donor/requests" element={<MatchingRequests />} />
            <Route path="donor/donations" element={<DonationHistory />} />
          </Route>
          <Route element={<RequireRole roles={['bloodbank']} />}>
            <Route path="bank/requests" element={<BankRequests />} />
            <Route path="bank/inventory" element={<Inventory />} />
            <Route path="bank/donations" element={<BankDonations />} />
          </Route>
          <Route element={<RequireRole roles={['admin']} />}>
            <Route path="admin/users" element={<Users />} />
            <Route path="admin/verifications" element={<Verifications />} />
            <Route path="admin/requests" element={<AllRequests />} />
            <Route path="admin/messages" element={<Messages />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
