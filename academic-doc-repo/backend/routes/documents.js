const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const db = require('../db');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { category, discipline, year, author } = req.body;
    const baseDir = path.join(__dirname, '../../storage');
    const dir = path.join(baseDir, category || 'uncategorized', discipline || 'general', year || 'unknown', author || 'unknown');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Upload document
router.post('/', upload.single('document'), async (req, res) => {
  const user = req.user; // Get user from auth middleware
  if (!user || !['professor', 'admin'].includes(user.role)) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { title, category, discipline, year, author, type } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo PDF é obrigatório' });
  }

  // Extract text from PDF for search indexing
  let pdfText = '';
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    pdfText = data.text;
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao processar PDF' });
  }

  const uploadDate = new Date().toISOString();

  // Insert document metadata into DB
  db.run(
    'INSERT INTO documents (title, category, discipline, year, author, type, filename, upload_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title, category, discipline, year, author, type, req.file.filename, uploadDate],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao salvar documento' });
      }
      // TODO: Save pdfText for search indexing (not implemented yet)
      res.json({ success: true, documentId: this.lastID });
    }
  );
});

// Edit document metadata
router.put('/:id', (req, res) => {
  const user = req.user;
  if (!user || !['professor', 'admin'].includes(user.role)) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { id } = req.params;
  const { title, category, discipline, year, author, type } = req.body;

  db.run(
    'UPDATE documents SET title = ?, category = ?, discipline = ?, year = ?, author = ?, type = ? WHERE id = ?',
    [title, category, discipline, year, author, type, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar documento' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Documento não encontrado' });
      }
      res.json({ success: true });
    }
  );
});

// Search documents by keyword and filters
router.get('/search', (req, res) => {
  const { keyword, category, discipline, year, author, type } = req.query;

  let query = 'SELECT *, category || "/" || discipline || "/" || year || "/" || author || "/" || filename AS filepath FROM documents WHERE 1=1';
  const params = [];

  if (keyword) {
    query += ' AND title LIKE ?';
    params.push(`%${keyword}%`);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (discipline) {
    query += ' AND discipline = ?';
    params.push(discipline);
  }
  if (year) {
    query += ' AND year = ?';
    params.push(year);
  }
  if (author) {
    query += ' AND author = ?';
    params.push(author);
  }
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro na busca' });
    }
    res.json(rows);
  });
});

module.exports = router;
