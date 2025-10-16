// server.js
import express from "express";
import pkg from "pg";
import dotenv from "dotenv";

const app = express();
app.use(express.json()); // Middleware para interpretar requisições com corpo em JSON
const port = 3000;
dotenv.config();
const { Pool } = pkg;

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

app.get("/questoes", async (req, res) => {
  const db = conectarBD(); // <--- E chame a função aqui também

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

app.get("/", async (req, res) => {
  console.log("Rota GET / solicitada");
  const db = conectarBD(); // <--- Chame a função aqui

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

//server.js
app.get("/questoes/:id", async (req, res) => {
  console.log("Rota GET /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    const consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    const resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.delete("/questoes/:id", async (req, res) => {
  console.log("Rota DELETE /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    consulta = "DELETE FROM questoes WHERE id = $1"; // Consulta SQL para deletar a questão pelo ID
    resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    res.status(200).json({ mensagem: "Questão excluida com sucesso!!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao excluir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.post("/questoes", async (req, res) => {
  console.log("Rota POST /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const data = req.body; // Obtém os dados do corpo da requisição
    // Validação dos dados recebidos
    if (!data.enunciado || !data.disciplina || !data.tema || !data.nivel) {
      return res.status(400).json({
        erro: "Dados inválidos",
        mensagem:
          "Todos os campos (enunciado, disciplina, tema, nivel) são obrigatórios.",
      });
    }

    const db = conectarBD(); // Conecta ao banco de dados

    const consulta =
      "INSERT INTO questoes (enunciado,disciplina,tema,nivel) VALUES ($1,$2,$3,$4) "; // Consulta SQL para inserir a questão
    const questao = [data.enunciado, data.disciplina, data.tema, data.nivel]; // Array com os valores a serem inseridos
    const resultado = await db.query(consulta, questao); // Executa a consulta SQL com os valores fornecidos
    res.status(201).json({ mensagem: "Questão criada com sucesso!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao inserir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor"
    });
  }
});

//server.js
app.put("/questoes/:id", async (req, res) => {
  console.log("Rota PUT /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let questao = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (questao.length === 0) {
      return res.status(404).json({ message: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    const data = req.body; // Obtém os dados do corpo da requisição

    // Usa o valor enviado ou mantém o valor atual do banco
    data.enunciado = data.enunciado || questao[0].enunciado;
    data.disciplina = data.disciplina || questao[0].disciplina;
    data.tema = data.tema || questao[0].tema;
    data.nivel = data.nivel || questao[0].nivel;

    // Atualiza a questão
    consulta ="UPDATE questoes SET enunciado = $1, disciplina = $2, tema = $3, nivel = $4 WHERE id = $5";
    // Executa a consulta SQL com os valores fornecidos
    resultado = await db.query(consulta, [
      data.enunciado,
      data.disciplina,
      data.tema,
      data.nivel,
      id,
    ]);

    res.status(200).json({ message: "Questão atualizada com sucesso!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao atualizar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
});


app.post("/usuarios", async (req, res) => {
  console.log("Rota POST /usuarios solicitada");

  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Todos os campos (nome, email, senha) são obrigatórios.",
      });
    }

    const db = conectarBD();
    const consulta = "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)";
    await db.query(consulta, [nome, email, senha]);

    res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
  } catch (e) {
    console.error("Erro ao criar usuário:", e);
    res.status(500).json({ erro: "Erro interno ao criar usuário" });
  }
});

app.get("/usuarios", async (req, res) => {
  console.log("Rota GET /usuarios solicitada");

  try {
    const db = conectarBD();
    const resultado = await db.query("SELECT * FROM usuarios");
    res.json(resultado.rows);
  } catch (e) {
    console.error("Erro ao buscar usuários:", e);
    res.status(500).json({ erro: "Erro interno ao buscar usuários" });
  }
});

app.get("/usuarios/:id", async (req, res) => {
  console.log("Rota GET /usuarios/:id solicitada");

  try {
    const { id } = req.params;
    const db = conectarBD();
    const resultado = await db.query("SELECT * FROM usuarios WHERE id = $1", [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (e) {
    console.error("Erro ao buscar usuário:", e);
    res.status(500).json({ erro: "Erro interno ao buscar usuário" });
  }
});

app.put("/usuarios/:id", async (req, res) => {
  console.log("Rota PUT /usuarios/:id solicitada");

  try {
    const { id } = req.params;
    const db = conectarBD();

    // Buscar o usuário atual
    const busca = await db.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    if (busca.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    const atual = busca.rows[0];
    const { nome, email, senha } = req.body;

    const atualizado = await db.query(
      "UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4",
      [nome || atual.nome, email || atual.email, senha || atual.senha, id]
    );

    res.json({ mensagem: "Usuário atualizado com sucesso!" });
  } catch (e) {
    console.error("Erro ao atualizar usuário:", e);
    res.status(500).json({ erro: "Erro interno ao atualizar usuário" });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  console.log("Rota DELETE /usuarios/:id solicitada");

  try {
    const { id } = req.params;
    const db = conectarBD();

    // Verificar se o usuário existe
    const verifica = await db.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    if (verifica.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    await db.query("DELETE FROM usuarios WHERE id = $1", [id]);
    res.json({ mensagem: "Usuário deletado com sucesso!" });
  } catch (e) {
    console.error("Erro ao deletar usuário:", e);
    res.status(500).json({ erro: "Erro interno ao deletar usuário" });
  }
});

app.listen(port, () => {
  console.log(`Serviço rodando na porta: ${port}`);
});
