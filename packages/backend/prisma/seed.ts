import { PrismaClient, UserRole, ContainerStatus, SlotStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create carriers
  const carrier1 = await prisma.carrier.create({
    data: {
      name: 'Pacific Logistics',
      code: 'PAC001',
      address: '1234 Harbor Blvd, Los Angeles, CA',
      phone: '+1-555-0123',
      email: 'dispatch@pacificlogistics.com',
    },
  });

  const carrier2 = await prisma.carrier.create({
    data: {
      name: 'Ocean Express',
      code: 'OCE001',
      address: '5678 Port Ave, Long Beach, CA',
      phone: '+1-555-0456',
      email: 'ops@oceanexpress.com',
    },
  });

  // Create terminals
  const terminal1 = await prisma.terminal.create({
    data: {
      name: 'Los Angeles Container Terminal',
      code: 'LACT',
      address: '2002 Navy Way, Los Angeles, CA 90731',
      latitude: 33.7492,
      longitude: -118.2661,
      timezone: 'America/Los_Angeles',
      capacity: 500,
    },
  });

  const terminal2 = await prisma.terminal.create({
    data: {
      name: 'Long Beach Container Terminal',
      code: 'LBCT',
      address: '1171 Pier A, Long Beach, CA 90802',
      latitude: 33.7547,
      longitude: -118.2261,
      timezone: 'America/Los_Angeles',
      capacity: 750,
    },
  });

  // Create trucks
  const truck1 = await prisma.truck.create({
    data: {
      plateNumber: 'CA-TRK-001',
      chassisNumber: 'CH001ABC123',
      carrierId: carrier1.id,
      maxWeight: 80000,
    },
  });

  const truck2 = await prisma.truck.create({
    data: {
      plateNumber: 'CA-TRK-002',
      chassisNumber: 'CH002DEF456',
      carrierId: carrier2.id,
      maxWeight: 80000,
    },
  });

  // Create users and drivers
  const user1 = await prisma.user.create({
    data: {
      email: 'john.driver@example.com',
      password: '$2b$10$hashedpassword1', // In real app, hash the password
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1-555-1001',
      role: UserRole.DRIVER,
    },
  });

  const driver1 = await prisma.driver.create({
    data: {
      userId: user1.id,
      licenseNumber: 'CDL123456789',
      truckId: truck1.id,
      carrierId: carrier1.id,
      isAvailable: true,
      currentLat: 33.7492,
      currentLng: -118.2661,
      lastSeen: new Date(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.driver@example.com',
      password: '$2b$10$hashedpassword2',
      firstName: 'Jane',
      lastName: 'Wilson',
      phone: '+1-555-1002',
      role: UserRole.DRIVER,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      userId: user2.id,
      licenseNumber: 'CDL987654321',
      truckId: truck2.id,
      carrierId: carrier2.id,
      isAvailable: true,
      currentLat: 33.7547,
      currentLng: -118.2261,
      lastSeen: new Date(),
    },
  });

  // Create dispatcher user
  const dispatcher = await prisma.user.create({
    data: {
      email: 'dispatcher@example.com',
      password: '$2b$10$hashedpassword3',
      firstName: 'Mike',
      lastName: 'Johnson',
      phone: '+1-555-2001',
      role: UserRole.DISPATCHER,
    },
  });

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: '$2b$10$hashedpassword4',
      firstName: 'Sarah',
      lastName: 'Admin',
      phone: '+1-555-3001',
      role: UserRole.ADMIN,
    },
  });

  // Create vessels
  const vessel1 = await prisma.vessel.create({
    data: {
      name: 'MSC OSCAR',
      imo: 'IMO9744465',
      terminalId: terminal1.id,
      eta: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      etd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    },
  });

  const vessel2 = await prisma.vessel.create({
    data: {
      name: 'EVER GIVEN',
      imo: 'IMO9811000',
      terminalId: terminal2.id,
      eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      etd: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // In 4 days
    },
  });

  // Create slots
  const slots = [];
  for (let block = 1; block <= 5; block++) {
    for (let row = 1; row <= 10; row++) {
      for (let tier = 1; tier <= 3; tier++) {
        const slot = await prisma.slot.create({
          data: {
            number: `${block}-${row}-${tier}`,
            terminalId: Math.random() > 0.5 ? terminal1.id : terminal2.id,
            status: SlotStatus.AVAILABLE,
            block: block.toString(),
            row: row.toString(),
            tier: tier.toString(),
          },
        });
        slots.push(slot);
      }
    }
  }

  // Create containers
  const containerNumbers = [
    'MSCU1234567',
    'GESU2345678',
    'TCLU3456789',
    'HJMU4567890',
    'CMAU5678901',
    'OOLU6789012',
    'COSU7890123',
    'FCIU8901234',
    'APLU9012345',
    'TEXU0123456',
  ];

  const containers = [];
  for (let i = 0; i < containerNumbers.length; i++) {
    const container = await prisma.container.create({
      data: {
        number: containerNumbers[i],
        size: Math.random() > 0.7 ? 40 : 20,
        type: Math.random() > 0.8 ? 'REEFER' : 'DRY',
        status: ContainerStatus.AVAILABLE,
        vesselId: Math.random() > 0.5 ? vessel1.id : vessel2.id,
        slotId: slots[i * 10]?.id,
        weight: Math.random() * 30000 + 5000, // 5-35 tons
        cargoDescription: `Cargo ${i + 1}`,
        isEmptyReturn: Math.random() > 0.7,
        availableFrom: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000),
        demurrageDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        detentionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
    containers.push(container);
  }

  console.log('✅ Database seeding completed!');
  console.log(`Created:`);
  console.log(`- ${2} carriers`);
  console.log(`- ${2} terminals`);
  console.log(`- ${2} trucks`);
  console.log(`- ${4} users (2 drivers, 1 dispatcher, 1 admin)`);
  console.log(`- ${2} drivers`);
  console.log(`- ${2} vessels`);
  console.log(`- ${slots.length} slots`);
  console.log(`- ${containers.length} containers`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });