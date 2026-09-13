/**
 * Migration script: Adds intermediate stops and routeCities to all existing buses.
 * 
 * This enables passengers to:
 * 1. Book buses between any two cities along the bus's route
 * 2. Search "Mumbai → Thane" and find buses that go Mumbai→Pune (which passes through Thane)
 * 3. See all available intermediate city pairs when browsing a bus
 * 
 * Run: node backend/add-intermediate-routes.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const Bus = require('./src/models/Bus');

// ── Define intermediate stops for each route ──────────────────────────────────
// Each route has: source → [intermediate stops...] → destination
const ROUTE_STOPS = {
  'Mumbai-Pune': [
    { name: 'Dadar', time: '06:45', type: 'boarding' },
    { name: 'Bandra', time: '07:00', type: 'boarding' },
    { name: 'Andheri', time: '07:20', type: 'boarding' },
    { name: 'Borivali', time: '07:45', type: 'boarding' },
    { name: 'Thane', time: '08:15', type: 'stop' },
    { name: 'Panvel', time: '08:45', type: 'stop' },
    { name: 'Khandala', time: '09:30', type: 'stop' },
    { name: 'Lonavala', time: '10:00', type: 'stop' },
  ],
  'Pune-Mumbai': [
    { name: 'Shivaji Nagar', time: '07:15', type: 'boarding' },
    { name: 'Swargate', time: '07:30', type: 'boarding' },
    { name: 'Lonavala', time: '08:30', type: 'stop' },
    { name: 'Khandala', time: '09:00', type: 'stop' },
    { name: 'Panvel', time: '09:45', type: 'stop' },
    { name: 'Thane', time: '10:15', type: 'stop' },
    { name: 'Borivali', time: '10:45', type: 'dropping' },
  ],
  'Delhi-Jaipur': [
    { name: 'Rohini', time: '07:30', type: 'boarding' },
    { name: 'Dwarka', time: '08:00', type: 'boarding' },
    { name: 'Gurgaon', time: '08:45', type: 'stop' },
    { name: 'Manesar', time: '09:15', type: 'stop' },
    { name: 'Neemrana', time: '09:45', type: 'stop' },
    { name: 'Shahpura', time: '10:15', type: 'stop' },
    { name: 'Bhiwadi', time: '10:30', type: 'stop' },
    { name: 'Kotputli', time: '11:00', type: 'stop' },
    { name: 'Amber', time: '11:45', type: 'stop' },
  ],
  'Jaipur-Delhi': [
    { name: 'Amber', time: '13:30', type: 'boarding' },
    { name: 'Kotputli', time: '14:15', type: 'stop' },
    { name: 'Bhiwadi', time: '14:45', type: 'stop' },
    { name: 'Shahpura', time: '15:00', type: 'stop' },
    { name: 'Neemrana', time: '15:30', type: 'stop' },
    { name: 'Manesar', time: '16:00', type: 'stop' },
    { name: 'Gurgaon', time: '16:45', type: 'dropping' },
  ],
  'Bangalore-Hyderabad': [
    { name: 'Electronic City', time: '08:45', type: 'boarding' },
    { name: 'Attibele', time: '09:30', type: 'boarding' },
    { name: 'Chikkaballapur', time: '10:30', type: 'stop' },
    { name: 'Kolar', time: '11:15', type: 'stop' },
    { name: 'Chittoor', time: '12:00', type: 'stop' },
    { name: 'Kurnool', time: '13:30', type: 'stop' },
    { name: 'Kadapa', time: '14:30', type: 'stop' },
    { name: 'Kacheguda', time: '15:30', type: 'stop' },
  ],
  'Hyderabad-Bangalore': [
    { name: 'Kacheguda', time: '21:00', type: 'boarding' },
    { name: 'Kadapa', time: '22:00', type: 'boarding' },
    { name: 'Kurnool', time: '23:00', type: 'stop' },
    { name: 'Chittoor', time: '00:30', type: 'stop' },
    { name: 'Kolar', time: '01:30', type: 'stop' },
    { name: 'Chikkaballapur', time: '02:30', type: 'stop' },
    { name: 'Attibele', time: '03:30', type: 'stop' },
    { name: 'Electronic City', time: '04:00', type: 'dropping' },
  ],
  'Chennai-Bangalore': [
    { name: 'Tambaram', time: '06:45', type: 'boarding' },
    { name: 'Chengalpattu', time: '07:30', type: 'boarding' },
    { name: 'Kanchipuram', time: '08:15', type: 'stop' },
    { name: 'Vellore', time: '09:15', type: 'stop' },
    { name: 'Ranipet', time: '09:45', type: 'stop' },
    { name: 'Chittoor', time: '10:30', type: 'stop' },
    { name: 'Kolar', time: '11:15', type: 'stop' },
  ],
  'Bangalore-Chennai': [
    { name: 'Hosur', time: '06:00', type: 'boarding' },
    { name: 'Krishnagiri', time: '07:00', type: 'boarding' },
    { name: 'Kolar', time: '08:00', type: 'stop' },
    { name: 'Chittoor', time: '08:45', type: 'stop' },
    { name: 'Ranipet', time: '09:30', type: 'stop' },
    { name: 'Vellore', time: '10:00', type: 'stop' },
    { name: 'Kanchipuram', time: '11:00', type: 'stop' },
  ],
  'Ahmedabad-Vadodara': [
    { name: 'Nadiad', time: '09:30', type: 'stop' },
    { name: 'Anand', time: '10:00', type: 'stop' },
    { name: 'Vithal Udyognagar', time: '10:30', type: 'stop' },
  ],
  'Vadodara-Ahmedabad': [
    { name: 'Vithal Udyognagar', time: '17:00', type: 'stop' },
    { name: 'Anand', time: '17:30', type: 'stop' },
    { name: 'Nadiad', time: '18:00', type: 'stop' },
  ],
  'Mumbai-Delhi': [
    { name: 'Dadar', time: '17:45', type: 'boarding' },
    { name: 'Thane', time: '18:30', type: 'boarding' },
    { name: 'Surat', time: '21:00', type: 'stop' },
    { name: 'Vadodara', time: '23:00', type: 'stop' },
    { name: 'Ahmedabad', time: '01:00', type: 'stop' },
    { name: 'Udaipur', time: '03:00', type: 'stop' },
    { name: 'Ajmer', time: '05:00', type: 'stop' },
    { name: 'Jaipur', time: '07:00', type: 'stop' },
  ],
  'Delhi-Mumbai': [
    { name: 'Gurgaon', time: '21:00', type: 'boarding' },
    { name: 'Jaipur', time: '23:00', type: 'stop' },
    { name: 'Ajmer', time: '01:00', type: 'stop' },
    { name: 'Udaipur', time: '03:00', type: 'stop' },
    { name: 'Ahmedabad', time: '05:00', type: 'stop' },
    { name: 'Vadodara', time: '07:00', type: 'stop' },
    { name: 'Surat', time: '09:00', type: 'stop' },
  ],
};

/**
 * Get the route key for a bus (normalized source-destination)
 */
