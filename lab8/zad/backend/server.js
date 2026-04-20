import express from "express";
import cors from "cors";
import os from "os";
import pkg from "pg";
import { createClient } from "redis";
import fs from "fs";

const { Pool } = pkg;

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;
const INSTANCE_ID = process.env.INSTANCE_ID || os.hostname();

app.use(cors());
app.use(express.json());

function readSecret(path, fallbackEnv){
    try{
        return fs.readFileSync(path, "utf8").trim();
    }catch{
        return process.env[fallbackEnv]
    }
}
const pool = new Pool({
    host: process.env.DB_HOST,
    user: readSecret("/run/secrets/db_user", "DB_USER"),
    password: readSecret("/run/secrets/db_password", "DB_PASSWORD"),
    database: process.env.DB_NAME,
});

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

try {
    await redisClient.connect();
} catch (err) {
    console.error("Redis connection error:", err.message);
}

try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            name TEXT,
            price NUMERIC
        )
    `);
} catch (err) {
    console.error("Postgres init error:", err.message);
}

pool.on("error", (err) => {
    console.error("Postgres error:", err.message);
});

let requestCount = 0;

app.use((req, res, next) => {
    requestCount += 1;
    next();
});

app.get("/items", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM items ORDER BY id");

        res.set("X-Instance-ID", process.env.INSTANCE_ID || "unknown");

        res.json(result.rows);
    }catch (err){
        res.status(500).json({ error: "DB error"});
    }
});

app.post("/items", async (req, res) => {
    const { name, price } = req.body;

    if (!name || typeof name !== "string" || price === undefined || isNaN(Number(price)))
        return res.status(400).json({
            error: "Invalid payload"
        });

    try {
        const result = await pool.query(
            "INSERT INTO items(name, price) VALUES($1, $2) RETURNING *",
            [name.trim(), Number(price)]
        );

        res.status(201).json(result.rows[0]);
    }catch (err){
        res.status(500).json({ error:"Insert error" })
    }
});

app.get("/stats", async (req, res) => {
    try {
        const cached = await redisClient.get("stats");
        
        if (cached){
            res.set("X-Cache", "HIT");
            return res.json(JSON.parse(cached));
        }
        const result = await pool.query("SELECT COUNT(*) FROM items");

        const stats = {
            totalProducts: Number(result.rows[0].count),
            instanceId: INSTANCE_ID,
            serverTime: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            requestCount,
        }

        await redisClient.setEx("stats", 10, JSON.stringify(stats));

        res.set("X-Cache", "MISS");
        res.json(stats);
    }catch(err){
        res.status(500).json({ error: "Stats error" });
    }
});

app.get("/health", async (req, res) => {
    let postgres = "ok";
    let redis = "ok";

    try {
        await pool.query("SELECT 1");
    }catch{
        postgres="error";
    }

    try {
        await redisClient.ping();
    }catch{
        redis="error";
    }
    res.json({
        status: "ok",
        postgres,
        redis,
        uptime: Math.floor(process.uptime()),
    });
});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend listening on port ${PORT}`)
});

