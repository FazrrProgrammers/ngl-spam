const express = require("express");
const axios = require("axios");
const cors = require("cors");
const FakeUA = require("fake-useragent");
const ProxyAgent = require("proxy-agent");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const proxies = fs.readFileSync("proxy.txt", "utf-8").split("\n").filter(p => p.trim() !== "");

// Fungsi untuk mengirim spam
async function sendSpam(username, message) {
    try {
        if (proxies.length === 0) return { status: "error", message: "Proxy habis!" };

        const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
        const agent = new ProxyAgent(`http://${randomProxy}`);
        const headers = { "User-Agent": FakeUA(), "Content-Type": "application/json" };
        const payload = { username, question: message, deviceId: "random-string" };

        await axios.post("https://ngl.link/api/submit", payload, { headers, httpAgent: agent });
        return { status: "success", message: `Pesan terkirim: ${message}`, proxy: randomProxy };
    } catch (error) {
        return { status: "error", message: error.message };
    }
}

// Endpoint untuk spam
app.post("/spam", async (req, res) => {
    const { username, message, count } = req.body;
    if (!username || !message || !count) return res.json({ status: "error", message: "Data tidak lengkap!" });

    let results = [];
    for (let i = 0; i < count; i++) {
        const result = await sendSpam(username, `${message} #${i + 1}`);
        results.push(result);
    }

    res.json({ status: "done", results });
});

app.listen(3000, () => console.log("🚀 Server berjalan di http://localhost:3000"));
