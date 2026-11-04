import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { SITE } from '../../lib/site';
import LegalPage from './LegalPage';

export default function Privacy() {
  useDocumentTitle('Privacy policy');
  return (
    <LegalPage title="Privacy policy" updated="3 November 2026">
      <p>
        Your privacy matters to us, especially because health information is sensitive. This page explains what we
        collect and how we use it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account details: name, email, mobile number, city and password (stored only as a secure hash).</li>
        <li>For donors: blood group, gender, date of birth, weight, last donation date and availability.</li>
        <li>For hospitals and blood banks: facility name, licence number, address and contact details.</li>
        <li>Blood requests: patient name and age, blood group, units, hospital and a contact number.</li>
      </ul>
      <p>We do not ask for Aadhaar numbers or medical reports.</p>

      <h2>How we use it</h2>
      <ul>
        <li>To match blood requests with blood banks and compatible donors in the same city.</li>
        <li>To show blood banks the requests sent to them and let them record donations.</li>
        <li>To keep the platform safe, for example by verifying facilities.</li>
      </ul>

      <h2>Who can see your details</h2>
      <p>
        Donor contact details are never public. When a donor offers to help with a request, the person who made that
        request and the blood bank handling it can see the donor’s name and mobile number. Blood banks can look up a
        registered donor by mobile number or email to record a donation.
      </p>

      <h2>Cookies</h2>
      <p>We use a single, essential cookie to keep you signed in. We do not use advertising or tracking cookies.</p>

      <h2>Your choices</h2>
      <ul>
        <li>Update your details or switch off “Available to donate” from your profile at any time.</li>
        <li>Delete your account from your profile. Your personal details are removed immediately.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        For any privacy question, write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </LegalPage>
  );
}
