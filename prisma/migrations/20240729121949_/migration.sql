/*
  Warnings:

  - You are about to drop the column `permissionsId` on the `admin` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `admin` DROP FOREIGN KEY `Admin_permissionsId_fkey`;

-- AlterTable
ALTER TABLE `admin` DROP COLUMN `permissionsId`;

-- CreateTable
CREATE TABLE `_AdminPermissions` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AdminPermissions_AB_unique`(`A`, `B`),
    INDEX `_AdminPermissions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_AdminPermissions` ADD CONSTRAINT `_AdminPermissions_A_fkey` FOREIGN KEY (`A`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AdminPermissions` ADD CONSTRAINT `_AdminPermissions_B_fkey` FOREIGN KEY (`B`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
