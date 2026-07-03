# Chapter 14 — Theory: File Upload & Invoice Export

---

## 1. File Uploads with Multer

Express's `express.json()` only handles JSON bodies. File uploads use `multipart/form-data` encoding, which requires a special parser.

**Multer** is the standard library for handling file uploads in Express.

### How Multipart Works

```
POST /api/v1/items/123/image
Content-Type: multipart/form-data; boundary=----abc123

------abc123
Content-Disposition: form-data; name="image"; filename="photo.jpg"
Content-Type: image/jpeg

<binary data>
------abc123--
```

The file is sent as binary data with metadata (filename, content type) inside a special "boundary" format.

### Storage Engines

**Disk Storage** — saves to filesystem:
```js
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
```

**Memory Storage** — keeps in RAM as Buffer:
```js
const storage = multer.memoryStorage();
// Access file via req.file.buffer
// Good for: sending to cloud storage (S3), image processing
```

### File Validation
```js
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type"), false);
  },
});
```

### Route Usage
```js
router.post("/items/:id/image",
  upload.single("image"),  // "image" = form field name
  controller.uploadImage
);
// req.file = { filename, path, size, mimetype, ... }
```

---

## 2. Serving Static Files

```js
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
```

Now files at `uploads/photo.jpg` are accessible at `http://localhost:3000/uploads/photo.jpg`. Express serves them directly without a route handler.

---

## 3. CSV Export

```js
const { Parser } = require("json2csv");

const parser = new Parser({
  fields: ["name", "price", "stock", "category"],
});

const csv = parser.parse(data);

res.header("Content-Type", "text/csv");
res.header("Content-Disposition", "attachment; filename=items.csv");
res.send(csv);
```

### `Content-Disposition` Header

- `inline` — browser displays the file
- `attachment; filename=items.csv` — browser downloads it with that filename

---

## 4. Stream Responses for Large Exports

For thousands of records, don't load everything into memory:

```js
const { Transform } = require("stream");

res.header("Content-Type", "text/csv");
const cursor = prisma.item.findMany({ /* stream-compatible query */ });
// Pipe each chunk to the response
```

Streams process data piece-by-piece instead of all-at-once.

---

## 5. Summary

| Concept | What You Learned |
|---------|-----------------|
| Multer | Parses `multipart/form-data` for file uploads |
| Disk vs Memory storage | Filesystem for persistence, RAM for processing |
| File validation | Size limits + mime type checks |
| `express.static()` | Serve uploaded files as URLs |
| CSV export | `json2csv` + Content-Disposition header |
| Streams | Large exports without memory issues |

**Next Chapter →** Security: rate limiting, caching, and helmet.
