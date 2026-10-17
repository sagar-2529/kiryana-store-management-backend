const { z } = require("zod");

const id = z.string().uuid("Invalid record id");
const optionalText = (max = 500) => z.string().trim().max(max).optional();
const nullableText = (max = 500) => z.string().trim().max(max).nullable().optional();
const positiveNumber = z.coerce.number().finite().positive();
const nonNegativeNumber = z.coerce.number().finite().nonnegative();
const unitType = z.enum(["KG", "GRAM", "LITRE", "ML", "PIECE", "DOZEN", "PACKET", "BOX", "BOTTLE", "OTHER"]);

const named = z.string().trim().min(1, "Name is required").max(120);
const idParams = z.object({ id });
const customerIdParams = z.object({ customerId: id });

const auth = {
  register: z.object({ name: named, email: z.string().trim().email(), password: z.string().min(6).max(128) }),
  login: z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) }),
  changePassword: z.object({ oldPassword: z.string().min(1).max(128), newPassword: z.string().min(6).max(128) }),
  resetPassword: z.object({ newPassword: z.string().min(8).max(128) }),
};

const category = {
  create: z.object({ name: named, description: nullableText() }),
  update: z.object({ name: named.optional(), description: nullableText() }).refine((data) => data.name !== undefined || data.description !== undefined, "Provide a category field to update"),
};

const product = {
  create: z.object({ name: named, description: nullableText(), categoryId: id }),
  update: z.object({ name: named.optional(), description: nullableText() }).refine((data) => data.name !== undefined || data.description !== undefined, "Provide a product field to update"),
};

const item = {
  create: z.object({ name: named, price: positiveNumber, unitType, stock: nonNegativeNumber.default(0), productId: id, categoryId: id }),
  update: z.object({ name: named.optional(), price: positiveNumber.optional(), unitType: unitType.optional(), stock: nonNegativeNumber.optional() }).refine((data) => Object.keys(data).length > 0, "Provide an item field to update"),
  stock: z.object({ quantity: positiveNumber }),
};

const customer = {
  create: z.object({ name: named, phone: z.string().trim().min(6).max(25).or(z.literal("")).optional(), address: nullableText(300) }),
  update: z.object({ name: named.optional(), phone: z.string().trim().min(6).max(25).or(z.literal("")).optional(), address: nullableText(300) }).refine((data) => Object.keys(data).length > 0, "Provide a customer field to update"),
};

const purchase = {
  create: z.object({
    customerId: id.nullable().optional(),
    paymentType: z.enum(["CASH", "CREDIT", "MIXED"]),
    cashPayment: nonNegativeNumber.default(0),
    creditPayment: nonNegativeNumber.default(0),
    notes: optionalText(500),
    items: z.array(z.object({ itemId: id, quantity: positiveNumber, size: optionalText(80) })).min(1, "At least one item is required"),
  }),
};

const credit = {
  repay: z.object({ customerId: id, amount: positiveNumber, note: optionalText(500) }),
};

module.exports = { auth, category, product, item, customer, purchase, credit, idParams, customerIdParams };
