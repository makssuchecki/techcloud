import { useEffect, useState } from "react";
import { fetchStats } from "../api";

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [cacheStatus, setCacheStatus] = useState("N/A");
  const [error, setError] = useState("");

  async function loadStats() {
    try {
      setError("");
      const response = await fetchStats();
      setStats(response.data);
      setCacheStatus(response.cacheStatus || "N/A");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h1>Stats</h1>
      <p>Total products: {stats.totalProducts}</p>
      <p>Backend instance ID: {stats.instanceId}</p>
      <p>Generated at: {stats.timestamp}</p>
      <p>X-Cache-Status: {cacheStatus || "N/A"}</p>
      <button onClick={loadStats}>Refresh stats</button>
    </div>
  );
}