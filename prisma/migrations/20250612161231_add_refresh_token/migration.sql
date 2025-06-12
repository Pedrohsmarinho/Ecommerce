-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifyTokenExpires" TIMESTAMP(3),
ADD COLUMN     "refreshToken" TEXT;
