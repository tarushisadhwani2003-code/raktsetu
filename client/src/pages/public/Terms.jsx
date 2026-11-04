import { Link } from 'react-router';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { SITE } from '../../lib/site';
import LegalPage from './LegalPage';

export default function Terms() {
  useDocumentTitle('Terms of use');
  return (
    <LegalPage title="Terms of use" updated="3 November 2026">
      <h2>1. About RaktSetu</h2>
      <p>
        RaktSetu is an online platform that helps donors, patients and their families, hospitals and blood banks find
        each other. RaktSetu does not collect, test, store or supply blood, and does not provide medical advice.
      </p>

      <h2>2. Using the platform</h2>
      <ul>
        <li>You must be at least 18 years old to create an account.</li>
        <li>
          The information you give us must be true and up to date, including your blood group and contact details.
        </li>
        <li>Requests must be for a real patient. Misuse of donor contact details is not allowed.</li>
        <li>Keep your password private. You are responsible for activity on your account.</li>
      </ul>

      <h2>3. Blood banks and hospitals</h2>
      <p>
        Facilities must hold a valid licence or registration. They are responsible for the accuracy of the stock they
        publish and for every medical decision, including donor screening, testing and issuing blood.
      </p>

      <h2>4. Donors</h2>
      <p>
        Offering to help with a request is voluntary and can be withdrawn at any time. Blood donation is always unpaid.
        The blood bank’s medical team decides whether you can donate.
      </p>

      <h2>5. No guarantee</h2>
      <p>
        Stock levels change quickly and depend on the information blood banks provide. Always confirm availability with
        the blood bank. In an emergency, call 108 or 112.
      </p>

      <h2>6. Ending your account</h2>
      <p>
        You can delete your account at any time from your profile. We may suspend accounts that break these terms or put
        others at risk.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about these terms? Write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or use our{' '}
        <Link to="/contact">contact form</Link>.
      </p>
    </LegalPage>
  );
}
