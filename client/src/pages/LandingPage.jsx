import React from "react";
import { Link } from "react-router-dom";
import { session } from "../api/client";

const features = [
  ["▦", "Category-wise inventory", "Open a category and see its products, stock, and restock controls without a cluttered list."],
  ["₹", "Fast, accurate billing", "Build bills from available stock and complete cash or udhaar sales in one focused screen."],
  ["◒", "Udhaar, always clear", "Keep customer balances visible and record repayments when customers settle their dues."],
];

export default function LandingPage() {
  const signedIn = Boolean(session.token());
  const appLink = signedIn ? "/dashboard" : "/login";

  return <main className="landing-page">
    <nav className="landing-nav">
      <Link className="landing-brand" to="/"><span>▣</span><b>Kiryana</b><small>STORE MANAGER</small></Link>
      <div className="landing-nav-actions">
        <a href="#features">Features</a>
        <Link className="landing-login-link" to={appLink}>{signedIn ? "Open dashboard" : "Sign in"}</Link>
      </div>
    </nav>

    <section className="landing-hero">
      <div className="landing-copy">
        <p className="landing-eyebrow">BUILT FOR THE MODERN KIRYANA STORE</p>
        <h1>Run your store with <em>clarity,</em> not chaos.</h1>
        <p className="landing-lead">A calm workspace for inventory, daily billing, customer udhaar, and the decisions that keep a neighbourhood store moving.</p>
        <div className="landing-cta-row">
          <Link className="landing-primary" to={appLink}>{signedIn ? "Go to dashboard" : "Manage your store"} <span>→</span></Link>
          <a className="landing-secondary" href="#features">Explore features</a>
        </div>
        <div className="landing-trust"><span>✓</span><p><b>Designed for everyday work.</b> No complicated setup. Just your store, organised.</p></div>
      </div>

      <div className="landing-visual" aria-label="Kiryana Store Manager dashboard preview">
        <div className="hero-glow glow-one" /><div className="hero-glow glow-two" />
        <div className="preview-window">
          <div className="preview-top"><span className="preview-logo">▣ Kiryana</span><span className="preview-profile">S</span></div>
          <div className="preview-body">
            <aside className="preview-side"><span className="preview-active">⌂ Overview</span><span>▦ Inventory</span><span>♙ Customers</span><span>⊕ New bill</span></aside>
            <div className="preview-main"><p>STORE OVERVIEW</p><h2>Good morning, Sagar</h2><div className="preview-stats"><article><span>Today's sales</span><b>₹12,480</b><small>8 bills today</small></article><article><span>Udhaar due</span><b>₹4,260</b><small>6 customers</small></article></div><div className="preview-list"><strong>Low stock alert</strong><div><span>Amul Taaza Milk 1L</span><b>4 PACKET</b></div><div><span>Tata Salt 1kg</span><b>5 PACKET</b></div></div></div>
          </div>
        </div>
        <div className="floating-card"><span>✓</span><div><b>Sale completed</b><small>Cash · ₹1,245</small></div></div>
      </div>
    </section>

    <section id="features" className="landing-features">
      <div className="landing-section-heading"><p className="landing-eyebrow">EVERYDAY OPERATIONS, SIMPLIFIED</p><h2>Everything your store needs.<br />Nothing it does not.</h2></div>
      <div className="feature-grid">{features.map(([icon, title, body], index) => <article key={title} className="feature-card"><span className={`feature-icon feature-${index + 1}`}>{icon}</span><h3>{title}</h3><p>{body}</p><span className="feature-number">0{index + 1}</span></article>)}</div>
    </section>

    <section className="landing-final"><div><p className="landing-eyebrow">READY WHEN YOU ARE</p><h2>Your store deserves a<br /><em>simpler day.</em></h2></div><Link className="landing-primary light" to={appLink}>{signedIn ? "Open dashboard" : "Sign in to continue"} <span>→</span></Link></section>
    <footer className="landing-footer"><span>▣ <b>Kiryana</b> Store Manager</span><span>Inventory · Billing · Udhaar</span></footer>
  </main>;
}
