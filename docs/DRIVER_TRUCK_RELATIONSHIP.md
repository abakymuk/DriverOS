# Driver-Truck Relationship Documentation

## Overview

The relationship between drivers and trucks in DriverOS is implemented as a **one-to-one relationship** with the following business rules:

- Each driver can be associated with **at most one truck** (optional relationship)
- Each truck **must be associated with exactly one driver** (required relationship)
- A driver drives a truck, and a truck is driven by a driver

## Database Implementation

### Schema Design

The relationship is implemented using a **single foreign key constraint** from the `trucks` table to the `drivers` table:

```sql
-- In trucks table
driver_id TEXT NOT NULL UNIQUE  -- Foreign key to drivers.id
```

### Prisma Schema

```prisma
model Driver {
  id           String       @id @default(cuid())
  name         String
  // ... other fields

  // Relations
  truck        Truck?       // Optional one-to-one relationship
  trips        Trip[]
  // ... other relations
}

model Truck {
  id              String     @id @default(cuid())
  driverId        String     @unique  // Foreign key with unique constraint
  plate           String
  // ... other fields

  // Relations
  driver   Driver         @relation(fields: [driverId], references: [id], onDelete: Cascade)
  location TruckLocation?
}
```

## Key Points

### 1. Foreign Key Location
- The foreign key `driverId` is in the `trucks` table
- This makes sense because a truck "belongs to" a driver
- The `@unique` constraint ensures one-to-one relationship

### 2. Optional vs Required
- **Driver → Truck**: Optional (`Truck?`) - A driver might not have a truck assigned
- **Truck → Driver**: Required (`driverId` NOT NULL) - Every truck must have a driver

### 3. Cascade Behavior
- When a driver is deleted, their truck is also deleted (`onDelete: Cascade`)
- This prevents orphaned trucks without drivers

## Data Creation Pattern

### In Seed File

```typescript
// 1. Create drivers first
const drivers = [];
for (let i = 0; i < 5; i++) {
  const driver = await prisma.driver.create({
    data: {
      id: generateUUID(),
      name: driverNames[i],
      // ... other fields
    },
  });
  drivers.push(driver);
}

// 2. Create trucks with driver references
const trucks = [];
for (let i = 0; i < 5; i++) {
  const driver = drivers[i];
  if (!driver) continue;
  
  const truck = await prisma.truck.create({
    data: {
      id: generateUUID(),
      driverId: driver.id,  // Link to driver
      plate: `CA${String(i + 1000).padStart(4, '0')}AB`,
      // ... other fields
    },
  });
  trucks.push(truck);
}
```

### In Application Code

```typescript
// Create a driver
const driver = await prisma.driver.create({
  data: {
    name: "John Smith",
    // ... other fields
  },
});

// Assign a truck to the driver
const truck = await prisma.truck.create({
  data: {
    driverId: driver.id,
    plate: "CA1234AB",
    // ... other fields
  },
});

// Query driver with their truck
const driverWithTruck = await prisma.driver.findUnique({
  where: { id: driver.id },
  include: { truck: true },
});

// Query truck with their driver
const truckWithDriver = await prisma.truck.findUnique({
  where: { id: truck.id },
  include: { driver: true },
});
```

## Business Logic Considerations

### 1. Driver Assignment
- When assigning a truck to a driver, check if the driver already has a truck
- When assigning a driver to a truck, ensure the truck doesn't already have a driver

### 2. Driver Removal
- When removing a driver, their truck should also be removed or reassigned
- Consider business rules for truck reassignment

### 3. Trip Assignment
- Trips are assigned to drivers, not trucks
- The truck is determined through the driver-truck relationship

## API Endpoints

### Driver Endpoints
- `GET /drivers` - List all drivers
- `GET /drivers/:id` - Get driver with truck information
- `POST /drivers` - Create new driver
- `PUT /drivers/:id` - Update driver
- `DELETE /drivers/:id` - Delete driver (cascades to truck)

### Truck Endpoints
- `GET /trucks` - List all trucks with driver information
- `GET /trucks/:id` - Get truck with driver information
- `POST /trucks` - Create new truck (requires driverId)
- `PUT /trucks/:id` - Update truck
- `DELETE /trucks/:id` - Delete truck

## Validation Rules

### Driver Validation
- Driver can exist without a truck
- Driver can have at most one truck

### Truck Validation
- Truck must have a valid driverId
- Truck cannot exist without a driver
- Truck can have at most one driver

## Migration Notes

The SQL migration correctly implements this relationship:

```sql
-- Create trucks table with driver_id foreign key
CREATE TABLE "trucks" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,  -- Foreign key to drivers
    -- ... other fields
    CONSTRAINT "trucks_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for one-to-one relationship
CREATE UNIQUE INDEX "trucks_driver_id_key" ON "trucks"("driver_id");

-- Create foreign key constraint
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_driver_id_fkey" 
    FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
```

## Summary

This one-to-one relationship design ensures:
- ✅ Data integrity through foreign key constraints
- ✅ Business logic compliance (truck must have driver)
- ✅ Clean API design
- ✅ Proper cascade behavior
- ✅ Efficient querying capabilities
