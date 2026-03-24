import express from "express";
import cors from "cors";
import os from "os";

const app = express();
const PORT = 3000;
const INSTANCE_ID = os.hostname();

app.use(cors());
app.use(express.json());

let items = [
    { id: 1, name: "Guitar", price: 4999 },
    { id: 2, name: "Keyboard", price: 1299},
    { id: 3, name: "Violin", price: 3999}
];

app.get("/items", (req, res) => {
    res.json(items);
});

app.post("/items", (req, res) => {
    const { name, price } = req.body;

    if (!name || typeof name !== "string" || price === undefined || isNaN(Number(price)))
        return res.status(400).json({
            error: "Invalid payload"
        });

    const newItem = {
        id: items.length ? Math.max(...items.map(i => i.id)) + 1 : 1,
        name: name.trim(),
        price: Number(price)
    }

    items.push(newItem);
    res.status(201).json(newItem);
});
app.get("/stats", (req, res) => {
    res.json({
        totalProducts: items.length,
        instanceId: INSTANCE_ID,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend listening on port ${PORT}`)
});