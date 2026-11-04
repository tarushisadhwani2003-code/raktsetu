import mongoose from 'mongoose';
import { BloodRequest, ContactMessage, Counter, Donation, Facility, StockMovement, User } from '../models/index.js';
import { emptyInventory } from '../utils/constants.js';
import { DEMO_PASSWORD } from './demoAccounts.js';

/*
 * Sample data for demos and development. All people, phone numbers and
 * facilities below are fictional. Dates are relative to "now" so the demo always looks current.
 */

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days, hour = 11) => {
  const date = new Date(Date.now() - days * DAY);
  date.setHours(hour, (days * 7) % 60, 0, 0);
  return date;
};
const daysAhead = (days) => new Date(Date.now() + days * DAY);
const yearsAgo = (years, days = 0) => new Date(Date.now() - (years * 365.25 + days) * DAY);
const id = () => new mongoose.Types.ObjectId();

const inventory = (values) => ({ ...emptyInventory(), ...values });

const BANKS = [
  {
    key: 'pinkCity',
    owner: { name: 'Dr. Meera Saxena', email: 'bloodbank@raktsetu.test', phone: '9811000001' },
    name: 'Pink City Blood Centre',
    licenseNumber: 'RJ/BB/2019/0142',
    address: '12 Tonk Road, near Gandhi Nagar Station',
    city: 'Jaipur',
    pincode: '302015',
    phone: '0141-2700101',
    openingHours: 'Open 24 hours',
    status: 'verified',
    stock: { 'A+': 24, 'A-': 6, 'B+': 31, 'B-': 3, 'AB+': 12, 'AB-': 2, 'O+': 38, 'O-': 7 },
  },
  {
    key: 'aravali',
    owner: { name: 'Kunal Bhatia', email: 'aravali.bank@raktsetu.test', phone: '9811000002' },
    name: 'Aravali Community Blood Bank',
    licenseNumber: 'RJ/BB/2016/0087',
    address: 'Plot 45, Sector 3, Malviya Nagar',
    city: 'Jaipur',
    pincode: '302017',
    phone: '0141-2522044',
    openingHours: '8 AM – 8 PM, all days',
    status: 'verified',
    stock: { 'A+': 15, 'A-': 0, 'B+': 18, 'B-': 2, 'AB+': 6, 'AB-': 0, 'O+': 22, 'O-': 4 },
  },
  {
    key: 'marwar',
    owner: { name: 'Sunita Choudhary', email: 'marwar.bank@raktsetu.test', phone: '9811000003' },
    name: 'Marwar Lifeline Blood Bank',
    licenseNumber: 'RJ/BB/2018/0110',
    address: 'Residency Road, Sardarpura',
    city: 'Jodhpur',
    pincode: '342003',
    phone: '0291-2611290',
    openingHours: 'Open 24 hours',
    status: 'verified',
    stock: { 'A+': 19, 'A-': 3, 'B+': 26, 'B-': 1, 'AB+': 8, 'AB-': 1, 'O+': 30, 'O-': 5 },
  },
  {
    key: 'lakeCity',
    owner: { name: 'Harsh Vyas', email: 'lakecity.bank@raktsetu.test', phone: '9811000004' },
    name: 'Lake City Blood Centre',
    licenseNumber: 'RJ/BB/2020/0165',
    address: 'Hospital Road, near Chetak Circle',
    city: 'Udaipur',
    pincode: '313001',
    phone: '0294-2413377',
    openingHours: '9 AM – 9 PM, Monday to Saturday',
    status: 'verified',
    stock: { 'A+': 11, 'A-': 2, 'B+': 14, 'B-': 0, 'AB+': 5, 'AB-': 1, 'O+': 17, 'O-': 0 },
  },
  {
    key: 'chambal',
    owner: { name: 'Ritu Hada', email: 'chambal.bank@raktsetu.test', phone: '9811000005' },
    name: 'Chambal Valley Blood Bank',
    licenseNumber: 'RJ/BB/2024/0231',
    address: 'Station Road, Nayapura',
    city: 'Kota',
    pincode: '324001',
    phone: '0744-2450060',
    openingHours: 'Open 24 hours',
    status: 'pending',
    stock: {},
  },
];

