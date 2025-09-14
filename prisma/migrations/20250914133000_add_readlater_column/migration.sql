-- Add readLater column to NewsItem table
ALTER TABLE "NewsItem" ADD COLUMN "readLater" BOOLEAN NOT NULL DEFAULT false;

-- Create index for readLater column
CREATE INDEX "NewsItem_readLater_idx" ON "NewsItem"("readLater");