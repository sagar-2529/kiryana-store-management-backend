function getPagination(query) {
  const page = query.page || 1;
  const limit = query.limit || 25;
  return { page, limit, skip: (page - 1) * limit };
}

function paginationMeta(total, page, limit) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1,
  };
}

module.exports = { getPagination, paginationMeta };
