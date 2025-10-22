import express from "express";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;
const knowledgeFile = "./knowledge.json";

app.use(express.json());
app.use(express.static("public"));

if (!fs.existsSync(knowledgeFile)) {
  fs.writeFileSync(knowledgeFile, JSON.stringify({}));
}

const getKnowledge = () => JSON.parse(fs.readFileSync(knowledgeFile, "utf-8"));
const saveKnowledge = (data) => {
  fs.writeFileSync(knowledgeFile, JSON.stringify(data, null, 2));
};

app.post("/chat", async (req, res) => {
  const userMsg = req.body.message.toLowerCase();
  const knowledge = getKnowledge();
  let reply = "";

  if (knowledge[userMsg]) {
    reply = knowledge[userMsg];
  } else if (userMsg.includes("adalah")) {
    const [subject, info] = userMsg.split("adalah");
    if (subject && info) {
      knowledge[subject.trim()] = info.trim();
      saveKnowledge(knowledge);
      reply = `Oke! Aku akan mengingat bahwa ${subject.trim()} adalah ${info.trim()}.`;
    } else {
      reply = "Aku belum mengerti maksudmu 😅";
    }
  } else {
    try {
      const searchUrl = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(userMsg)}`;
      const response = await fetch(searchUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.extract) {
          reply = data.extract;
        } else {
          reply = "Aku tidak menemukan informasi itu di Wikipedia 😅";
        }
      } else {
        reply = "Aku tidak bisa mengakses Wikipedia sekarang 😢";
      }
    } catch (err) {
      reply = "Terjadi kesalahan saat mencari informasi di internet.";
    }
  }

  res.json({ reply });
});

app.listen(PORT, () => console.log(`🤖 Server berjalan di port ${PORT}`));
