import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, session } from "../api/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const result = await api("/auth/login", { method: "POST", body: JSON.stringify({ email: email.trim().toLowerCase(), password }) });
      session.set(result.data);
      navigate("/");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return <div className="login-page"><div className="login-art"><div className="login-brand">▣ <span>Kiryana<small>STORE MANAGER</small></span></div><div><p className="eyebrow">YOUR STORE, SIMPLIFIED</p><h1>Manage every sale<br />with confidence.</h1><p>Inventory, billing and customer udhaar in one calm, simple workspace.</p></div><div className="login-stats"><span><b>Stock</b>Always visible</span><span><b>Credit</b>Always tracked</span></div></div><section className="login-card"><div><p className="eyebrow">WELCOME BACK</p><h2>Sign in to your store</h2><p className="muted">Use the owner account you created in the API.</p></div><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@store.com" required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></label>{error && <p className="form-error">{error}</p>}<button className="primary full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button></form><p className="hint">First time? Create the initial owner using the backend’s <code>/auth/register</code> endpoint.</p></section></div>;
}
