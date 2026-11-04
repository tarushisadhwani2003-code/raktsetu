import { faChevronDown, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import Button from '../../components/ui/Button';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const SECTIONS = [
  {
    title: 'Donating blood',
    items: [
      {
        q: 'Who can donate blood?',
        a: 'Most healthy people between 18 and 65 years old who weigh at least 45 kg can donate. Your haemoglobin should be 12.5 g/dL or more — the blood bank checks this before every donation.',
      },
      {
        q: 'How often can I donate?',
        a: 'Men can donate whole blood every 90 days and women every 120 days. RaktSetu shows you the date you can donate again.',
      },
      {
        q: 'Does donating blood hurt or make me weak?',
        a: 'You feel a short pinch when the needle goes in. Your body replaces the fluid within a day and the red cells over the next few weeks. Rest, eat and drink well after donating.',
      },
      {
        q: 'How long does a donation take?',
        a: 'The donation itself takes about 8–10 minutes. With registration, the health check and rest, plan for about an hour.',
      },
    ],
  },
  {
    title: 'Finding and requesting blood',
    items: [
      {
        q: 'How do I find blood for a patient?',
        a: 'Use Find blood to see which verified blood banks have the group you need. You can call them directly, or create a free account and send a request to the blood bank through RaktSetu.',
      },
      {
        q: 'What happens after I send a request?',
        a: 'The blood bank sees it immediately and can approve or decline it. You can follow every status change on your dashboard. Donors in your city whose blood group matches can also offer to help.',
      },
      {
        q: 'Is the blood free?',
        a: 'RaktSetu is free to use. Blood itself is not sold in India, but blood banks may charge a processing fee set by the government for testing and storage.',
      },
      {
        q: 'Do I need a doctor’s requisition?',
        a: 'Yes. Blood banks issue blood against a requisition form from the treating doctor, along with the patient’s blood sample for cross-matching.',
      },
    ],
  },
  {
    title: 'Privacy and safety',
    items: [
      {
        q: 'Is my phone number shown publicly?',
        a: 'No. Donor details are never listed publicly. A family only sees your name and number after you choose to help with their request.',
      },
      {
        q: 'How are blood banks and hospitals verified?',
        a: 'Facilities register with their licence or registration number. Our team checks it before the facility appears in search results or can receive requests.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Go to Profile & settings in your dashboard and choose “Delete account”. Your personal details are removed straight away.',
      },
    ],
  },
];

export default function Faq() {
  useDocumentTitle('Questions & answers');
  return (
    <div className="pb-20">
      <section className="border-b border-ink-100 bg-white">
        <div className="container-page py-12 sm:py-16">
          <p className="font-semibold text-brand-600">Help centre</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Questions & answers</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-600">
            Everything you might want to know about donating and requesting blood.
          </p>
        </div>
      </section>

      <div className="container-page mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="mb-4 text-xl font-bold">{section.title}</h2>
              <div className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
                {section.items.map((item) => (
                  <details key={item.q} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-ink-900 hover:bg-ink-50/60 [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="shrink-0 text-xs text-ink-400 transition group-open:rotate-180"
                      />
                    </summary>
                    <p className="px-5 pb-5 leading-relaxed text-ink-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-ink-950 p-6 text-ink-300">
            <h2 className="font-bold text-white">Still have a question?</h2>
            <p className="mt-2 text-sm leading-relaxed">Our team is happy to help with anything not covered here.</p>
            <Button as={Link} to="/contact" variant="white" className="mt-5 w-full" icon={faEnvelope}>
              Contact us
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
