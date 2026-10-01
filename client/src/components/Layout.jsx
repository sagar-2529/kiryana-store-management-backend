import { NavLink, useNavigate } from "react-router-dom";
import { session } from "../api/client";

const links = [
  ["/", "Overview", "⌂"],
  ["/inventory", "Inventory", "▦"],
  ["/customers", "Customers", "♙"],
  ["/billing", "New bill", "⊕"],
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const admin = session.admin();
  const logout = () => {
    session.clear();
    navigate("/login");
  };

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span>▣</span><div>Kiryana <small>STORE MANAGER</small></div></div>
      <nav>{links.map(([to, label, icon]) => <NavLink key={to} to={to} end={to === "/"}><i>{icon}</i>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="avatar">{admin?.name?.[0]?.toUpperCase() || "A"}</div><div><strong>{admin?.name || "Admin"}</strong><small>Store owner</small></div><button className="icon-button" onClick={logout} title="Log out">⇥</button></div>
    </aside>
    <main className="main-content">{children}</main>
  </div>;
}
