import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

const UNITS = ["KG", "GRAM", "LITRE", "ML", "PIECE", "DOZEN", "PACKET", "BOX", "BOTTLE", "OTHER"];

export default function InventoryPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("");
  const [restockItem, setRestockItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);

  const loadCategories = async () => {
    const response = await api("/categories?limit=100");
    setCategories(response.data);
  };

  const loadCategoryInventory = async (categoryId) => {
    setLoading(true);
    setError("");
    try {
      const [productResponse, itemResponse] = await Promise.all([
        api(`/products?categoryId=${categoryId}&limit=100`),
        api(`/items?categoryId=${categoryId}&limit=100`),
      ]);
      setProducts(productResponse.data);
      setItems(itemResponse.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories()
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const openCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSearch("");
    loadCategoryInventory(categoryId);
  };

  const returnToCategories = () => {
    setSelectedCategoryId("");
    setProducts([]);
    setItems([]);
    setSearch("");
    setError("");
  };

  const refreshSelectedCategory = async () => {
    await loadCategories();
    if (selectedCategoryId) await loadCategoryInventory(selectedCategoryId);
  };

  const createCategory = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await api("/categories", {
        method: "POST",
        body: JSON.stringify({ name: form.get("name"), description: form.get("description") || undefined }),
      });
      event.currentTarget.reset();
      setMode("");
      await loadCategories();
      openCategory(response.data.id);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const createProduct = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api("/products", {
        method: "POST",
        body: JSON.stringify({ name: form.get("name"), description: form.get("description") || undefined, categoryId: selectedCategoryId }),
      });
      event.currentTarget.reset();
      setMode("");
      await refreshSelectedCategory();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const createItem = async (event) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api("/items", {
        method: "POST",
        body: JSON.stringify({ ...form, categoryId: selectedCategoryId, price: Number(form.price), stock: Number(form.stock) }),
      });
      event.currentTarget.reset();
      setMode("");
      await refreshSelectedCategory();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const increaseStock = async (event) => {
    event.preventDefault();
    const quantity = Number(new FormData(event.currentTarget).get("quantity"));
    try {
      await api(`/items/${restockItem.id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      setRestockItem(null);
      setMode("");
      await refreshSelectedCategory();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const openRestock = (item) => {
    setRestockItem(item);
    setMode("restock");
  };

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => `${item.name} ${item.product?.name || ""}`.toLowerCase().includes(term));
  }, [items, search]);

  const modal = mode && <div className="modal-backdrop"><div className="modal">
    <button className="close" onClick={() => { setMode(""); setRestockItem(null); }} aria-label="Close">×</button>
    {mode === "category" && <><h2>Add category</h2><form onSubmit={createCategory}>
      <label>Category name<input name="name" required placeholder="e.g. Frozen Foods" /></label>
      <label>Description <span className="optional">(optional)</span><textarea name="description" placeholder="What is sold in this category?" /></label>
      <button className="primary full">Save category</button>
    </form></>}
    {mode === "product" && <><h2>Add product</h2><p className="muted">Category: <strong>{selectedCategory?.name}</strong></p><form onSubmit={createProduct}>
      <label>Product name<input name="name" required placeholder="e.g. Organic Moong Dal" /></label>
      <label>Description <span className="optional">(optional)</span><textarea name="description" placeholder="Product details" /></label>
      <button className="primary full">Save product</button>
    </form></>}
    {mode === "item" && <><h2>Add stock item</h2><p className="muted">Category: <strong>{selectedCategory?.name}</strong></p><form onSubmit={createItem}>
      <label>Item / SKU name<input name="name" required placeholder="e.g. Organic Moong Dal 1 kg" /></label>
      <div className="two-col"><label>Sale price<input name="price" type="number" min="0.01" step="0.01" required /></label><label>Opening stock<input name="stock" type="number" min="0" step="0.001" required /></label></div>
      <label>Unit<select name="unitType" defaultValue="PIECE">{UNITS.map((unit) => <option key={unit}>{unit}</option>)}</select></label>
      <label>Product<select name="productId" required defaultValue=""><option value="" disabled>Select a product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
      <button className="primary full">Save stock item</button>
    </form></>}
    {mode === "restock" && <><h2>Add stock</h2><p className="muted"><strong>{restockItem?.name}</strong><br />Current stock: {restockItem?.stock} {restockItem?.unitType}</p><form onSubmit={increaseStock}>
      <label>Quantity to add<input name="quantity" type="number" min="0.001" step="0.001" autoFocus required placeholder="e.g. 12" /></label>
      <button className="primary full">Increase stock</button>
    </form></>}
  </div></div>;

  if (!selectedCategoryId) {
    return <Layout>
      <PageHeader title="Inventory" subtitle="Choose a category to view its products and available stock." action={<button className="primary" onClick={() => setMode("category")}>+ Category</button>} />
      {error && <div className="notice error">{error}</div>}
      <section className="category-section">
        <div className="section-heading"><div><h2>Categories</h2><p>{categories.length} categories in your store</p></div></div>
        {loading ? <div className="panel empty-state">Loading categories…</div> : <div className="category-grid">
          {categories.map((category) => <button className="category-card" key={category.id} onClick={() => openCategory(category.id)}>
            <span className="category-icon">▦</span><span className="category-card-copy"><strong>{category.name}</strong><small>{category.description || "Store products"}</small><em>{category._count?.products || 0} products · {category._count?.items || 0} items</em></span><span className="category-arrow">→</span>
          </button>)}
          {!categories.length && <div className="panel empty-state">No categories yet. Add your first category to begin.</div>}
        </div>}
      </section>
      {modal}
    </Layout>;
  }

  return <Layout>
    <button className="back-link" onClick={returnToCategories}>← All categories</button>
    <PageHeader title={selectedCategory?.name || "Category"} subtitle="Products and stock available in this category." action={<div className="button-group"><button className="secondary" onClick={() => setMode("product")}>+ Product</button><button className="primary" onClick={() => setMode("item")}>+ Stock item</button></div>} />
    {error && <div className="notice error">{error}</div>}
    <section className="panel table-panel">
      <div className="table-toolbar"><div><h3>Products & inventory</h3><p>{products.length} products · {items.length} stock items</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this category…" /></div>
      {loading ? <div className="empty-state">Loading category inventory…</div> : <div className="product-inventory-list">
        {products.map((product) => {
          const productItems = visibleItems.filter((item) => item.productId === product.id);
          if (search && !productItems.length && !product.name.toLowerCase().includes(search.toLowerCase())) return null;
          return <article className="inventory-product" key={product.id}><div className="inventory-product-heading"><div><h3>{product.name}</h3><p>{product.description || "No description"}</p></div><span className="badge">{productItems.length} item{productItems.length === 1 ? "" : "s"}</span></div>
            {productItems.length ? <div className="responsive-table"><table><thead><tr><th>Item / SKU</th><th>Price</th><th>Available stock</th><th></th></tr></thead><tbody>{productItems.map((item) => <tr key={item.id}><td><strong>{item.name}</strong></td><td>₹{Number(item.price).toFixed(2)}</td><td><span className={Number(item.stock) <= 5 ? "stock-low badge" : "badge"}>{item.stock} {item.unitType}</span></td><td><button className="restock-button" onClick={() => openRestock(item)}>+ Add stock</button></td></tr>)}</tbody></table></div> : <p className="empty-product">No stock item has been added to this product yet.</p>}
          </article>;
        })}
        {!products.length && <div className="empty-state">No products in this category yet. Add a product first, then add its stock item.</div>}
      </div>}
    </section>
    {modal}
  </Layout>;
}
