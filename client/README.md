# Kiryana Store Frontend

React + Vite dashboard for the Kiryana Store API.

## Run locally

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`). Ensure the backend
is running on port 3000. For a deployed backend, set `VITE_API_URL` in `.env`
to `https://your-api.onrender.com/api/v1`.

## Screens

- Login with the admin JWT account
- Dashboard with sales, credit, low-stock, and recent-bill summaries
- Inventory catalogue and add-item/category forms
- Customer directory and add-customer form
- Bill builder with cash or udhaar payment
