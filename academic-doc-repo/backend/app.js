
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
const db = require('./db');
const path = require('path');
const documentsRouter = require('./routes/documents');

const JWT_SECRET = 'secreta_chave_jwt_123'; // In production, use env variable

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve uploaded documents statically
app.use('/storage', express.static(path.join(__dirname, '../storage')));

// Login endpoint with JWT token generation
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Erro no banco de dados' });
    } else if (row) {
      if (row.password === password) {
        const token = jwt.sign({ id: row.id, username: row.username, role: row.role }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ success: true, token, user: { id: row.id, username: row.username, role: row.role } });
      } else {
        res.status(401).json({ success: false, message: 'Credenciais inválidas' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
  });
});

// Middleware to verify JWT token and set req.user
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Use documents router with authentication middleware
app.use('/api/documents', authenticateToken, documentsRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
