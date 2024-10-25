/*
  Warnings:

  - You are about to drop the column `archived` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `blocked` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `_UnreadChats` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_UnreadChats" DROP CONSTRAINT "_UnreadChats_A_fkey";

-- DropForeignKey
ALTER TABLE "_UnreadChats" DROP CONSTRAINT "_UnreadChats_B_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "archived",
DROP COLUMN "blocked",
ADD COLUMN     "lastMessage" TEXT,
ADD COLUMN     "unreadCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "lastMessageAt" DROP NOT NULL,
ALTER COLUMN "lastMessageAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "message",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "receiverId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_UnreadChats";

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
