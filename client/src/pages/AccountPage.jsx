import React, { useState } from "react";
import { api, session } from "../api/client";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

export default function AccountPage() {
  const admin = session.admin();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const resetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (newPassword.length < 8) return setError("Use a password with at least 8 characters.");
    if (newPassword !== confirmPassword) return setError("New password and confirmation do not match.");
    setSaving(true);
    try {
      const response = await api("/auth/reset-password", {
        method: "PUT",
        body: JSON.stringify({ newPassword }),
      });
      session.set(response.data);
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password reset successfully. Use your new password the next time you log in.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return <Layout>
    <PageHeader title="Account" subtitle="Manage your owner account and sign-in password." />
    <section className="panel account-panel">
      <div className="account-panel-heading"><div className="avatar account-avatar">{admin?.name?.[0]?.toUpperCase() || "A"}</div><div><h2>{admin?.name || "Store owner"}</h2><p>{admin?.email}</p></div></div>
      <hr />
      <div className="account-password"><h3>Set a new password</h3><p className="muted">You are currently signed in, so you can set a new password without entering the old one.</p>{error && <div className="form-error">{error}</div>}{message && <div className="notice success">{message}</div>}<form onSubmit={resetPassword}><label>New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength="8" required autoComplete="new-password" /></label><label>Confirm new password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength="8" required autoComplete="new-password" /></label><button className="primary" disabled={saving}>{saving ? "Saving password…" : "Save new password"}</button></form></div>
    </section>
  </Layout>;
}
