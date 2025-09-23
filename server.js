import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();         // Carrega e processa o arquivo .env
const { Pool } = pkg;    // Utiliza a Classe Pool do Postgres
import express from "express";      // Requisição do pacote do express
const app = express();              // Instancia o Express
const port = 3000;                  // Define a porta

app.get("/questoes", async (req, res) => {        // Cria endpoint na rota da raiz do projeto
  try {
    const resultado = await db.query("SELECT * FROM questoes"); // Executa uma consulta SQL para selecionar todas as questões
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta
    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questões:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões",
    });
  }
  console.log("Rota GET /questoes solicitada");
  const db = new Pool({  
  connectionString: process.env.URL_BD,
});

let dbStatus = "ok";
try {
  await db.query("SELECT 1");
} catch (e) {
  dbStatus = e.message;
}

res.json({
		message: "API para futebol",      // Substitua pelo conteúdo da sua API
    author: "Cristhian Rangel Fernandes",    // Substitua pelo seu nome
    statusBD: dbStatus   // Acrescente esta linha
  });
  
  
});

app.listen(port, () => {            // Um socket para "escutar" as requisições
  console.log(`Serviço rodando na porta:  ${port}`);
});
