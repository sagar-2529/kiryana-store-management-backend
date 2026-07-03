// ============================================================
// Controller: Upload — Item image upload
// ============================================================

const asyncHandler = require("../middleware/asyncHandler");

const uploadItemImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  // In a real app, you'd update the Item record with the image path
  // await prisma.item.update({ where: { id: req.params.id }, data: { image: req.file.filename } });

  res.json({
    success: true,
    message: "Image uploaded successfully",
    data: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

module.exports = { uploadItemImage };