const HOSPITALS = [
  {
    key: 'sanjeevani',
    owner: { name: 'Rohit Mehra', email: 'hospital@raktsetu.test', phone: '9822000001' },
    name: 'Sanjeevani Multispeciality Hospital',
    licenseNumber: 'RJ/HOSP/2015/3301',
    address: '88 JLN Marg, near Jawahar Circle',
    city: 'Jaipur',
    pincode: '302017',
    phone: '0141-2988800',
    status: 'verified',
  },
  {
    key: 'shanti',
    owner: { name: 'Anjali Purohit', email: 'shanti.hospital@raktsetu.test', phone: '9822000002' },
    name: 'Shanti Care Hospital',
    licenseNumber: 'RJ/HOSP/2017/2210',
    address: 'Paota C Road',
    city: 'Jodhpur',
    pincode: '342006',
    phone: '0291-2555123',
    status: 'verified',
  },
  {
    key: 'kotaHeart',
    owner: { name: 'Vivek Nagar', email: 'kotaheart@raktsetu.test', phone: '9822000003' },
    name: 'Kota Heart & Trauma Centre',
    licenseNumber: 'RJ/HOSP/2025/4102',
    address: 'Gumanpura Main Road',
    city: 'Kota',
    pincode: '324007',
    phone: '0744-2390900',
    status: 'pending',
  },
];

// [name, email prefix, group, gender, age, city, days since last donation (null = never), available]
const DONORS = [
  ['Aarav Sharma', 'donor', 'O+', 'male', 27, 'Jaipur', 150, true],
  ['Priya Rathore', 'priya.rathore', 'A+', 'female', 31, 'Jaipur', 200, true],
  ['Vikram Singh Shekhawat', 'vikram.s', 'B+', 'male', 35, 'Jaipur', 40, true],
  ['Sneha Agarwal', 'sneha.a', 'O-', 'female', 24, 'Jaipur', null, true],
  ['Rahul Meena', 'rahul.meena', 'AB+', 'male', 29, 'Jaipur', 95, true],
  ['Kavya Jain', 'kavya.jain', 'B-', 'female', 26, 'Jaipur', 300, true],
  ['Imran Qureshi', 'imran.q', 'O+', 'male', 41, 'Jaipur', 20, true],
  ['Pooja Kumawat', 'pooja.k', 'A-', 'female', 33, 'Jaipur', 130, false],
  ['Arjun Chouhan', 'arjun.c', 'B+', 'male', 22, 'Jaipur', null, true],
  ['Divya Sethi', 'divya.sethi', 'AB-', 'female', 38, 'Jaipur', 400, true],
  ['Manish Yadav', 'manish.y', 'O+', 'male', 45, 'Jaipur', 110, true],
  ['Simran Kaur', 'simran.kaur', 'A+', 'female', 28, 'Jaipur', 60, true],
  ['Deepak Soni', 'deepak.soni', 'B+', 'male', 32, 'Jodhpur', 180, true],
  ['Ananya Bishnoi', 'ananya.b', 'O+', 'female', 25, 'Jodhpur', null, true],
  ['Mahesh Parihar', 'mahesh.p', 'A+', 'male', 39, 'Jodhpur', 75, true],
  ['Tanvi Mathur', 'tanvi.m', 'AB+', 'female', 30, 'Jodhpur', 250, true],
  ['Kartik Paliwal', 'kartik.p', 'O-', 'male', 34, 'Udaipur', 140, true],
  ['Ishita Menaria', 'ishita.m', 'B+', 'female', 27, 'Udaipur', null, true],
  ['Rohan Dave', 'rohan.dave', 'A+', 'male', 36, 'Udaipur', 30, true],
  ['Neelam Gurjar', 'neelam.g', 'O+', 'female', 29, 'Kota', 160, true],
  ['Sandeep Hada', 'sandeep.h', 'B-', 'male', 43, 'Kota', null, true],
  ['Ayesha Khan', 'ayesha.khan', 'A-', 'female', 23, 'Ajmer', 210, true],
  ['Gaurav Tak', 'gaurav.tak', 'O+', 'male', 31, 'Ajmer', 100, false],
  ['Ritika Bansal', 'ritika.b', 'AB+', 'female', 35, 'Jaipur', 125, true],
];

