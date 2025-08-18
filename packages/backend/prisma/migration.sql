-- DriverOS Database Migration
-- Execute this in Supabase SQL Editor
-- This migration is idempotent and can be run multiple times safely

-- Create enums with existence checks
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'terminalstatus' OR typname = 'TerminalStatus') THEN
        CREATE TYPE "TerminalStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vesselstatus' OR typname = 'VesselStatus') THEN
        CREATE TYPE "VesselStatus" AS ENUM ('ARRIVING', 'BERTHED', 'DISCHARGING', 'DEPARTED');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedulestatus' OR typname = 'ScheduleStatus') THEN
        CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'ARRIVED', 'DEPARTED', 'DELAYED', 'CANCELLED');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'containertype' OR typname = 'ContainerType') THEN
        CREATE TYPE "ContainerType" AS ENUM ('TWENTY_GP', 'FORTY_HC', 'FORTY_GP', 'FORTY_FIVE_HC');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'containerstatus' OR typname = 'ContainerStatus') THEN
        CREATE TYPE "ContainerStatus" AS ENUM ('NOT_READY', 'READY', 'PICKED', 'DELIVERED', 'HOLD');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'holdreason' OR typname = 'HoldReason') THEN
        CREATE TYPE "HoldReason" AS ENUM ('CUSTOMS_HOLD', 'DOCUMENTATION', 'CHASSIS_SHORTAGE', 'GATE_BLOCKED', 'WEATHER', 'MAINTENANCE', 'OTHER');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'slotstatus' OR typname = 'SlotStatus') THEN
        CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'FULL', 'CLOSED', 'MAINTENANCE');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bookingstatus' OR typname = 'BookingStatus') THEN
        CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED', 'FAILED');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'driverstatus' OR typname = 'DriverStatus') THEN
        CREATE TYPE "DriverStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ON_TRIP');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'availabilitystatus' OR typname = 'AvailabilityStatus') THEN
        CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFF_DUTY', 'SICK_LEAVE');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trucktype' OR typname = 'TruckType') THEN
        CREATE TYPE "TruckType" AS ENUM ('DRY_VAN', 'REEFER', 'FLATBED', 'CHASSIS');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'truckstatus' OR typname = 'TruckStatus') THEN
        CREATE TYPE "TruckStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tripstatus' OR typname = 'TripStatus') THEN
        CREATE TYPE "TripStatus" AS ENUM ('ASSIGNED', 'STARTED', 'EN_ROUTE', 'GATE_READY', 'AT_GATE', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'triptype' OR typname = 'TripEventType') THEN
        CREATE TYPE "TripEventType" AS ENUM ('TRIP_STARTED', 'ETA_UPDATED', 'ARRIVED_AT_GATE', 'GATE_PROCESSING', 'CONTAINER_PICKED', 'TRIP_COMPLETED', 'TRIP_FAILED', 'DELAY_DETECTED');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'eventtype' OR typname = 'EventType') THEN
        CREATE TYPE "EventType" AS ENUM ('VESSEL_ARRIVAL', 'CNTR_READY', 'HOLD_ADDED', 'HOLD_REMOVED', 'TRIP_ASSIGNED', 'TRIP_STARTED', 'TRIP_COMPLETED', 'TRIP_FAILED', 'SLOT_BOOKED', 'SLOT_CANCELLED', 'DRIVER_AVAILABLE', 'DRIVER_BUSY', 'SYSTEM_ALERT', 'METRICS_UPDATED');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alerttype' OR typname = 'AlertType') THEN
        CREATE TYPE "AlertType" AS ENUM ('CAPACITY_WARNING', 'DELAY_ALERT', 'SYSTEM_ERROR', 'SECURITY_ALERT', 'PERFORMANCE_ISSUE');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alertseverity' OR typname = 'AlertSeverity') THEN
        CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
    END IF;
END $$;

-- Create tables with existence checks
-- Note: This migration is now idempotent and can be run multiple times safely
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'terminals') THEN
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
    END IF;
