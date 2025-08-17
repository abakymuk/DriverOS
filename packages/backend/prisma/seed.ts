import { PrismaClient } from '@prisma/client';
import { generateUUID } from '@driveros/types';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create terminals
  const terminal1 = await prisma.terminal.create({
    data: {
      id: generateUUID(),
      name: 'Port of Los Angeles',
      code: 'LAX',
      capacity: 1000,
      timezone: 'America/Los_Angeles',
      status: 'ACTIVE',
    },
  });

  const terminal2 = await prisma.terminal.create({
    data: {
      id: generateUUID(),
      name: 'Port of Long Beach',
      code: 'LGB',
      capacity: 800,
      timezone: 'America/Los_Angeles',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created terminals:', { terminal1: terminal1.code, terminal2: terminal2.code });

  // Create terminal settings
  await prisma.terminalSettings.create({
    data: {
      id: generateUUID(),
      terminalId: terminal1.id,
      slotDuration: 60,
      maxSlotsPerWindow: 10,
      operatingHours: {
        monday: { start: '06:00', end: '22:00' },
        tuesday: { start: '06:00', end: '22:00' },
        wednesday: { start: '06:00', end: '22:00' },
        thursday: { start: '06:00', end: '22:00' },
        friday: { start: '06:00', end: '22:00' },
        saturday: { start: '08:00', end: '18:00' },
        sunday: { start: '08:00', end: '18:00' },
      },
      closedDays: [],
      specialRules: {
        peakHours: { start: '08:00', end: '16:00' },
        holidaySchedule: true,
      },
    },
  });

  await prisma.terminalSettings.create({
    data: {
      id: generateUUID(),
      terminalId: terminal2.id,
      slotDuration: 45,
      maxSlotsPerWindow: 8,
      operatingHours: {
        monday: { start: '07:00', end: '21:00' },
        tuesday: { start: '07:00', end: '21:00' },
        wednesday: { start: '07:00', end: '21:00' },
        thursday: { start: '07:00', end: '21:00' },
        friday: { start: '07:00', end: '21:00' },
        saturday: { start: '09:00', end: '17:00' },
        sunday: { start: '09:00', end: '17:00' },
      },
      closedDays: [],
      specialRules: {
        peakHours: { start: '09:00', end: '17:00' },
        holidaySchedule: true,
      },
    },
  });

  console.log('✅ Created terminal settings');

  // Create vessels
  const vessel1 = await prisma.vessel.create({
    data: {
      id: generateUUID(),
      name: 'MSC OSCAR',
      eta: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      terminalId: terminal1.id,
      status: 'ARRIVING',
      containerCount: 2500,
    },
  });

  const vessel2 = await prisma.vessel.create({
    data: {
      id: generateUUID(),
      name: 'EVER GIVEN',
      eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      terminalId: terminal2.id,
      status: 'ARRIVING',
      containerCount: 1800,
    },
  });

  console.log('✅ Created vessels:', { vessel1: vessel1.name, vessel2: vessel2.name });

  // Create vessel schedules
  await prisma.vesselSchedule.create({
    data: {
      id: generateUUID(),
      vesselId: vessel1.id,
      terminalId: terminal1.id,
      eta: new Date(Date.now() + 24 * 60 * 60 * 1000),
      etd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'SCHEDULED',
    },
  });

  await prisma.vesselSchedule.create({
    data: {
      id: generateUUID(),
      vesselId: vessel2.id,
      terminalId: terminal2.id,
      eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      etd: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: 'SCHEDULED',
    },
  });

  console.log('✅ Created vessel schedules');

  // Create containers
  const containers = [];
  for (let i = 1; i <= 10; i++) {
    const container = await prisma.container.create({
      data: {
        id: generateUUID(),
        cntrNo: `MSCU${String(i).padStart(6, '0')}1234`,
        type: i % 2 === 0 ? 'FORTY_HC' : 'TWENTY_GP',
        line: 'MSC',
        readyAt: new Date(Date.now() + (i * 2 * 60 * 60 * 1000)), // Staggered ready times
        hold: i === 3 || i === 7, // Some containers on hold
        status: i === 3 || i === 7 ? 'HOLD' : 'NOT_READY',
        terminalId: terminal1.id,
        vesselId: vessel1.id,
      },
    });
    containers.push(container);
  }

  // Create containers for second vessel
  for (let i = 11; i <= 15; i++) {
    const container = await prisma.container.create({
      data: {
        id: generateUUID(),
        cntrNo: `EVER${String(i).padStart(6, '0')}5678`,
        type: i % 2 === 0 ? 'FORTY_GP' : 'FORTY_FIVE_HC',
        line: 'EVERGREEN',
        readyAt: new Date(Date.now() + (i * 3 * 60 * 60 * 1000)),
        hold: i === 13, // One container on hold
        status: i === 13 ? 'HOLD' : 'NOT_READY',
        terminalId: terminal2.id,
        vesselId: vessel2.id,
      },
    });
    containers.push(container);
  }

  console.log('✅ Created containers:', containers.length);

  // Create container holds
  const holdContainer1 = containers.find(c => c.cntrNo === 'MSCU0000031234');
  const holdContainer2 = containers.find(c => c.cntrNo === 'MSCU0000071234');
  const holdContainer3 = containers.find(c => c.cntrNo === 'EVER0000135678');

  if (holdContainer1) {
    await prisma.containerHold.create({
      data: {
        id: generateUUID(),
        containerId: holdContainer1.id,
        reason: 'CUSTOMS_HOLD',
        description: 'Customs inspection required',
      },
    });
  }

  if (holdContainer2) {
    await prisma.containerHold.create({
      data: {
        id: generateUUID(),
        containerId: holdContainer2.id,
        reason: 'DOCUMENTATION',
        description: 'Missing documentation',
      },
    });
  }

  if (holdContainer3) {
    await prisma.containerHold.create({
      data: {
        id: generateUUID(),
        containerId: holdContainer3.id,
        reason: 'CHASSIS_SHORTAGE',
        description: 'No chassis available',
      },
    });
  }

  console.log('✅ Created container holds');

  // Create slots
  const slots = [];
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const slot = await prisma.slot.create({
      data: {
        id: generateUUID(),
        terminalId: terminal1.id,
        windowStart: new Date(now.getTime() + (i * 2 * 60 * 60 * 1000)),
        windowEnd: new Date(now.getTime() + ((i + 1) * 2 * 60 * 60 * 1000)),
        capacity: 10,
        booked: i === 0 ? 3 : 0, // First slot has some bookings
        status: i === 0 ? 'FULL' : 'AVAILABLE',
      },
    });
    slots.push(slot);
  }

  console.log('✅ Created slots:', slots.length);

  // Create drivers
  const drivers = [];
  const driverNames = ['John Smith', 'Maria Garcia', 'David Johnson', 'Sarah Wilson', 'Michael Brown'];
  
  for (let i = 0; i < 5; i++) {
    const driver = await prisma.driver.create({
      data: {
        id: generateUUID(),
        name: driverNames[i],
        phone: `+1-555-${String(i + 100).padStart(3, '0')}`,
        email: `${driverNames[i].toLowerCase().replace(' ', '.')}@example.com`,
        status: 'ACTIVE',
        licenseNumber: `CA${String(i + 1000).padStart(6, '0')}`,
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        carrierId: `CARRIER${i + 1}`,
      },
    });
    drivers.push(driver);
  }

  console.log('✅ Created drivers:', drivers.length);

  // Create driver availability
  for (const driver of drivers) {
    await prisma.driverAvailability.create({
      data: {
        id: generateUUID(),
        driverId: driver.id,
        date: new Date(),
        startTime: '08:00',
        endTime: '18:00',
        status: 'AVAILABLE',
      },
    });
  }

  console.log('✅ Created driver availability');

  // Create driver metrics
  for (const driver of drivers) {
    await prisma.driverMetrics.create({
      data: {
        id: generateUUID(),
        driverId: driver.id,
        totalTrips: Math.floor(Math.random() * 100) + 50,
        completedTrips: Math.floor(Math.random() * 80) + 40,
        failedTrips: Math.floor(Math.random() * 5),
        averageTurnTime: Math.floor(Math.random() * 60) + 30,
        totalDistance: Math.floor(Math.random() * 10000) + 5000,
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
      },
    });
  }

  console.log('✅ Created driver metrics');

  // Create trucks
  const trucks = [];
  for (let i = 0; i < 5; i++) {
    const truck = await prisma.truck.create({
      data: {
        id: generateUUID(),
        driverId: drivers[i].id,
        plate: `CA${String(i + 1000).padStart(4, '0')}AB`,
        carrier: `Carrier ${i + 1}`,
        type: i % 2 === 0 ? 'CHASSIS' : 'DRY_VAN',
        capacity: i % 2 === 0 ? 1 : 2,
        status: 'AVAILABLE',
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });
    trucks.push(truck);
  }

  console.log('✅ Created trucks:', trucks.length);

  // Create truck locations
  for (const truck of trucks) {
    await prisma.truckLocation.create({
      data: {
        id: generateUUID(),
        truckId: truck.id,
        lat: 33.7490 + (Math.random() - 0.5) * 0.1, // Around LA
        lng: -118.1910 + (Math.random() - 0.5) * 0.1,
        speed: Math.random() * 60,
        heading: Math.random() * 360,
      },
    });
  }

  console.log('✅ Created truck locations');

  // Create trips
  const readyContainers = containers.filter(c => c.status === 'NOT_READY' && !c.hold);
  const trips = [];
  
  for (let i = 0; i < Math.min(3, readyContainers.length); i++) {
    const trip = await prisma.trip.create({
      data: {
        id: generateUUID(),
        driverId: drivers[i].id,
        containerId: readyContainers[i].id,
        pickupSlotId: slots[0].id,
        returnEmpty: i % 2 === 0,
        status: 'ASSIGNED',
        eta: new Date(Date.now() + (i + 1) * 60 * 60 * 1000),
      },
    });
    trips.push(trip);
  }

  console.log('✅ Created trips:', trips.length);

  // Create slot bookings
  for (let i = 0; i < trips.length; i++) {
    await prisma.slotBooking.create({
      data: {
        id: generateUUID(),
        slotId: slots[0].id,
        tripId: trips[i].id,
        driverId: drivers[i].id,
        containerId: readyContainers[i].id,
        status: 'CONFIRMED',
      },
    });
  }

  console.log('✅ Created slot bookings');

  // Create trip metrics
  for (const trip of trips) {
    await prisma.tripMetrics.create({
      data: {
        id: generateUUID(),
        tripId: trip.id,
        totalDistance: Math.floor(Math.random() * 50) + 10,
        estimatedDuration: Math.floor(Math.random() * 60) + 30,
        fuelConsumption: (Math.random() * 10 + 5).toFixed(2),
        carbonFootprint: (Math.random() * 5 + 2).toFixed(2),
      },
    });
  }

  console.log('✅ Created trip metrics');

  // Create trip events
  for (const trip of trips) {
    await prisma.tripEvent.create({
      data: {
        id: generateUUID(),
        tripId: trip.id,
        type: 'TRIP_STARTED',
        location: { lat: 33.7490, lng: -118.1910 },
        metadata: { reason: 'Trip initiated by dispatcher' },
      },
    });
  }

  console.log('✅ Created trip events');

  // Create system events
  await prisma.event.create({
    data: {
      id: generateUUID(),
      type: 'VESSEL_ARRIVAL',
      refId: vessel1.id,
      meta: { terminal: terminal1.code, vessel: vessel1.name },
    },
  });

  await prisma.event.create({
    data: {
      id: generateUUID(),
      type: 'CNTR_READY',
      refId: readyContainers[0].id,
      meta: { container: readyContainers[0].cntrNo, terminal: terminal1.code },
    },
  });

  console.log('✅ Created system events');

  // Create system alerts
  await prisma.systemAlert.create({
    data: {
      id: generateUUID(),
      type: 'CAPACITY_WARNING',
      severity: 'MEDIUM',
      message: 'Terminal LAX approaching capacity limit',
      refId: terminal1.id,
      metadata: { currentCapacity: 85, maxCapacity: 100 },
    },
  });

  await prisma.systemAlert.create({
    data: {
      id: generateUUID(),
      type: 'DELAY_ALERT',
      severity: 'HIGH',
      message: 'Container MSCU0000031234 delayed due to customs hold',
      refId: holdContainer1?.id,
      metadata: { delayReason: 'CUSTOMS_HOLD', estimatedDelay: '2 hours' },
    },
  });

  console.log('✅ Created system alerts');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });