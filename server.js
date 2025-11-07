const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Servir os arquivos HTML, CSS e JS da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Conexão MySQL
const db = mysql.createConnection({
  host: 'paparella.com.br',
  user: 'paparell_trem',
  password: '@Senai2025',
  database: 'paparell_trem'
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  } else {
    console.log('Conectado ao banco de dados MySQL!');
  }
});

// Rota para salvar relatório
app.post('/salvar-relatorio', (req, res) => {
  const dados = req.body;
  const sql = `
    INSERT INTO relatorios 
    (titulo, tipo, ano, status, data_envio, nome_responsavel, cargo_responsavel, departamento_responsavel)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    dados.titulo,
    dados.tipo,
    dados.ano,
    dados.status,
    dados.data_envio,
    dados.responsavel.nome,
    dados.responsavel.cargo,
    dados.responsavel.departamento
  ];

  db.query(sql, valores, (err, result) => {
    if (err) {
      console.error('Erro ao inserir relatório:', err);
      return res.status(500).json({ message: 'Erro ao salvar relatório.', error: err });
    }

    const relatorioId = result.insertId;

    // Palavras-chave
    if (dados.palavras_chave?.length) {
      dados.palavras_chave.forEach(p =>
        db.query('INSERT INTO palavras_chave (relatorio_id, palavra) VALUES (?, ?)', [relatorioId, p])
      );
    }

    // Revisões
    if (dados.revisoes?.length) {
      dados.revisoes.forEach(r =>
        db.query(
          'INSERT INTO revisoes (relatorio_id, data, revisado_por, comentario) VALUES (?, ?, ?, ?)',
          [relatorioId, r.data, r.revisado_por, r.comentario]
        )
      );
    }

    res.status(201).json({ message: 'Relatório salvo com sucesso!', id: relatorioId });
  });
});

// Porta do servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
