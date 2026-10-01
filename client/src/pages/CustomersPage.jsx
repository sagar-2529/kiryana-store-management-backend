import { useEffect, useState } from "react";
import { api } from "../api/client";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]); const [search, setSearch] = useState(""); const [showForm, setShowForm] = useState(false); const [error, setError] = useState("");
  const load = (name = "") => api(`/customers${name ? `?name=${encodeURIComponent(name)}` : ""}`).then((r) => setCustomers(r.data)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  const submit = async (event) => { event.preventDefault(); const form = Object.fromEntries(new FormData(event.currentTarget)); try { await api("/customers", { method: "POST", body: JSON.stringify(form) }); event.currentTarget.reset(); setShowForm(false); load(); } catch (e) { setError(e.message); } };
  return <Layout><PageHeader title="Customers" subtitle="Manage customer details and outstanding udhaar." action={<button className="primary" onClick={() => setShowForm(true)}>+ Add customer</button>} />{error && <div className="notice error">{error}</div>}
    {showForm && <div className="modal-backdrop"><div className="modal"><button className="close" onClick={() => setShowForm(false)}>×</button><h2>Add customer</h2><form onSubmit={submit}><label>Customer name<input name="name" required placeholder="Full name" /></label><label>Phone number<input name="phone" type="tel" placeholder="10-digit number" /></label><label>Address<textarea name="address" placeholder="Optional address" /></label><button className="primary full">Save customer</button></form></div></div>}
    <section className="panel table-panel"><div className="table-toolbar"><div><h3>Customer directory</h3><p>{customers.length} customers</p></div><input value={search} onChange={(e) => { setSearch(e.target.value); load(e.target.value); }} placeholder="Search customer…" /></div><div className="responsive-table"><table><thead><tr><th>Customer</th><th>Phone</th><th>Purchase history</th><th>Outstanding udhaar</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td><strong>{customer.name}</strong><small>{customer.address || "No address saved"}</small></td><td>{customer.phone || "—"}</td><td>{customer._count?.purchases || 0} bills</td><td><b className={Number(customer.balance) > 0 ? "credit" : ""}>₹{Number(customer.balance).toFixed(2)}</b></td></tr>)}{!customers.length && <tr><td colSpan="4" className="empty">No customers found.</td></tr>}</tbody></table></div></section></Layout>;
}
