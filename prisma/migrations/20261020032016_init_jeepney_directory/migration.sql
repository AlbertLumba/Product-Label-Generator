-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('OUTBOUND', 'INBOUND');

-- CreateEnum
CREATE TYPE "PassengerType" AS ENUM ('REGULAR', 'STUDENT', 'SENIOR', 'PWD');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_variants" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "direction" "Direction" NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "geometry" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "stopId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_terminals" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "terminalId" TEXT NOT NULL,

    CONSTRAINT "route_terminals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fares" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "passengerType" "PassengerType" NOT NULL DEFAULT 'REGULAR',
    "amountMin" DECIMAL(8,2) NOT NULL,
    "amountMax" DECIMAL(8,2) NOT NULL,
    "source" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terminals" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terminals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stops" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "landmark" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_supabaseId_key" ON "admins"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "routes_code_key" ON "routes"("code");

-- CreateIndex
CREATE INDEX "routes_cityId_idx" ON "routes"("cityId");

-- CreateIndex
CREATE INDEX "routes_name_idx" ON "routes"("name");

-- CreateIndex
CREATE INDEX "route_variants_routeId_idx" ON "route_variants"("routeId");

-- CreateIndex
CREATE INDEX "route_variants_routeId_direction_idx" ON "route_variants"("routeId", "direction");

-- CreateIndex
CREATE INDEX "route_stops_variantId_idx" ON "route_stops"("variantId");

-- CreateIndex
CREATE INDEX "route_stops_stopId_idx" ON "route_stops"("stopId");

-- CreateIndex
CREATE UNIQUE INDEX "route_stops_variantId_sequence_key" ON "route_stops"("variantId", "sequence");

-- CreateIndex
CREATE INDEX "route_terminals_variantId_idx" ON "route_terminals"("variantId");

-- CreateIndex
CREATE INDEX "route_terminals_terminalId_idx" ON "route_terminals"("terminalId");

-- CreateIndex
CREATE UNIQUE INDEX "route_terminals_variantId_terminalId_key" ON "route_terminals"("variantId", "terminalId");

-- CreateIndex
CREATE INDEX "fares_routeId_passengerType_idx" ON "fares"("routeId", "passengerType");

-- CreateIndex
CREATE INDEX "fares_routeId_effectiveFrom_idx" ON "fares"("routeId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "terminals_cityId_idx" ON "terminals"("cityId");

-- CreateIndex
CREATE INDEX "terminals_name_idx" ON "terminals"("name");

-- CreateIndex
CREATE INDEX "terminals_area_idx" ON "terminals"("area");

-- CreateIndex
CREATE INDEX "stops_cityId_idx" ON "stops"("cityId");

-- CreateIndex
CREATE INDEX "stops_name_idx" ON "stops"("name");

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_variants" ADD CONSTRAINT "route_variants_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "route_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "stops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_terminals" ADD CONSTRAINT "route_terminals_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "route_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_terminals" ADD CONSTRAINT "route_terminals_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "terminals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fares" ADD CONSTRAINT "fares_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminals" ADD CONSTRAINT "terminals_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
