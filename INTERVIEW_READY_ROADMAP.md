# Kiryana Store — interview-ready roadmap

## Honest project summary

This repository is a backend learning project built around a real kiryana-store
workflow: catalogue management, stock, bills, customers, and credit (udhaar).
Each `chapters/` directory is an incremental Express + Prisma snapshot, rather
than a single deployed application. Say this explicitly in an interview; it is
much stronger than presenting the course structure as a finished product.

## Strong resume bullet

Built a Node.js, Express, PostgreSQL and Prisma backend for a family retail
store, modelling products, unit-based inventory, invoices, customer credit and
an auditable credit ledger. Used database transactions to keep stock, sales and
credit balances consistent; added JWT-protected admin workflows and validation.

## The production consolidation to do next

1. Create a single `src/` application by promoting the most complete later
   chapters, rather than keeping multiple chapter servers.
2. Put authentication middleware on every store-management route and scope
   categories to the authenticated `adminId`.
3. Add a dashboard: today’s sales, low-stock SKUs, total receivables and recent
   credit payments. Only count purchases where `status = ACTIVE`.
4. Add a supplier/purchase-order module, barcode support, cash-drawer closing,
   returns, and role-based access for owner/cashier.
5. Use integer paise for money or a Decimal-safe helper end-to-end; JavaScript
   `Number` is convenient but can introduce rounding errors in accounting.
6. Add integration tests for a sale, mixed payment, repayment, and cancellation;
   then deploy with environment-managed secrets, PostgreSQL, logs and backups.

## Demo flow

1. Register or log in an admin and send the JWT as `Authorization: Bearer <token>`.
2. Create a category, product, and item with an opening stock quantity.
3. Create a customer. Make a cash, credit, or mixed purchase with line items.
4. Show that stock falls, a credit account/ledger entry is created when needed,
   and the customer balance updates in the same transaction.
5. Record a repayment and show the balance and ledger again.
6. Cancel an active bill: stock returns, any credit part is reversed by a ledger
   adjustment, and the bill remains in the database with `CANCELLED` status for audit.