const SEEKERS = [
  ['Neha Gupta', 'seeker', 'Jaipur', '9833000001'],
  ['Farhan Ali', 'farhan.ali', 'Jaipur', '9833000002'],
  ['Lokesh Prajapat', 'lokesh.p', 'Jodhpur', '9833000003'],
];

// [bank, requester (seeker index or hospital key), patient, group, units, urgency, status, created days ago, hospital name (for seekers)]
const REQUESTS = [
  ['pinkCity', 'sanjeevani', 'Ramesh Verma', 'O+', 2, 'critical', 'pending', 0.2],
  ['pinkCity', 0, 'Sushila Devi', 'B+', 1, 'urgent', 'pending', 0.5, 'Sanjeevani Multispeciality Hospital'],
  ['pinkCity', 1, 'Mohd. Arif', 'A+', 3, 'normal', 'pending', 1, 'City Care Nursing Home'],
  ['pinkCity', 'sanjeevani', 'Baby of Kiran', 'O-', 1, 'urgent', 'approved', 2],
  ['aravali', 0, 'Geeta Sharma', 'AB+', 2, 'normal', 'pending', 1.5, 'Shri Ram Hospital'],
  ['pinkCity', 'sanjeevani', 'Harish Joshi', 'B+', 2, 'normal', 'fulfilled', 6],
  ['pinkCity', 1, 'Nasreen Bano', 'O+', 1, 'urgent', 'fulfilled', 12, 'City Care Nursing Home'],
  ['aravali', 'sanjeevani', 'Prakash Saini', 'A+', 2, 'normal', 'declined', 15],
  ['marwar', 'shanti', 'Bhanwar Lal', 'B+', 2, 'urgent', 'pending', 0.8],
  ['marwar', 2, 'Kamla Devi', 'O+', 1, 'normal', 'fulfilled', 20, 'Shanti Care Hospital'],
  ['lakeCity', 2, 'Hemant Rao', 'A-', 1, 'critical', 'cancelled', 25, 'Maharana Hospital'],
  ['pinkCity', 'sanjeevani', 'Lalita Kanwar', 'AB+', 2, 'normal', 'fulfilled', 34],
  ['pinkCity', 0, 'Om Prakash', 'O+', 2, 'urgent', 'fulfilled', 47, 'Sanjeevani Multispeciality Hospital'],
  ['aravali', 'sanjeevani', 'Rekha Meena', 'B-', 1, 'critical', 'fulfilled', 58],
  ['marwar', 'shanti', 'Jethmal Bishnoi', 'A+', 3, 'normal', 'fulfilled', 66],
  ['pinkCity', 'sanjeevani', 'Savitri Bai', 'O+', 2, 'normal', 'fulfilled', 79],
  ['lakeCity', 2, 'Dinesh Paliwal', 'B+', 1, 'urgent', 'fulfilled', 92, 'Lake View Hospital'],
  ['pinkCity', 1, 'Sabina Khan', 'A+', 1, 'normal', 'declined', 104, 'City Care Nursing Home'],
  ['marwar', 'shanti', 'Ramkishore Soni', 'O-', 1, 'critical', 'fulfilled', 118],
  ['pinkCity', 'sanjeevani', 'Usha Agarwal', 'B+', 2, 'normal', 'fulfilled', 131],
  ['aravali', 0, 'Kishan Lal', 'O+', 2, 'urgent', 'fulfilled', 146, 'Shri Ram Hospital'],
  ['pinkCity', 'sanjeevani', 'Manju Devi', 'AB-', 1, 'urgent', 'fulfilled', 160],
  ['marwar', 2, 'Gopal Ram', 'B+', 2, 'normal', 'fulfilled', 171, 'Shanti Care Hospital'],
];

