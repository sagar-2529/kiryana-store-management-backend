# Chapter 12 — Credit System & Advanced Queries 🔴

## What You'll Learn
- Double-entry ledger concept (balanceBefore/balanceAfter)
- Cash repayment flow
- Admin credit adjustments
- Prisma advanced: `aggregate`, `groupBy`, date filtering
- Raw SQL queries with `prisma.$queryRaw`
- `select` vs `include` for performance

## Key Concepts

### Repayment Flow
Customer pays back cash → reduces their outstanding balance:
```
balanceBefore: 500
repayment:    -200
balanceAfter:  300
```

### Prisma Aggregations
```js
const totals = await prisma.purchase.aggregate({
  _sum: { totalAmount: true, cashPayment: true, creditPayment: true },
  where: { createdAt: { gte: startDate, lte: endDate } },
});
```

### Group By
```js
const dailySales = await prisma.purchase.groupBy({
  by: ['paymentType'],
  _sum: { totalAmount: true },
  _count: true,
});
```

## How to Run

```bash
cd chapters/12-credit-system-advanced-queries
npm install
npm run dev
```

---

## 🏠 Homework

1. **Daily Sales Report** — `GET /api/v1/reports/daily-sales?date=YYYY-MM-DD`
2. **Top Customers** — `GET /api/v1/reports/top-customers` (top 5 by purchase total)
3. **Low Stock Alert** — `GET /api/v1/reports/low-stock?threshold=10`