function getRouteKey(from, to) {
  if (!from || !to) return null;
  return `${from.trim()}-${to.trim()}`;
}

/**
 * Build the ordered list of cities a bus passes through
 */
function buildRouteCities(bus, stops) {
  const cities = [bus.from.trim()];
  stops.forEach((s) => {
    if (!cities.includes(s.name.trim())) {
      cities.push(s.name.trim());
    }
  });
  if (!cities.includes(bus.to.trim())) {
    cities.push(bus.to.trim());
  }
  return cities;
}

async function addIntermediateRoutes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const buses = await Bus.find({});
    console.log(`📦 Found ${buses.length} buses to update\n`);

    let updatedCount = 0;

    for (const bus of buses) {
      const routeKey = getRouteKey(bus.from, bus.to);

      if (!routeKey) {
        console.log(`  ⏭️  Skipping bus "${bus.busName}" — missing from/to`);
        continue;
      }

      // Check if we have intermediate stops defined for this route
      const intermediateStops = ROUTE_STOPS[routeKey];

      if (!intermediateStops) {
        console.log(`  ⏭️  Skipping "${bus.from} → ${bus.to}" — no stops defined`);
        continue;
      }

      // Add intermediate stops to the bus's existing stops
      // Keep existing stops, then add any new ones that aren't duplicates
      const existingStopNames = new Set((bus.stops || []).map((s) => s.name));

      for (const stop of intermediateStops) {
        if (!existingStopNames.has(stop.name)) {
          bus.stops.push(stop);
          existingStopNames.add(stop.name);
        }
      }

      // Build the ordered routeCities array
      bus.routeCities = buildRouteCities(bus, bus.stops);

      await bus.save();
      updatedCount++;

      console.log(`  ✅ "${bus.busName}" (${bus.from} → ${bus.to})`);
      console.log(`     🏙️  Route cities: ${bus.routeCities.join(' → ')}`);
      console.log(`     🛑 Stops: ${bus.stops.length} stops\n`);
    }

    console.log(`\n🎉 Done! Updated ${updatedCount} buses with intermediate stops.`);
    console.log('\n📋 Example sub-routes now bookable:');
    console.log('   • Mumbai → Thane (Mumbai→Pune bus)');
    console.log('   • Borivali → Lonavala (Mumbai→Pune bus)');
    console.log('   • Gurgaon → Neemrana (Delhi→Jaipur bus)');
    console.log('   • Electronic City → Kurnool (Bangalore→Hyderabad bus)');
    console.log('   • And many more!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

addIntermediateRoutes();