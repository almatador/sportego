-- DropForeignKey
ALTER TABLE `admin` DROP FOREIGN KEY `Admin_permissionsId_fkey`;

-- AlterTable
ALTER TABLE `admin` MODIFY `permissionsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_permissionsId_fkey` FOREIGN KEY (`permissionsId`) REFERENCES `Permission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
