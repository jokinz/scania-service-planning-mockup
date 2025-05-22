const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

function parseBoolean(value) {
  return value === true || value === 'true';
}

function loadServicePlanningData() {
  const filePath = path.join(__dirname, 'actividaes.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  return data.map(entry => ({
    vin: entry.vin || '',
    chassisNo: entry.chassisNo || '',
    header: entry.header || '',
    macId: entry.macId || '',
    maintenancePlanProgramCode: entry.maintenancePlanProgramCode || '',
    duration: parseInt(entry.duration, 10) || 0,
    bookingStatus: entry.bookingStatus || '',
    scheduleDate: entry.scheduleDate || '',
    performedDate: entry.performedDate || '',
    workshopName: entry.workshopName || '',
    workshopId: entry.workshopId || '',
    performedDistance: entry.performedDistance != null ? parseInt(entry.performedDistance, 10) : null,
    plannedDistance: entry.plannedDistance != null ? parseInt(entry.plannedDistance, 10) : null,
    isFlexible: parseBoolean(entry.isFlexible)
  }));
}

function applyFilters(data, query) {
  return data.filter(entry => {
    const vinOrChassis = query.vinOrChassisNumber?.toLowerCase();
    const bookingStatus = query.bookingStatus;
    const startDateTime = query.startDateTime;
    const endDateTime = query.endDateTime;

    const scheduleDate = new Date(entry.scheduleDate);

    if (
      vinOrChassis &&
      !(
        entry.vin.toLowerCase().includes(vinOrChassis) ||
        entry.chassisNo.toLowerCase().includes(vinOrChassis)
      )
    ) {
      return false;
    }

    if (bookingStatus && entry.bookingStatus !== bookingStatus) {
      return false;
    }

    if (startDateTime && scheduleDate < new Date(startDateTime)) {
      return false;
    }

    if (endDateTime && scheduleDate > new Date(endDateTime)) {
      return false;
    }

    return true;
  });
}

const loadPosicionesData = () => {
  const filePath = path.join(__dirname, 'posiciones.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(raw);
    return json;
  } catch (err) {
    console.error('Error reading posiciones.json:', err);
  }

}

app.get('/', (req, res) => {
  const rawData = loadServicePlanningData();
  const filteredData = applyFilters(rawData, req.query);
  res.json(filteredData);
});
app.post('/', (req, res) => {
  const rawData = loadServicePlanningData();
  const filteredData = applyFilters(rawData, req.query);
  res.json(filteredData);
});
app.get('/posiciones', (req, res) => {
  const rawData = loadPosicionesData();
  res.json(rawData);
});
app.post('/posiciones', (req, res) => {
  const rawData = loadPosicionesData();
  res.json(rawData);
});

app.listen(PORT, () => {
  console.log(`RFMS mock API running on http://localhost:${PORT}`);
});
