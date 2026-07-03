# Chapter 14 — File Upload & Invoice Export 🔴

## What You'll Learn
- File uploads with `multer` (disk and memory storage)
- File validation (size limits, mime types)
- Serving static files with `express.static()`
- CSV export with `json2csv`
- Stream responses for large exports
- Content-Disposition header for downloads

## Key Concepts

### Multer Setup
```js
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
```

### CSV Export
```js
const { Parser } = require('json2csv');
const parser = new Parser({ fields: ['name', 'price', 'stock'] });
const csv = parser.parse(data);
res.header('Content-Type', 'text/csv');
res.header('Content-Disposition', 'attachment; filename=items.csv');
res.send(csv);
```

## How to Run

```bash
cd chapters/14-file-upload-invoice-export
npm install
mkdir -p uploads
npm run dev
```

---

## 🏠 Homework

1. **PDF Invoice** — Generate PDF for a single purchase using `pdfkit`.
2. **Customer Export** — `GET /api/v1/exports/customers?format=csv`
3. **Image Cleanup** — Delete item image when item is deleted.
