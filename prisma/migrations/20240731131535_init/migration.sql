-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'NEW');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "confPassword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cityId" INTEGER NOT NULL,
    "countryId" INTEGER NOT NULL,
    "status" "UserStatus" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trainer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "countryId" INTEGER NOT NULL,

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drnutrition" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "countryId" INTEGER NOT NULL,

    CONSTRAINT "drnutrition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secretKeyadmin" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER,
    "token" TEXT NOT NULL,

    CONSTRAINT "secretKeyadmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secretKeydrnutrition" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "drnutritionId" INTEGER,

    CONSTRAINT "secretKeydrnutrition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secretKeyTrainer" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "TrainerId" INTEGER NOT NULL,

    CONSTRAINT "secretKeyTrainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secretKeyuser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "token" TEXT NOT NULL,

    CONSTRAINT "secretKeyuser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "countryName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "cityName" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdminPermissions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_email_key" ON "Trainer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "drnutrition_email_key" ON "drnutrition"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_AdminPermissions_AB_unique" ON "_AdminPermissions"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminPermissions_B_index" ON "_AdminPermissions"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drnutrition" ADD CONSTRAINT "drnutrition_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drnutrition" ADD CONSTRAINT "drnutrition_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretKeyadmin" ADD CONSTRAINT "secretKeyadmin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretKeydrnutrition" ADD CONSTRAINT "secretKeydrnutrition_drnutritionId_fkey" FOREIGN KEY ("drnutritionId") REFERENCES "drnutrition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretKeyTrainer" ADD CONSTRAINT "secretKeyTrainer_TrainerId_fkey" FOREIGN KEY ("TrainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretKeyuser" ADD CONSTRAINT "secretKeyuser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminPermissions" ADD CONSTRAINT "_AdminPermissions_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminPermissions" ADD CONSTRAINT "_AdminPermissions_B_fkey" FOREIGN KEY ("B") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
