import { useEffect, useState } from "react";
import { fetchItems, createItem } from "../api";

export default function Products() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });
  const [error, setError] = useState("");

  async function loadItems() {
    try {
      setError("");
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      await createItem({
        name: form.name,
        price: Number(form.price)
      });

      setForm({ name: "", price: "" });
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Products</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "8px" }}>
          <input
            type="text"
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </div>

        <button type="submit">Add product</button>
      </form>

      {error && <p>{error}</p>}

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            #{item.id} - {item.name} - {item.price} PLN
          </li>
        ))}
      </ul>
    </div>
  );
}