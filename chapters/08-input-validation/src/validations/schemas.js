// ============================================================
// Zod Validation Schemas — Category & Item
// ============================================================

const z = require("zod");

// ── Valid enum values ───────────────────────────────────────
const UNIT_TYPES = ["KG", "GRAM", "LITRE", "ML", "PIECE", "DOZEN", "PACKET", "BOX", "BOTTLE", "OTHER"];

// ── Category Schemas ────────────────────────────────────────

const createCategorySchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .trim()
    .optional()
    .nullable(),
  adminId: z.string().uuid("Invalid admin ID format").optional(),
});

// .partial() makes all fields optional — perfect for PATCH/PUT
const updateCategorySchema = createCategorySchema.partial();

// ── Item Schemas ────────────────────────────────────────────

const createItemSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be at most 200 characters")
    .trim(),
  price: z
    .number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .max(999999.99, "Price is too high"),
  unitType: z.enum(UNIT_TYPES, {
    errorMap: () => ({ message: `Unit type must be one of: ${UNIT_TYPES.join(", ")}` }),
  }),
  stock: z
    .number()
    .min(0, "Stock cannot be negative")
    .default(0),
  productId: z.string({ required_error: "Product ID is required" }).uuid("Invalid product ID"),
  categoryId: z.string({ required_error: "Category ID is required" }).uuid("Invalid category ID"),
});

const updateItemSchema = z.object({
  name: z.string().min(2).max(200).trim().optional(),
  price: z.number().positive().max(999999.99).optional(),
  unitType: z.enum(UNIT_TYPES).optional(),
  stock: z.number().min(0, "Stock cannot be negative").optional(),
});

// ── UUID Param Schema ───────────────────────────────────────

const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

// ──────────────────────────────────────────────
// Product and customer schemas
// ──────────────────────────────────────────────

const createProductSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(2).max(200).trim(),
  description: z.string().max(500).trim().optional().nullable(),
  categoryId: z.string({ required_error: "Category ID is required" }).uuid("Invalid category ID"),
});
const updateProductSchema = createProductSchema.omit({ categoryId: true }).partial();

const createCustomerSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(2).max(100).trim(),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional().nullable(),
  address: z.string().max(500).trim().optional().nullable(),
});
const updateCustomerSchema = createCustomerSchema.partial();

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  createItemSchema,
  updateItemSchema,
  idParamSchema,
  createProductSchema,
  updateProductSchema,
  createCustomerSchema,
  updateCustomerSchema,
};
