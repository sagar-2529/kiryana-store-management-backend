// ============================================================
// Custom Middleware: Async Handler
// Wraps async route handlers to catch errors automatically
// Without this, every controller needs its own try/catch
// ============================================================

/**
 * Wraps an async function to catch any thrown errors
 * and pass them to Express's error handler via next(err)
 *
 * @param {Function} fn - Async route handler (req, res, next) => Promise
 * @returns {Function} Express middleware
 *
 * BEFORE (without asyncHandler):
 *   const getAll = async (req, res) => {
 *     try {
 *       const data = await prisma.item.findMany();
 *       res.json(data);
 *     } catch (err) {
 *       res.status(500).json({ error: err.message });
 *     }
 *   };
 *
 * AFTER (with asyncHandler):
 *   const getAll = asyncHandler(async (req, res) => {
 *     const data = await prisma.item.findMany();
 *     res.json(data);  // errors automatically caught!
 *   });
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
