import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));

export default function DashboardPage() {
  const [data, setData] = useState({ items: [], customers: [], purchases: [] });
  const [error, setError] = useState("");
  useEffect(() => { Promise.all([api("/items"), api("/customers?hasCredit=true"), api("/purchases")]).then(([items, customers, purchases]) => setData({ items: items.data, customers: customers.data, purchases: purchases.data })).catch((err) => setError(err.message)); }, []);
  const today = new Date().toDateString();
  const todaySales = data.purchases.filter((sale) => new Date(sale.createdAt).toDateString() === today && sale.status === "ACTIVE").reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
  const totalCredit = data.customers.reduce((sum, customer) => sum + Number(customer.balance), 0);
  const lowStock = data.items.filter((item) => Number(item.stock) <= 5);

  return <Layout><PageHeader title="Good morning" subtitle="Here is what is happening in your store today." action={<Link className="primary" to="/billing">+ Create bill</Link>} />
    {error && <div className="notice error">{error}</div>}
    <section className="stat-grid"><article><span className="stat-icon green">₹</span><p>Today's sales</p><h2>{money(todaySales)}</h2><small>{data.purchases.length} total bills</small></article><article><span className="stat-icon amber">◒</span><p>Outstanding udhaar</p><h2>{money(totalCredit)}</h2><small>{data.customers.length} customers with credit</small></article><article><span className="stat-icon blue">▦</span><p>Low stock items</p><h2>{lowStock.length}</h2><small>Items with 5 or fewer units</small></article></section>
    <section className="dashboard-grid"><article className="panel"><div className="panel-title"><div><h3>Low stock alert</h3><p>Restock these items soon</p></div><Link to="/inventory">View inventory →</Link></div><div className="list">{lowStock.length ? lowStock.slice(0, 5).map((item) => <div key={item.id}><div><strong>{item.name}</strong><small>{item.product?.name}</small></div><b className="stock-low">{item.stock} {item.unitType}</b></div>) : <p className="empty">Everything is well stocked.</p>}</div></article><article className="panel"><div className="panel-title"><div><h3>Recent bills</h3><p>Latest sales activity</p></div><Link to="/billing">New bill →</Link></div><div className="list">{data.purchases.length ? data.purchases.slice(0, 5).map((sale) => <div key={sale.id}><div><strong>{sale.customer?.name || "Walk-in customer"}</strong><small>{new Date(sale.createdAt).toLocaleDateString("en-IN")}</small></div><b>{money(sale.totalAmount)}</b></div>) : <p className="empty">No bills created yet.</p>}</div></article></section>
  </Layout>;
}
