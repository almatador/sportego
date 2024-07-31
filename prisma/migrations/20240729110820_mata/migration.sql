/*
  Warnings:

  - You are about to drop the column `adminId` on the `permission` table. All the data in the column will be lost.
  - Added the required column `permissionsId` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `permission` DROP FOREIGN KEY `Permission_adminId_fkey`;

-- AlterTable
ALTER TABLE `admin` ADD COLUMN `permissionsId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `permission` DROP COLUMN `adminId`;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_permissionsId_fkey` FOREIGN KEY (`permissionsId`) REFERENCES `Permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
