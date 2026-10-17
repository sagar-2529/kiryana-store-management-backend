import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

export default function BillingPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [paymentType, setPaymentType] = useState("CASH");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [itemResponse, customerResponse, categoryResponse] = await Promise.all([
        api("/items?limit=500&stockStatus=IN_STOCK"), api("/customers?limit=500"), api("/categories?limit=100"),
      ]);
      setItems(itemResponse.data.filter((item) => Number(item.stock) > 0));
      setCustomers(customerResponse.data);
      setCategories(categoryResponse.data);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => { loadData(); }, []);

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
  const visibleItems = useMemo(() => items.filter((item) => item.categoryId === selectedCategoryId), [items, selectedCategoryId]);
  const total = useMemo(() => cart.reduce((sum, line) => sum + Number(line.item.price) * line.quantity, 0), [cart]);

  const add = (item) => setCart((old) => old.some((line) => line.item.id === item.id)
    ? old.map((line) => line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line)
    : [...old, { item, quantity: 1 }]);
  const changeQuantity = (id, quantity) => setCart((old) => old.map((line) => line.item.id === id ? { ...line, quantity: Math.max(0.001, Number(quantity)) } : line));
  const remove = (id) => setCart((old) => old.filter((line) => line.item.id !== id));

  const submit = async () => {
    setError("");
    setMessage("");
    if (!cart.length) return setError("Add at least one item to the bill.");
    if ((paymentType === "CREDIT" || paymentType === "MIXED") && !customerId) return setError("Select a customer for a credit sale.");
    setSaving(true);
    try {
      const creditPayment = paymentType === "CREDIT" ? total : 0;
      const cashPayment = paymentType === "CASH" ? total : 0;
      const result = await api("/purchases", {
        method: "POST",
        body: JSON.stringify({ customerId: customerId || null, paymentType, cashPayment, creditPayment, items: cart.map((line) => ({ itemId: line.item.id, quantity: line.quantity })) }),
      });
      setMessage(`Bill created successfully: ₹${Number(result.data.totalAmount).toFixed(2)}`);
      setCart([]);
      setCustomerId("");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return <Layout>
    <PageHeader title="Create a bill" subtitle="Choose a category, add items, and complete the sale." />
    {error && <div className="notice error">{error}</div>}
    {message && <div className="notice success">{message}</div>}
    <div className="billing-grid">
      <section className="panel">
        <div className="panel-title"><div><h3>Choose a category</h3><p>Select a category to view its available items</p></div></div>
        <div className="billing-category-grid">
          {categories.map((category) => <button className={selectedCategoryId === category.id ? "billing-category active" : "billing-category"} key={category.id} onClick={() => setSelectedCategoryId(category.id)}>
            <strong>{category.name}</strong><small>{category._count?.items || 0} items</small>
          </button>)}
        </div>
        <div className="panel-title billing-items-heading"><div><h3>{selectedCategory ? `${selectedCategory.name} items` : "Available items"}</h3><p>{selectedCategory ? "Click an item to add it to the bill" : "Choose a category above to begin"}</p></div></div>
        {selectedCategory ? <div className="product-grid">{visibleItems.map((item) => <button className="product-card" key={item.id} onClick={() => add(item)}><strong>{item.name}</strong><small>{item.stock} {item.unitType} available</small><b>₹{Number(item.price).toFixed(2)}</b></button>)}{!visibleItems.length && <p className="empty-product">No in-stock items in this category.</p>}</div> : <p className="empty-state">Select a category to see its items.</p>}
      </section>
      <aside className="bill-card"><h2>Current bill</h2><label>Customer <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}><option value="">Walk-in customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}{Number(customer.balance) > 0 ? ` — due ₹${customer.balance}` : ""}</option>)}</select></label><div className="cart">{cart.map((line) => <div className="cart-line" key={line.item.id}><div><strong>{line.item.name}</strong><small>₹{Number(line.item.price).toFixed(2)} each</small></div><input type="number" min="0.001" step="0.001" value={line.quantity} onChange={(event) => changeQuantity(line.item.id, event.target.value)} /><b>₹{(Number(line.item.price) * line.quantity).toFixed(2)}</b><button className="remove" onClick={() => remove(line.item.id)}>×</button></div>)}{!cart.length && <p className="empty">Your bill is empty.</p>}</div><div className="total"><span>Total</span><strong>₹{total.toFixed(2)}</strong></div><div className="payment-tabs">{["CASH", "CREDIT"].map((type) => <button key={type} className={paymentType === type ? "active" : ""} onClick={() => setPaymentType(type)}>{type === "CASH" ? "Cash" : "Udhaar"}</button>)}</div><button className="primary full" disabled={!cart.length || saving} onClick={submit}>{saving ? "Saving bill…" : `Complete sale · ₹${total.toFixed(2)}`}</button></aside>
    </div>
  </Layout>;
}
