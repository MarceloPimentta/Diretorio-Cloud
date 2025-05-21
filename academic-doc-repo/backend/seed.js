const db = require('./db');

// Insert test users into the database
const users = [
  { username: 'professor1', password: 'password123', role: 'professor' },
  { username: 'aluno1', password: 'password123', role: 'student' },
  { username: 'admin1', password: 'password123', role: 'admin' }
];

db.serialize(() => {
  users.forEach(user => {
    db.run(
      'INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)',
      [user.username, user.password, user.role],
      function(err) {
        if (err) {
          console.error('Erro ao inserir usuário de teste:', err.message);
        } else {
          console.log(`Usuário de teste ${user.username} inserido ou já existe.`);
        }
      }
    );
  });
});

db.close();
