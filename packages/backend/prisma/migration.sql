-- DriverOS Database Migration
-- Execute this in Supabase SQL Editor

-- Create enums
CREATE TYPE "TerminalStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');
CREATE TYPE "VesselStatus" AS ENUM ('ARRIVING', 'BERTHED', 'DISCHARGING', 'DEPARTED');
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'ARRIVED', 'DEPARTED', 'DELAYED', 'CANCELLED');
CREATE TYPE "ContainerType" AS ENUM ('TWENTY_GP', 'FORTY_HC', 'FORTY_GP', 'FORTY_FIVE_HC');
CREATE TYPE "ContainerStatus" AS ENUM ('NOT_READY', 'READY', 'PICKED', 'DELIVERED', 'HOLD');
CREATE TYPE "HoldReason" AS ENUM ('CUSTOMS_HOLD', 'DOCUMENTATION', 'CHASSIS_SHORTAGE', 'GATE_BLOCKED', 'WEATHER', 'MAINTENANCE', 'OTHER');
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'FULL', 'CLOSED', 'MAINTENANCE');
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED', 'FAILED');
CREATE TYPE "DriverStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ON_TRIP');
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFF_DUTY', 'SICK_LEAVE');
CREATE TYPE "TruckType" AS ENUM ('DRY_VAN', 'REEFER', 'FLATBED', 'CHASSIS');
CREATE TYPE "TruckStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE');
CREATE TYPE "TripStatus" AS ENUM ('ASSIGNED', 'STARTED', 'EN_ROUTE', 'GATE_READY', 'AT_GATE', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE "TripEventType" AS ENUM ('TRIP_STARTED', 'ETA_UPDATED', 'ARRIVED_AT_GATE', 'GATE_PROCESSING', 'CONTAINER_PICKED', 'TRIP_COMPLETED', 'TRIP_FAILED', 'DELAY_DETECTED');
CREATE TYPE "EventType" AS ENUM ('VESSEL_ARRIVAL', 'CNTR_READY', 'HOLD_ADDED', 'HOLD_REMOVED', 'TRIP_ASSIGNED', 'TRIP_STARTED', 'TRIP_COMPLETED', 'TRIP_FAILED', 'SLOT_BOOKED', 'SLOT_CANCELLED', 'DRIVER_AVAILABLE', 'DRIVER_BUSY', 'SYSTEM_ALERT', 'METRICS_UPDATED');
CREATE TYPE "AlertType" AS ENUM ('CAPACITY_WARNING', 'DELAY_ALERT', 'SYSTEM_ERROR', 'SECURITY_ALERT', 'PERFORMANCE_ISSUE');
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Create terminals table
CREATE TABLE "terminals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "status" "TerminalStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "terminals_pkey" PRIMARY KEY ("id")
);

-- Create terminal_settings table
CREATE TABLE "terminal_settings" (
    "id" TEXT NOT NULL,
    "terminal_id" TEXT NOT NULL,
    "slot_duration" INTEGER NOT NULL DEFAULT 60,
    "max_slots_per_window" INTEGER NOT NULL DEFAULT 10,
    "operating_hours" JSONB NOT NULL,
    "closed_days" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "special_rules" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terminal_settings_pkey" PRIMARY KEY ("id")
);

-- Create vessels table
CREATE TABLE "vessels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eta" TIMESTAMP(3) NOT NULL,
    "terminal_id" TEXT NOT NULL,
    "status" "VesselStatus" NOT NULL DEFAULT 'ARRIVING',
    "container_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vessels_pkey" PRIMARY KEY ("id")
);

-- Create vessel_schedules table
CREATE TABLE "vessel_schedules" (
    "id" TEXT NOT NULL,
    "vessel_id" TEXT NOT NULL,
    "terminal_id" TEXT NOT NULL,
    "eta" TIMESTAMP(3) NOT NULL,
    "etd" TIMESTAMP(3) NOT NULL,
    "actual_arrival" TIMESTAMP(3),
    "actual_departure" TIMESTAMP(3),
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vessel_schedules_pkey" PRIMARY KEY ("id")
);

