export async function fetchItems() {
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error("Failed to fetch items");
    return res.json();
}

export async function createItem(payload){
    const res = await fetch("/api/tems", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok){
        const err = await res.json().catch(() => ({}));
    }
    return res.json();
}

export async function fetchStats() {
    const res = await fetch("/api/stats");
    if (!res.ok) throw new Error("Failed to fetch")
    return{
        data: await res.json(),
        cacheStatus: res.headers.get("X-Cache-Status")
    }; 
}

