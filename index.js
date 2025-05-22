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
  const filePath = path.join(__dirname, 'service_planning.xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = xlsx.utils.sheet_to_json(sheet);

  return jsonData.map(row => ({
    chassisNo: row.chassisNo || '',
    VIN: row.VIN || '',
    header: row.header || '',
    macId: uuidv4(),
    maintenancePlanProgramCode: row.maintenancePlanProgramCode || '',
    duration: parseInt(row.duration, 10) || 0,
    bookingStatus: row.bookingStatus || '',
    scheduleDate: row.scheduleDate || '',
    performedDate: row.performedDate || '',
    workshopName: row.workshopName || '',
    workshopId: row.workshopId || '',
    performedDistance: parseInt(row.performedDistance, 10) || 0,
    plannedDistance: parseInt(row.plannedDistance, 10) || 0,
    isFlexible: parseBoolean(row.isFlexible),
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
        entry.VIN.toLowerCase().includes(vinOrChassis) ||
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

app.listen(PORT, () => {
  console.log(`RFMS mock API running on http://localhost:${PORT}`);
});
