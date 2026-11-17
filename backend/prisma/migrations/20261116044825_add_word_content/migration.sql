/*
  Warnings:

  - Added the required column `hint` to the `words` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_description` to the `words` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "words" ADD COLUMN     "hint" TEXT NOT NULL,
ADD COLUMN     "image_description" TEXT NOT NULL;