-- Create containers table
CREATE TABLE "containers" (
    "id" TEXT NOT NULL,
    "cntr_no" TEXT NOT NULL,
    "type" "ContainerType" NOT NULL,
    "line" TEXT NOT NULL,
    "ready_at" TIMESTAMP(3),
    "hold" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContainerStatus" NOT NULL DEFAULT 'NOT_READY',
    "terminal_id" TEXT NOT NULL,
    "vessel_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "containers_pkey" PRIMARY KEY ("id")
);

-- Create container_holds table
CREATE TABLE "container_holds" (
    "id" TEXT NOT NULL,
    "container_id" TEXT NOT NULL,
    "reason" "HoldReason" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "container_holds_pkey" PRIMARY KEY ("id")
);

-- Create slots table
CREATE TABLE "slots" (
    "id" TEXT NOT NULL,
    "terminal_id" TEXT NOT NULL,
    "window_start" TIMESTAMP(3) NOT NULL,
    "window_end" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "booked" INTEGER NOT NULL DEFAULT 0,
    "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- Create drivers table
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" "DriverStatus" NOT NULL DEFAULT 'ACTIVE',
    "license_number" TEXT NOT NULL,
    "license_expiry" TIMESTAMP(3) NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- Create driver_availability table
CREATE TABLE "driver_availability" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_availability_pkey" PRIMARY KEY ("id")
);

-- Create driver_metrics table
CREATE TABLE "driver_metrics" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "total_trips" INTEGER NOT NULL DEFAULT 0,
    "completed_trips" INTEGER NOT NULL DEFAULT 0,
    "failed_trips" INTEGER NOT NULL DEFAULT 0,
    "average_turn_time" INTEGER NOT NULL DEFAULT 0,
    "total_distance" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_metrics_pkey" PRIMARY KEY ("id")
);

-- Create trucks table
CREATE TABLE "trucks" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "type" "TruckType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "TruckStatus" NOT NULL DEFAULT 'AVAILABLE',
    "last_maintenance" TIMESTAMP(3),
    "next_maintenance" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "trucks_pkey" PRIMARY KEY ("id")
);

-- Create truck_locations table
CREATE TABLE "truck_locations" (
    "id" TEXT NOT NULL,
    "truck_id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,

    CONSTRAINT "truck_locations_pkey" PRIMARY KEY ("id")
);

-- Create trips table
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "container_id" TEXT NOT NULL,
    "pickup_slot_id" TEXT,
    "return_empty" BOOLEAN NOT NULL DEFAULT false,
    "status" "TripStatus" NOT NULL DEFAULT 'ASSIGNED',
    "eta" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "turn_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- Create slot_bookings table
CREATE TABLE "slot_bookings" (
    "id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "container_id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slot_bookings_pkey" PRIMARY KEY ("id")
);

-- Create trip_metrics table
CREATE TABLE "trip_metrics" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "total_distance" INTEGER NOT NULL DEFAULT 0,
    "estimated_duration" INTEGER NOT NULL DEFAULT 0,
    "actual_duration" INTEGER,
    "fuel_consumption" DOUBLE PRECISION,
    "carbon_footprint" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_metrics_pkey" PRIMARY KEY ("id")
);

-- Create trip_events table
CREATE TABLE "trip_events" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "type" "TripEventType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_events_pkey" PRIMARY KEY ("id")
);

