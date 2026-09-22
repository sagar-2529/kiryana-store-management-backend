-- Keep a bill for audit/history, but prevent it from affecting active sales figures
-- after a cancellation.
CREATE TYPE "PurchaseStatus" AS ENUM ('ACTIVE', 'CANCELLED');

ALTER TABLE "purchases"
ADD COLUMN "status" "PurchaseStatus" NOT NULL DEFAULT 'ACTIVE';