END $$;

-- Create terminal_settings table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'terminal_settings') THEN
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
    END IF;
END $$;

-- Create vessels table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vessels') THEN
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
    END IF;
END $$;

-- Create vessel_schedules table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vessel_schedules') THEN
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
    END IF;
END $$;

-- Create containers table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'containers') THEN
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
    END IF;
END $$;

-- Create container_holds table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'container_holds') THEN
        CREATE TABLE "container_holds" (
            "id" TEXT NOT NULL,
            "container_id" TEXT NOT NULL,
            "reason" "HoldReason" NOT NULL,
            "description" TEXT,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "resolved_at" TIMESTAMP(3),

            CONSTRAINT "container_holds_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- Create slots table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'slots') THEN
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
    END IF;
END $$;

-- Create drivers table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
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
    END IF;
END $$;

-- Create driver_availability table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'driver_availability') THEN
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
    END IF;
END $$;

-- Create driver_metrics table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'driver_metrics') THEN
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
    END IF;
END $$;

-- Create trucks table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trucks') THEN
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
    END IF;
END $$;

-- Create truck_locations table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'truck_locations') THEN
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
    END IF;
END $$;

-- Create trips table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trips') THEN
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
    END IF;
END $$;

-- Create slot_bookings table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'slot_bookings') THEN
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
    END IF;
END $$;

-- Create trip_metrics table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trip_metrics') THEN
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
    END IF;
END $$;

-- Create trip_events table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trip_events') THEN
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
    END IF;
END $$;

-- Create events table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
        CREATE TABLE "events" (
            "id" TEXT NOT NULL,
            "type" "EventType" NOT NULL,
            "ref_id" TEXT,
            "meta" JSONB,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "events_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- Create system_alerts table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_alerts') THEN
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
    END IF;
END $$;

-- Create unique constraints with IF NOT EXISTS
CREATE UNIQUE INDEX IF NOT EXISTS "terminals_code_key" ON "terminals"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "terminal_settings_terminal_id_key" ON "terminal_settings"("terminal_id");
CREATE UNIQUE INDEX IF NOT EXISTS "containers_cntr_no_key" ON "containers"("cntr_no");
CREATE UNIQUE INDEX IF NOT EXISTS "slots_terminal_id_window_start_window_end_key" ON "slots"("terminal_id", "window_start", "window_end");
CREATE UNIQUE INDEX IF NOT EXISTS "driver_metrics_driver_id_key" ON "driver_metrics"("driver_id");
CREATE UNIQUE INDEX IF NOT EXISTS "trucks_driver_id_key" ON "trucks"("driver_id");
CREATE UNIQUE INDEX IF NOT EXISTS "truck_locations_truck_id_key" ON "truck_locations"("truck_id");
CREATE UNIQUE INDEX IF NOT EXISTS "trip_metrics_trip_id_key" ON "trip_metrics"("trip_id");

-- Create foreign key constraints with existence checks
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'terminal_settings_terminal_id_fkey' AND conrelid = 'terminal_settings'::regclass) THEN
        ALTER TABLE "terminal_settings" ADD CONSTRAINT "terminal_settings_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "terminals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vessels_terminal_id_fkey' AND conrelid = 'vessels'::regclass) THEN
        ALTER TABLE "vessels" ADD CONSTRAINT "vessels_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "terminals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vessel_schedules_vessel_id_fkey' AND conrelid = 'vessel_schedules'::regclass) THEN
        ALTER TABLE "vessel_schedules" ADD CONSTRAINT "vessel_schedules_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "vessels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vessel_schedules_terminal_id_fkey' AND conrelid = 'vessel_schedules'::regclass) THEN
        ALTER TABLE "vessel_schedules" ADD CONSTRAINT "vessel_schedules_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "terminals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'containers_terminal_id_fkey' AND conrelid = 'containers'::regclass) THEN
        ALTER TABLE "containers" ADD CONSTRAINT "containers_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "terminals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'containers_vessel_id_fkey' AND conrelid = 'containers'::regclass) THEN
        ALTER TABLE "containers" ADD CONSTRAINT "containers_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "vessels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'container_holds_container_id_fkey' AND conrelid = 'container_holds'::regclass) THEN
        ALTER TABLE "container_holds" ADD CONSTRAINT "container_holds_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'slots_terminal_id_fkey' AND conrelid = 'slots'::regclass) THEN
        ALTER TABLE "slots" ADD CONSTRAINT "slots_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "terminals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Remove the incorrect foreign key constraint - drivers should not have a foreign key to trucks
