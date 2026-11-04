import { env } from '../config/env.js';
import { BloodRequest, ContactMessage, Facility, User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { BLOOD_GROUPS, emptyInventory } from '../utils/constants.js';
import { exactInsensitive } from '../utils/helpers.js';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../seed/demoAccounts.js';

const VERIFIED_BANK = { type: 'bloodbank', 'verification.status': 'verified' };
const PUBLIC_BANK_FIELDS =
  'name address city state pincode phone email openingHours inventory inventoryUpdatedAt verification.status';

export async function getConfig(_req, res) {
  // Only offer demo sign-ins when demo mode is on and the sample accounts actually exist.
  let demoAccounts = [];
  if (env.demoMode) {
    const existing = await User.find({ email: { $in: DEMO_ACCOUNTS.map((account) => account.email) } }).distinct(
      'email',
    );
    demoAccounts = DEMO_ACCOUNTS.filter((account) => existing.includes(account.email));
  }
  const demoMode = demoAccounts.length > 0;
  res.json({ demoMode, ...(demoMode && { demoAccounts, demoPassword: DEMO_PASSWORD }) });
}

export async function getStats(_req, res) {
  const [donors, availableDonors, bloodBanks, hospitals, fulfilled, banks] = await Promise.all([
    User.countDocuments({ role: 'donor', isActive: true }),
    User.countDocuments({ role: 'donor', isActive: true, 'donor.isAvailable': true }),
    Facility.countDocuments(VERIFIED_BANK),
    Facility.countDocuments({ type: 'hospital', 'verification.status': 'verified' }),
    BloodRequest.aggregate([
      { $match: { status: 'fulfilled' } },
      { $group: { _id: null, requests: { $sum: 1 }, units: { $sum: '$units' } } },
    ]),
    Facility.find(VERIFIED_BANK).select('inventory inventoryUpdatedAt').lean(),
  ]);

  const stockByGroup = emptyInventory();
  let lastUpdated = null;
  for (const bank of banks) {
    for (const group of BLOOD_GROUPS) stockByGroup[group] += bank.inventory?.[group] ?? 0;
    if (bank.inventoryUpdatedAt && (!lastUpdated || bank.inventoryUpdatedAt > lastUpdated))
      lastUpdated = bank.inventoryUpdatedAt;
  }

  res.json({
    donors,
    availableDonors,
    bloodBanks,
    hospitals,
    requestsFulfilled: fulfilled[0]?.requests ?? 0,
    unitsIssued: fulfilled[0]?.units ?? 0,
    unitsAvailable: Object.values(stockByGroup).reduce((sum, units) => sum + units, 0),
    stockByGroup,
    stockUpdatedAt: lastUpdated,
  });
}

export async function listBloodBanks(req, res) {
  const { city, bloodGroup, inStock } = req.valid.query;
  const filter = { ...VERIFIED_BANK };
  if (city) filter.city = exactInsensitive(city);
  if (bloodGroup && inStock) filter[`inventory.${bloodGroup}`] = { $gt: 0 };

  const sort = bloodGroup ? { [`inventory.${bloodGroup}`]: -1, name: 1 } : { city: 1, name: 1 };
  const banks = await Facility.find(filter).select(PUBLIC_BANK_FIELDS).sort(sort).limit(100);
  res.json({ items: banks, total: banks.length });
}

export async function getBloodBank(req, res) {
  const bank = await Facility.findOne({ _id: req.valid.params.id, ...VERIFIED_BANK }).select(PUBLIC_BANK_FIELDS);
  if (!bank) throw ApiError.notFound('This blood bank was not found or is not verified yet.');
  res.json({ bank });
}

export async function listCities(_req, res) {
  const cities = await Facility.distinct('city', VERIFIED_BANK);
  res.json({ cities: cities.filter(Boolean).sort((a, b) => a.localeCompare(b)) });
}

export async function createContactMessage(req, res) {
  await ContactMessage.create(req.valid.body);
  res.status(201).json({ message: 'Thank you! Your message has reached the RaktSetu team.' });
}
