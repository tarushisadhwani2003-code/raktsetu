import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { BLOOD_GROUPS, COMPATIBLE_DONORS, recipientsFor } from '../../lib/constants';
import { cn } from '../../lib/cn';
import BloodGroupPicker from './BloodGroupPicker';

function GroupList({ title, groups, tone }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <p className="text-sm font-semibold text-ink-500">{title}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {BLOOD_GROUPS.map((group) => {
          const match = groups.includes(group);
          return (
            <li
              key={group}
              className={cn(
                'flex h-10 min-w-12 items-center justify-center rounded-xl px-2 text-sm font-bold',
                match ? tone : 'bg-ink-50 text-ink-300 line-through decoration-ink-300',
              )}
            >
              <span className="sr-only">{match ? 'Compatible: ' : 'Not compatible: '}</span>
              {group}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm text-ink-500">
        {groups.length === 8 ? 'All blood groups' : `${groups.length} of 8 blood groups`}
      </p>
    </div>
  );
}

/** Interactive red-cell compatibility chart. */
export default function CompatibilityExplorer() {
  const [group, setGroup] = useState('O+');
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <div>
        <p className="mb-3 text-sm font-semibold text-ink-700">Choose a blood group</p>
        <BloodGroupPicker value={group} onChange={setGroup} label="Blood group to explore" />
        <p className="mt-4 text-sm leading-relaxed text-ink-500">
          O− donors can give red cells to everyone, and AB+ patients can receive from everyone. Hospitals always
          cross-match blood before a transfusion.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <GroupList title={`${group} can donate to`} groups={recipientsFor(group)} tone="bg-brand-600 text-white" />
        <GroupList title={`${group} can receive from`} groups={COMPATIBLE_DONORS[group]} tone="bg-ink-900 text-white" />
        <p className="flex items-center gap-2 text-sm text-ink-500 sm:col-span-2">
          <FontAwesomeIcon icon={faArrowRightLong} className="text-brand-600" />
          Red-cell compatibility shown. Plasma and platelets follow different rules.
        </p>
      </div>
    </div>
  );
}
