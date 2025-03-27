-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('REVIEW', 'FEEDBACK', 'BUG', 'SUGGESTION');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "syncStatus" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "type" "ReviewType" NOT NULL DEFAULT 'REVIEW',
    "fullname" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Chat_user2Id_user1Id_id_idx" ON "Chat"("user2Id", "user1Id", "id");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
