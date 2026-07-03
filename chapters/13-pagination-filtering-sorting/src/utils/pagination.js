// ============================================================
// Utility: Pagination, Sorting, Filtering helpers
// ============================================================

/**
 * Parse pagination params from query string.
 * @param {object} query - req.query
 * @returns {{ skip: number, take: number, page: number, pageSize: number }}
 */
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 10));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

/**
 * Parse sort query string: "name:asc,createdAt:desc"
 * @param {string} sortString
 * @param {string[]} allowedFields - fields that can be sorted
 * @returns {object[]} Prisma orderBy array
 */
function parseSortQuery(sortString, allowedFields = []) {
  if (!sortString) return [{ createdAt: "desc" }]; // default

  return sortString.split(",").map((part) => {
    const [field, direction = "asc"] = part.trim().split(":");
    if (allowedFields.length > 0 && !allowedFields.includes(field)) {
      return null;
    }
    return { [field]: direction === "desc" ? "desc" : "asc" };
  }).filter(Boolean);
}

/**
 * Build meta object for paginated response.
 */
function buildPaginationMeta(total, page, pageSize) {
  const totalPages = Math.ceil(total / pageSize);
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Paginated response helper.
 * Usage: return paginatedResponse(res, data, total, page, pageSize);
 */
function paginatedResponse(res, data, total, page, pageSize) {
  return res.json({
    success: true,
    data,
    meta: buildPaginationMeta(total, page, pageSize),
  });
}

module.exports = { parsePagination, parseSortQuery, buildPaginationMeta, paginatedResponse };
