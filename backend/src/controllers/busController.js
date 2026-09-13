const Bus = require('../models/Bus');

const getBuses = async (req, res) => {
  try {
    const { from, to, type } = req.query;

    const filter = {};

    if (type) {
      filter.busType = new RegExp(type, 'i');
    }

    // If both from and to are provided, find buses that cover the sub-route
    // A bus covers Mumbai→Pune if:
    //   - Mumbai appears BEFORE Pune in its routeCities array
    //   - OR it's the direct from→to match (backward compatible)
    if (from && to) {
      // Get all buses
      let buses = await Bus.find({}).sort({ fare: 1 });

      // Filter buses that cover the requested route (including sub-routes)
      buses = buses.filter((bus) => {
        // Build the ordered list of cities this bus traverses
        const cities = [];
        
        // Start with the 'from' city
        cities.push(bus.from?.toLowerCase().trim());
        
        // Add all stop names in order
        if (bus.stops && bus.stops.length > 0) {
          bus.stops.forEach((stop) => {
            const name = stop.name?.toLowerCase().trim();
            if (name && !cities.includes(name)) {
              cities.push(name);
            }
          });
        }
        
        // End with the 'to' city (if not already included)
        const toCity = bus.to?.toLowerCase().trim();
        if (toCity && !cities.includes(toCity)) {
          cities.push(toCity);
        }

        const fromLower = from.toLowerCase().trim();
        const toLower = to.toLowerCase().trim();

        // Find the index of 'from' and 'to' in the route
        const fromIndex = cities.indexOf(fromLower);
        const toIndex = cities.indexOf(toLower);

        // The bus covers this route if 'from' appears BEFORE 'to' in the route order
        return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
      });

      return res.json(buses);
    }

    // If only 'from' is provided, find buses that pass through that city
    if (from) {
      const fromLower = from.toLowerCase().trim();
      let buses = await Bus.find({}).sort({ fare: 1 });
      buses = buses.filter((bus) => {
        const cities = [
          bus.from?.toLowerCase().trim(),
          ...(bus.stops || []).map((s) => s.name?.toLowerCase().trim()),
          bus.to?.toLowerCase().trim(),
        ].filter(Boolean);
        return cities.includes(fromLower);
      });
      return res.json(buses);
    }

    // If only 'to' is provided, find buses that pass through that city
    if (to) {
      const toLower = to.toLowerCase().trim();
      let buses = await Bus.find({}).sort({ fare: 1 });
      buses = buses.filter((bus) => {
        const cities = [
          bus.from?.toLowerCase().trim(),
          ...(bus.stops || []).map((s) => s.name?.toLowerCase().trim()),
          bus.to?.toLowerCase().trim(),
        ].filter(Boolean);
        return cities.includes(toLower);
      });
      return res.json(buses);
    }

    // No filters — return all buses
    const buses = await Bus.find(filter).sort({ fare: 1 });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch buses', error: error.message });
  }
};

const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bus', error: error.message });
  }
};

const createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create bus', error: error.message });
  }
};

module.exports = {
  getBuses,
  getBusById,
  createBus,
};