// [donor index, bank, days ago, units]
const DONATIONS = [
  [0, 'pinkCity', 150, 1],
  [0, 'pinkCity', 290, 1],
  [0, 'aravali', 430, 1],
  [1, 'pinkCity', 200, 1],
  [2, 'pinkCity', 40, 1],
  [4, 'aravali', 95, 1],
  [5, 'pinkCity', 300, 1],
  [6, 'pinkCity', 20, 1],
  [7, 'aravali', 130, 1],
  [10, 'pinkCity', 110, 1],
  [11, 'pinkCity', 60, 1],
  [12, 'marwar', 180, 1],
  [14, 'marwar', 75, 1],
  [15, 'marwar', 250, 1],
  [16, 'lakeCity', 140, 1],
  [18, 'lakeCity', 30, 1],
  [19, 'pinkCity', 160, 1],
  [22, 'aravali', 100, 1],
  [23, 'pinkCity', 125, 1],
];

const WALK_IN_DONATIONS = [
  ['Mukesh Kumawat', 'O+', 'pinkCity', 5],
  ['Rani Sharma', 'A+', 'pinkCity', 9],
  ['Yusuf Pathan', 'B+', 'aravali', 14],
  ['Shalini Vyas', 'O+', 'lakeCity', 18],
  ['Bheem Singh', 'B+', 'marwar', 27],
  ['Nikita Tak', 'A-', 'pinkCity', 52],
  ['Ajay Saini', 'O+', 'pinkCity', 85],
];

const MESSAGES = [
  {
    name: 'Ravi Teja',
    email: 'ravi.teja@raktsetu.test',
    subject: 'Partner as a blood bank',
    message: 'We run a licensed blood bank in Bikaner and would like to join RaktSetu. What documents do you need?',
    status: 'new',
    createdAt: daysAgo(0.3),
  },
  {
    name: 'Mehul Joshi',
    email: 'mehul.j@raktsetu.test',
    phone: '9844000001',
    subject: 'Organising a donation camp',
    message:
      'Our college wants to organise a blood donation camp next month. Can RaktSetu help us find a partner blood bank?',
    status: 'new',
    createdAt: daysAgo(1.2),
  },
  {
    name: 'Sarita Devi',
    email: 'sarita.devi@raktsetu.test',
    subject: 'Thank you',
    message:
      'Thanks to a donor we found through RaktSetu, my father received blood on time. Thank you to everyone involved.',
    status: 'read',
    createdAt: daysAgo(4),
  },
  {
    name: 'Ankit Goyal',
    email: 'ankit.goyal@raktsetu.test',
    subject: 'Update my blood group',
    message: 'I entered the wrong blood group when I registered. How can I correct it?',
    status: 'resolved',
    createdAt: daysAgo(9),
  },
];

