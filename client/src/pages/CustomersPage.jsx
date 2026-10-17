import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [repaymentCustomer, setRepaymentCustomer] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = (name = "") => api(`/customers?limit=100${name ? `&name=${encodeURIComponent(name)}` : ""}`)
    .then((response) => setCustomers(response.data))
    .catch((requestError) => setError(requestError.message));

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api("/customers", { method: "POST", body: JSON.stringify(form) });
      event.currentTarget.reset();
      setShowForm(false);
      setMessage("Customer added successfully.");
      load(search);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const receiveRepayment = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    try {
      await api("/credits/repay", {
        method: "POST",
        body: JSON.stringify({ customerId: repaymentCustomer.id, amount, note: form.get("note") || undefined }),
      });
      setRepaymentCustomer(null);
      setMessage(`Payment of ₹${amount.toFixed(2)} received from ${repaymentCustomer.name}.`);
      load(search);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const deleteCustomer = async (customer) => {
    const confirmed = window.confirm(`Delete ${customer.name}? This cannot be undone.`);
    if (!confirmed) return;

    setError("");
    setMessage("");
    try {
      await api(`/customers/${customer.id}`, { method: "DELETE" });
      setMessage(`${customer.name} was deleted.`);
      load(search);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setRepaymentCustomer(null);
  };

  return <Layout>
    <PageHeader title="Customers" subtitle="Manage customer details and outstanding udhaar." action={<button className="primary" onClick={() => setShowForm(true)}>+ Add customer</button>} />
    {error && <div className="notice error">{error}</div>}
    {message && <div className="notice success">{message}</div>}

    {(showForm || repaymentCustomer) && <div className="modal-backdrop"><div className="modal">
      <button className="close" onClick={closeModal} aria-label="Close">×</button>
      {showForm && <><h2>Add customer</h2><form onSubmit={submit}>
        <label>Customer name<input name="name" required placeholder="Full name" /></label>
        <label>Phone number<input name="phone" type="tel" placeholder="10-digit number" /></label>
        <label>Address<textarea name="address" placeholder="Optional address" /></label>
        <button className="primary full">Save customer</button>
      </form></>}
      {repaymentCustomer && <><h2>Receive udhaar payment</h2><p className="muted"><strong>{repaymentCustomer.name}</strong><br />Outstanding balance: <b className="credit">₹{Number(repaymentCustomer.balance).toFixed(2)}</b></p><form onSubmit={receiveRepayment}>
        <label>Amount received<input name="amount" type="number" min="0.01" max={Number(repaymentCustomer.balance)} step="0.01" required autoFocus placeholder="Enter amount" /></label>
        <label>Note <span className="optional">(optional)</span><textarea name="note" placeholder="e.g. Paid in cash" /></label>
        <button className="primary full">Record payment</button>
      </form></>}
    </div></div>}

    <section className="panel table-panel"><div className="table-toolbar"><div><h3>Customer directory</h3><p>{customers.length} customers</p></div><input value={search} onChange={(event) => { setSearch(event.target.value); load(event.target.value); }} placeholder="Search customer…" /></div><div className="responsive-table"><table><thead><tr><th>Customer</th><th>Phone</th><th>Purchase history</th><th>Outstanding udhaar</th><th>Actions</th></tr></thead><tbody>{customers.map((customer) => {
      const balance = Number(customer.balance);
      return <tr key={customer.id}><td><strong>{customer.name}</strong><small>{customer.address || "No address saved"}</small></td><td>{customer.phone || "—"}</td><td>{customer._count?.purchases || 0} bills</td><td><b className={balance > 0 ? "credit" : ""}>₹{balance.toFixed(2)}</b></td><td><div className="customer-actions">{balance > 0 ? <button className="repay-button" onClick={() => { setError(""); setMessage(""); setRepaymentCustomer(customer); }}>Receive payment</button> : <span className="paid-label">Paid</span>}<button className="delete-button" onClick={() => deleteCustomer(customer)}>Delete</button></div></td></tr>;
    })}{!customers.length && <tr><td colSpan="5" className="empty">No customers found.</td></tr>}</tbody></table></div></section>
  </Layout>;
}
