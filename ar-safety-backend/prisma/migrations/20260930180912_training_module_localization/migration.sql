/*
  Warnings:

  - You are about to drop the column `options` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `TrainingModule` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `TrainingModule` table. All the data in the column will be lost.
  - Changed the type of `correctAnswer` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'HI', 'SAT');

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "options",
DROP COLUMN "question",
DROP COLUMN "correctAnswer",
ADD COLUMN     "correctAnswer" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TrainingModule" DROP COLUMN "description",
DROP COLUMN "title";

-- CreateTable
CREATE TABLE "ModuleTranslation" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ModuleTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTranslation" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,

    CONSTRAINT "QuestionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModuleTranslation_moduleId_language_key" ON "ModuleTranslation"("moduleId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTranslation_questionId_language_key" ON "QuestionTranslation"("questionId", "language");

-- AddForeignKey
ALTER TABLE "ModuleTranslation" ADD CONSTRAINT "ModuleTranslation_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "TrainingModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTranslation" ADD CONSTRAINT "QuestionTranslation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