/** Replace everything in the database with the demo data set. */
export async function seedDemoData({ includeAdmin = true } = {}) {
  await Promise.all(
    [User, Facility, BloodRequest, Donation, StockMovement, ContactMessage, Counter].map((Model) =>
      Model.deleteMany({}),
    ),
  );

  const passwordHash = await User.hashPassword(DEMO_PASSWORD);
  const users = [];
  const facilities = [];

  const addUser = (fields) => {
    const user = { _id: id(), passwordHash, isActive: true, state: 'Rajasthan', createdAt: daysAgo(190), ...fields };
    users.push(user);
    return user;
  };

  // Facilities are "reviewed" by this admin; it is only saved when includeAdmin is true.
  const admin = { _id: id() };
  if (includeAdmin) {
    Object.assign(
      admin,
      addUser({
        name: 'RaktSetu Admin',
        email: 'admin@raktsetu.test',
        phone: '9800000001',
        role: 'admin',
        city: 'Jaipur',
      }),
    );
  }

  const banks = {};
  for (const [index, bank] of BANKS.entries()) {
    const owner = addUser({ ...bank.owner, role: 'bloodbank', city: bank.city, createdAt: daysAgo(185 - index * 20) });
    const facility = {
      _id: id(),
      type: 'bloodbank',
      name: bank.name,
      licenseNumber: bank.licenseNumber,
      address: bank.address,
      city: bank.city,
      state: 'Rajasthan',
      pincode: bank.pincode,
      phone: bank.phone,
      email: bank.owner.email,
      openingHours: bank.openingHours,
      owner: owner._id,
      verification:
        bank.status === 'verified'
          ? {
              status: 'verified',
              note: 'Licence checked',
              reviewedAt: daysAgo(180 - index * 20),
              reviewedBy: admin._id,
            }
          : { status: 'pending', note: '' },
      inventory: inventory(bank.stock),
      inventoryUpdatedAt: bank.status === 'verified' ? daysAgo(index * 0.15, 9) : undefined,
      createdAt: owner.createdAt,
    };
    owner.facility = facility._id;
    facilities.push(facility);
    banks[bank.key] = facility;
  }

  const hospitals = {};
  for (const [index, hospital] of HOSPITALS.entries()) {
    const owner = addUser({
      ...hospital.owner,
      role: 'hospital',
      city: hospital.city,
      createdAt: daysAgo(180 - index * 30),
    });
    const facility = {
      _id: id(),
      type: 'hospital',
      name: hospital.name,
      licenseNumber: hospital.licenseNumber,
      address: hospital.address,
      city: hospital.city,
      state: 'Rajasthan',
      pincode: hospital.pincode,
      phone: hospital.phone,
      email: hospital.owner.email,
      openingHours: 'Open 24 hours',
      owner: owner._id,
      verification:
        hospital.status === 'verified'
          ? {
              status: 'verified',
              note: 'Registration checked',
              reviewedAt: daysAgo(175 - index * 30),
              reviewedBy: admin._id,
            }
          : { status: 'pending', note: '' },
      createdAt: owner.createdAt,
    };
    owner.facility = facility._id;
    facilities.push(facility);
    hospitals[hospital.key] = { facility, owner };
  }

  const donors = DONORS.map(
    ([name, emailPrefix, bloodGroup, gender, age, city, lastDonatedDaysAgo, isAvailable], index) =>
      addUser({
        name,
        email: `${emailPrefix}@raktsetu.test`,
        phone: `98550${String(index + 1).padStart(5, '0')}`,
        role: 'donor',
        city,
        createdAt: daysAgo(170 - index * 5),
        donor: {
          bloodGroup,
          gender,
          dateOfBirth: yearsAgo(age, index * 11),
          weightKg: gender === 'male' ? 68 + (index % 12) : 54 + (index % 9),
          lastDonationDate: lastDonatedDaysAgo === null ? null : daysAgo(lastDonatedDaysAgo),
          isAvailable,
        },
      }),
  );

  const seekers = SEEKERS.map(([name, emailPrefix, city, phone], index) =>
    addUser({
      name,
      email: `${emailPrefix}@raktsetu.test`,
      phone,
      role: 'seeker',
      city,
      createdAt: daysAgo(160 - index * 25),
    }),
  );

  const requests = REQUESTS.map(
    ([bankKey, requesterKey, patientName, bloodGroup, units, urgency, status, createdDaysAgo, hospitalName], index) => {
      const bank = banks[bankKey];
      const hospital = typeof requesterKey === 'string' ? hospitals[requesterKey] : null;
      const requester = hospital ? hospital.owner : seekers[requesterKey];
      const createdAt = daysAgo(createdDaysAgo, 10);
      const bankStaff = users.find((user) => user._id.equals(bank.owner));

      const history = [{ status: 'pending', note: `Sent to ${bank.name}`, at: createdAt, by: requester._id }];
      const later = (hours) => new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
      if (['approved', 'fulfilled'].includes(status)) {
        history.push({
          status: 'approved',
          note: `${units} unit(s) of ${bloodGroup} reserved for the patient.`,
          at: later(1),
          by: bankStaff._id,
        });
      }
      if (status === 'fulfilled')
        history.push({ status: 'fulfilled', note: 'Blood handed over.', at: later(4), by: bankStaff._id });
      if (status === 'declined') {
        history.push({
          status: 'declined',
          note: 'Not enough compatible units. Please contact Pink City Blood Centre.',
          at: later(2),
          by: bankStaff._id,
        });
      }
      if (status === 'cancelled')
        history.push({ status: 'cancelled', note: 'Cancelled by the requester', at: later(3), by: requester._id });

      return {
        _id: id(),
        code: `RS-${1001 + index}`,
        requester: requester._id,
        requesterRole: hospital ? 'hospital' : 'seeker',
        hospitalFacility: hospital ? hospital.facility._id : null,
        bloodBank: bank._id,
        patientName,
        patientAge: 20 + ((index * 7) % 55),
        bloodGroup,
        units,
        urgency,
        hospitalName: hospital ? hospital.facility.name : hospitalName,
        city: bank.city,
        contactPhone: requester.phone,
        requiredBy: status === 'pending' || status === 'approved' ? daysAhead(urgency === 'normal' ? 3 : 1) : undefined,
        notes: urgency === 'critical' ? 'Patient in ICU. Please call as soon as possible.' : '',
        status,
        history,
        donorResponses: [],
        createdAt,
        updatedAt: history.at(-1).at,
      };
    },
  );

  // A few donors have already offered to help with open requests in Jaipur.
  requests[0].donorResponses.push({ donor: donors[10]._id, respondedAt: daysAgo(0.1) });
  requests[1].donorResponses.push({ donor: donors[8]._id, respondedAt: daysAgo(0.3) });

  const donations = [
    ...DONATIONS.map(([donorIndex, bankKey, donatedDaysAgo, units]) => ({
      _id: id(),
      donor: donors[donorIndex]._id,
      donorName: donors[donorIndex].name,
      donorPhone: donors[donorIndex].phone,
      bloodBank: banks[bankKey]._id,
      bloodGroup: donors[donorIndex].donor.bloodGroup,
      units,
      donatedAt: daysAgo(donatedDaysAgo),
      recordedBy: banks[bankKey].owner,
    })),
    ...WALK_IN_DONATIONS.map(([donorName, bloodGroup, bankKey, donatedDaysAgo]) => ({
      _id: id(),
      donor: null,
      donorName,
      bloodBank: banks[bankKey]._id,
      bloodGroup,
      units: 1,
      donatedAt: daysAgo(donatedDaysAgo),
      recordedBy: banks[bankKey].owner,
    })),
  ];

  // Stock history for the main demo blood bank, worked backwards from today's stock.
  const pinkCity = banks.pinkCity;
  const events = [
    ...donations
      .filter((donation) => donation.bloodBank.equals(pinkCity._id))
      .map((donation) => ({
        at: donation.donatedAt,
        bloodGroup: donation.bloodGroup,
        change: donation.units,
        reason: 'donation',
        note: `Donation by ${donation.donorName}`,
        donation: donation._id,
      })),
    ...requests
      .filter((request) => request.bloodBank.equals(pinkCity._id) && ['approved', 'fulfilled'].includes(request.status))
      .map((request) => ({
        at: request.history[1].at,
        bloodGroup: request.bloodGroup,
        change: -request.units,
        reason: 'request',
        note: `Issued for ${request.code}`,
        request: request._id,
      })),
    { at: daysAgo(3, 9), bloodGroup: 'O+', change: 10, reason: 'received', note: 'Transfer from the state blood bank' },
    { at: daysAgo(8, 9), bloodGroup: 'B+', change: -2, reason: 'expired', note: 'Units past expiry date' },
  ].sort((a, b) => b.at - a.at);

  const running = { ...pinkCity.inventory };
  const movements = events.map((event) => {
    const movement = {
      bloodBank: pinkCity._id,
      bloodGroup: event.bloodGroup,
      change: event.change,
      balanceAfter: Math.max(0, running[event.bloodGroup]),
      reason: event.reason,
      note: event.note,
      request: event.request,
      donation: event.donation,
      by: pinkCity.owner,
      createdAt: event.at,
      updatedAt: event.at,
    };
    running[event.bloodGroup] -= event.change;
    return movement;
  });

  await User.insertMany(users);
  await Facility.insertMany(facilities);
  await BloodRequest.insertMany(requests);
  await Donation.insertMany(donations);
  await StockMovement.insertMany(movements);
  await ContactMessage.insertMany(MESSAGES.map((message) => ({ ...message, updatedAt: message.createdAt })));
  await Counter.create({ _id: 'bloodRequest', seq: requests.length });

  return `${users.length} users, ${facilities.length} facilities, ${requests.length} requests, ${donations.length} donations`;
}