-- The one-to-one relationship is implemented through trucks.driver_id only

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'driver_availability_driver_id_fkey' AND conrelid = 'driver_availability'::regclass) THEN
        ALTER TABLE "driver_availability" ADD CONSTRAINT "driver_availability_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'driver_metrics_driver_id_fkey' AND conrelid = 'driver_metrics'::regclass) THEN
        ALTER TABLE "driver_metrics" ADD CONSTRAINT "driver_metrics_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trucks_driver_id_fkey' AND conrelid = 'trucks'::regclass) THEN
        ALTER TABLE "trucks" ADD CONSTRAINT "trucks_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'truck_locations_truck_id_fkey' AND conrelid = 'truck_locations'::regclass) THEN
        ALTER TABLE "truck_locations" ADD CONSTRAINT "truck_locations_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "trucks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trips_driver_id_fkey' AND conrelid = 'trips'::regclass) THEN
        ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trips_container_id_fkey' AND conrelid = 'trips'::regclass) THEN
        ALTER TABLE "trips" ADD CONSTRAINT "trips_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trips_pickup_slot_id_fkey' AND conrelid = 'trips'::regclass) THEN
        ALTER TABLE "trips" ADD CONSTRAINT "trips_pickup_slot_id_fkey" FOREIGN KEY ("pickup_slot_id") REFERENCES "slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'slot_bookings_slot_id_fkey' AND conrelid = 'slot_bookings'::regclass) THEN
        ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'slot_bookings_trip_id_fkey' AND conrelid = 'slot_bookings'::regclass) THEN
        ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'slot_bookings_driver_id_fkey' AND conrelid = 'slot_bookings'::regclass) THEN
        ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'slot_bookings_container_id_fkey' AND conrelid = 'slot_bookings'::regclass) THEN
        ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trip_metrics_trip_id_fkey' AND conrelid = 'trip_metrics'::regclass) THEN
        ALTER TABLE "trip_metrics" ADD CONSTRAINT "trip_metrics_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trip_events_trip_id_fkey' AND conrelid = 'trip_events'::regclass) THEN
        ALTER TABLE "trip_events" ADD CONSTRAINT "trip_events_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Create roles table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        CREATE TABLE "roles" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "permissions" JSONB NOT NULL,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- Create profiles table that links to auth.users
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE "profiles" (
            "id" UUID NOT NULL,
            "email" TEXT NOT NULL,
            "first_name" TEXT NOT NULL,
            "last_name" TEXT NOT NULL,
            "role_id" TEXT NOT NULL,
            "is_active" BOOLEAN NOT NULL DEFAULT true,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(3) NOT NULL,
            "deleted_at" TIMESTAMP(3),

            CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES auth.users(id) ON DELETE CASCADE
        );
    END IF;
END $$;

-- Create unique constraints for roles and profiles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'roles_name_key' AND conrelid = 'roles'::regclass) THEN
        ALTER TABLE "roles" ADD CONSTRAINT "roles_name_key" UNIQUE ("name");
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key' AND conrelid = 'profiles'::regclass) THEN
        ALTER TABLE "profiles" ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");
    END IF;
END $$;

