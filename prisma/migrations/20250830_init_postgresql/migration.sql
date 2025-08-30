-- CreateEnum
CREATE TYPE "Category" AS ENUM ('TECH_PRODUCT', 'RESEARCH_SCIENCE', 'BUSINESS_SOCIETY');

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "category" "Category" NOT NULL,
    "source" TEXT NOT NULL,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppMetadata" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppMetadata_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "NewsItem_category_idx" ON "NewsItem"("category");

-- CreateIndex
CREATE INDEX "NewsItem_publishedAt_idx" ON "NewsItem"("publishedAt");

-- CreateIndex
CREATE INDEX "NewsItem_rating_idx" ON "NewsItem"("rating");