-- Create events table
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "ref_id" TEXT,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- Create system_alerts table
CREATE TABLE "system_alerts" (
    "id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "ref_id" TEXT,
    "metadata" JSONB,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_alerts_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "terminals_code_key" ON "terminals"("code");
CREATE UNIQUE INDEX "terminal_settings_terminal_id_key" ON "terminal_settings"("terminal_id");
CREATE UNIQUE INDEX "containers_cntr_no_key" ON "containers"("cntr_no");
CREATE UNIQUE INDEX "slots_terminal_id_window_start_window_end_key" ON "slots"("terminal_id", "window_start", "window_end");
CREATE UNIQUE INDEX "driver_metrics_driver_id_key" ON "driver_metrics"("driver_id");
CREATE UNIQUE INDEX "trucks_driver_id_key" ON "trucks"("driver_id");
CREATE UNIQUE INDEX "truck_locations_truck_id_key" ON "truck_locations"("truck_id");
CREATE UNIQUE INDEX "trip_metrics_trip_id_key" ON "trip_metrics"("trip_id");

-- Create foreign key constraints
ALTER TABLE "terminal_settings" ADD CONSTRAINT "terminal_settings_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "terminals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "terminals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vessel_schedules" ADD CONSTRAINT "vessel_schedules_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "vessels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vessel_schedules" ADD CONSTRAINT "vessel_schedules_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "terminals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "containers" ADD CONSTRAINT "containers_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "terminals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "containers" ADD CONSTRAINT "containers_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "vessels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "container_holds" ADD CONSTRAINT "container_holds_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "slots" ADD CONSTRAINT "slots_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "terminals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_truck_id_fkey" FOREIGN KEY ("id") REFERENCES "trucks"("driver_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "driver_availability" ADD CONSTRAINT "driver_availability_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "driver_metrics" ADD CONSTRAINT "driver_metrics_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "truck_locations" ADD CONSTRAINT "truck_locations_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "trucks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_pickup_slot_id_fkey" FOREIGN KEY ("pickup_slot_id") REFERENCES "slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trip_metrics" ADD CONSTRAINT "trip_metrics_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trip_events" ADD CONSTRAINT "trip_events_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Row Level Security (RLS)
ALTER TABLE "terminals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "terminal_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vessels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vessel_schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "containers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "container_holds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "slots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "drivers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "driver_availability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "driver_metrics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trucks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "truck_locations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trips" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "slot_bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trip_metrics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trip_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "system_alerts" ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now, customize later)
CREATE POLICY "Allow all on terminals" ON "terminals" FOR ALL USING (true);
CREATE POLICY "Allow all on terminal_settings" ON "terminal_settings" FOR ALL USING (true);
CREATE POLICY "Allow all on vessels" ON "vessels" FOR ALL USING (true);
CREATE POLICY "Allow all on vessel_schedules" ON "vessel_schedules" FOR ALL USING (true);
CREATE POLICY "Allow all on containers" ON "containers" FOR ALL USING (true);
CREATE POLICY "Allow all on container_holds" ON "container_holds" FOR ALL USING (true);
CREATE POLICY "Allow all on slots" ON "slots" FOR ALL USING (true);
CREATE POLICY "Allow all on drivers" ON "drivers" FOR ALL USING (true);
CREATE POLICY "Allow all on driver_availability" ON "driver_availability" FOR ALL USING (true);
CREATE POLICY "Allow all on driver_metrics" ON "driver_metrics" FOR ALL USING (true);
CREATE POLICY "Allow all on trucks" ON "trucks" FOR ALL USING (true);
CREATE POLICY "Allow all on truck_locations" ON "truck_locations" FOR ALL USING (true);
CREATE POLICY "Allow all on trips" ON "trips" FOR ALL USING (true);
CREATE POLICY "Allow all on slot_bookings" ON "slot_bookings" FOR ALL USING (true);
CREATE POLICY "Allow all on trip_metrics" ON "trip_metrics" FOR ALL USING (true);
CREATE POLICY "Allow all on trip_events" ON "trip_events" FOR ALL USING (true);
CREATE POLICY "Allow all on events" ON "events" FOR ALL USING (true);
CREATE POLICY "Allow all on system_alerts" ON "system_alerts" FOR ALL USING (true);