-- Add foreign key constraint for profiles -> roles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_id_fkey' AND conrelid = 'profiles'::regclass) THEN
        ALTER TABLE "profiles" ADD CONSTRAINT "profiles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

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
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now, customize later) with existence checks
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'terminals' AND policyname = 'Allow all on terminals') THEN
        EXECUTE 'CREATE POLICY "Allow all on terminals" ON "terminals" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'terminal_settings' AND policyname = 'Allow all on terminal_settings') THEN
        EXECUTE 'CREATE POLICY "Allow all on terminal_settings" ON "terminal_settings" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessels' AND policyname = 'Allow all on vessels') THEN
        EXECUTE 'CREATE POLICY "Allow all on vessels" ON "vessels" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vessel_schedules' AND policyname = 'Allow all on vessel_schedules') THEN
        EXECUTE 'CREATE POLICY "Allow all on vessel_schedules" ON "vessel_schedules" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'containers' AND policyname = 'Allow all on containers') THEN
        EXECUTE 'CREATE POLICY "Allow all on containers" ON "containers" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'container_holds' AND policyname = 'Allow all on container_holds') THEN
        EXECUTE 'CREATE POLICY "Allow all on container_holds" ON "container_holds" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'slots' AND policyname = 'Allow all on slots') THEN
        EXECUTE 'CREATE POLICY "Allow all on slots" ON "slots" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drivers' AND policyname = 'Allow all on drivers') THEN
        EXECUTE 'CREATE POLICY "Allow all on drivers" ON "drivers" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'driver_availability' AND policyname = 'Allow all on driver_availability') THEN
        EXECUTE 'CREATE POLICY "Allow all on driver_availability" ON "driver_availability" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'driver_metrics' AND policyname = 'Allow all on driver_metrics') THEN
        EXECUTE 'CREATE POLICY "Allow all on driver_metrics" ON "driver_metrics" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trucks' AND policyname = 'Allow all on trucks') THEN
        EXECUTE 'CREATE POLICY "Allow all on trucks" ON "trucks" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'truck_locations' AND policyname = 'Allow all on truck_locations') THEN
        EXECUTE 'CREATE POLICY "Allow all on truck_locations" ON "truck_locations" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Allow all on trips') THEN
        EXECUTE 'CREATE POLICY "Allow all on trips" ON "trips" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'slot_bookings' AND policyname = 'Allow all on slot_bookings') THEN
        EXECUTE 'CREATE POLICY "Allow all on slot_bookings" ON "slot_bookings" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_metrics' AND policyname = 'Allow all on trip_metrics') THEN
        EXECUTE 'CREATE POLICY "Allow all on trip_metrics" ON "trip_metrics" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_events' AND policyname = 'Allow all on trip_events') THEN
        EXECUTE 'CREATE POLICY "Allow all on trip_events" ON "trip_events" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Allow all on events') THEN
        EXECUTE 'CREATE POLICY "Allow all on events" ON "events" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_alerts' AND policyname = 'Allow all on system_alerts') THEN
        EXECUTE 'CREATE POLICY "Allow all on system_alerts" ON "system_alerts" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'Allow all on roles') THEN
        EXECUTE 'CREATE POLICY "Allow all on roles" ON "roles" FOR ALL USING (true)';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow all on profiles') THEN
        EXECUTE 'CREATE POLICY "Allow all on profiles" ON "profiles" FOR ALL USING (true)';
    END IF;
END $$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id TEXT;
BEGIN
    -- Get the default "Driver" role ID (or create it if it doesn't exist)
    SELECT id INTO default_role_id 
    FROM public.roles 
    WHERE name = 'Driver' 
    LIMIT 1;
    
    -- If no Driver role exists, create it
    IF default_role_id IS NULL THEN
        INSERT INTO public.roles (id, name, description, permissions, created_at, updated_at)
        VALUES (
            gen_random_uuid()::text,
            'Driver',
            'Default driver role',
            '["read"]'::jsonb,
            NOW(),
            NOW()
        )
        RETURNING id INTO default_role_id;
    END IF;
    
    -- Create profile for the new user
    INSERT INTO public.profiles (id, email, first_name, last_name, role_id, is_active, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        default_role_id,
        true,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle user profile updates when auth.users is updated
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile email when auth user email changes
    UPDATE public.profiles 
    SET 
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync profile when auth.users is updated
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
