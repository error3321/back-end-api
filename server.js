// server.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;
import express from "express";
const app = express();
const port = 3000;
let pool = null;

// Função para obter uma conexão com o banco de dados
function conectarBD() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.URL_BD,
    });
  }
  return pool;
}

app.get("/", async (req, res) => {
  const db = conectarBD(); // <--- Chame a função aqui
  console.log("Rota GET / solicitada");

  let dbStatus = "ok";
  try {
    await db.query("SELECT 1");
  } catch (e) {
    dbStatus = e.message;
  }

  res.json({
    message: "API para futebol",
    author: "Cristhian Rangel Fernandes",
    statusBD: dbStatus,
  });
});

app.get("/questoes", async (req, res) => {
  const db = conectarBD(); // <--- E chame a função aqui também
  console.log("Rota GET /questoes solicitada");

  try {
    const resultado = await db.query("SELECT * FROM questoes");
    const dados = resultado.rows;
    res.json(dados);
  } catch (e) {
    console.error("Erro ao buscar questões:", e);
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões",
    });
  }
});

app.listen(port, () => {
  console.log(`Serviço rodando na porta: ${port}`);
});