// ============================================================
// Controller: Items — with pagination, filtering, sorting
// ============================================================

const prisma = require("../lib/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { parsePagination, parseSortQuery, paginatedResponse } = require("../utils/pagination");

const SORTABLE_FIELDS = ["name", "price", "stock", "createdAt", "unitType"];

const getAll = asyncHandler(async (req, res) => {
  const { page, pageSize, skip, take } = parsePagination(req.query);
  const orderBy = parseSortQuery(req.query.sort, SORTABLE_FIELDS);

  // Build dynamic where clause from query params
  const where = {};
  if (req.query.categoryId) where.categoryId = req.query.categoryId;
  if (req.query.productId) where.productId = req.query.productId;
  if (req.query.unitType) where.unitType = req.query.unitType;
  if (req.query.name) where.name = { contains: req.query.name, mode: "insensitive" };
  if (req.query.minPrice) where.price = { ...where.price, gte: parseFloat(req.query.minPrice) };
  if (req.query.maxPrice) where.price = { ...where.price, lte: parseFloat(req.query.maxPrice) };
  if (req.query.minStock) where.stock = { gte: parseFloat(req.query.minStock) };

  const [data, total] = await Promise.all([
    prisma.item.findMany({
      where, skip, take, orderBy,
      include: {
        product: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.item.count({ where }),
  ]);

  paginatedResponse(res, data, total, page, pageSize);
});

module.exports = { getAll };
