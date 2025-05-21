let currentUser = null;
let authToken = null;

function showSection(sectionId) {
  const sections = ['login-section', 'home-section', 'search-section', 'add-section', 'edit-section'];
  sections.forEach(id => {
    document.getElementById(id).style.display = (id === sectionId) ? 'block' : 'none';
  });
}

function updateNav() {
  const navbar = document.getElementById('navbar');
  if (!currentUser) {
    navbar.style.display = 'none';
    return;
  }
  navbar.style.display = 'block';
  document.getElementById('nav-add').style.display = (currentUser.role === 'professor' || currentUser.role === 'admin') ? 'inline' : 'none';
  document.getElementById('nav-edit').style.display = (currentUser.role === 'professor' || currentUser.role === 'admin') ? 'inline' : 'none';
}

document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = event.target.username.value;
  const password = event.target.password.value;

  fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Falha no login');
    }
    return response.json();
  })
  .then(data => {
    currentUser = data.user;
    authToken = data.token;
    alert('Login realizado com sucesso para o usuário: ' + currentUser.username + ' com o papel: ' + currentUser.role);

    document.getElementById('login-section').style.display = 'none';
    updateNav();
    showSection('home-section');
  })
  .catch(error => {
    alert('Falha no login: ' + error.message);
  });
});

document.getElementById('upload-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  fetch('/api/documents', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + authToken
    },
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Falha ao enviar documento');
    }
    return response.json();
  })
  .then(data => {
    alert('Documento enviado com sucesso! ID: ' + data.documentId);
    event.target.reset();
  })
  .catch(error => {
    alert('Erro: ' + error.message);
  });
});

document.getElementById('search-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const params = new URLSearchParams();
  const keyword = document.getElementById('search-keyword').value;
  const category = document.getElementById('search-category').value;
  const discipline = document.getElementById('search-discipline').value;
  const year = document.getElementById('search-year').value;
  const author = document.getElementById('search-author').value;
  const type = document.getElementById('search-type').value;

  if (keyword) params.append('keyword', keyword);
  if (category) params.append('category', category);
  if (discipline) params.append('discipline', discipline);
  if (year) params.append('year', year);
  if (author) params.append('author', author);
  if (type) params.append('type', type);

  fetch('/api/documents/search?' + params.toString(), {
    headers: {
      'Authorization': 'Bearer ' + authToken
    }
  })
    .then(res => res.json())
    .then(docs => {
      const list = document.getElementById('documents-list');
      list.innerHTML = '';
      if (docs.length === 0) {
        list.textContent = 'Nenhum documento encontrado.';
      } else {
        docs.forEach(doc => {
          const div = document.createElement('div');
          div.textContent = doc.title + ' (' + doc.year + ') - ' + doc.author;

          // Add view button
          const viewBtn = document.createElement('button');
          viewBtn.textContent = 'Visualizar';
          viewBtn.style.marginLeft = '10px';
          viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const fileUrl = '/storage/' + doc.filepath;
            window.open(fileUrl, '_blank');
          });

          div.style.cursor = 'pointer';
          div.addEventListener('click', () => {
            populateEditForm(doc);
            showSection('edit-section');
          });
          div.appendChild(viewBtn);
          list.appendChild(div);
        });
      }
      showSection('search-section');
    })
    .catch(error => {
      alert('Erro na busca: ' + error.message);
    });
});

function populateEditForm(doc) {
  document.getElementById('edit-id').value = doc.id;
  document.getElementById('edit-title').value = doc.title;
  document.getElementById('edit-category').value = doc.category;
  document.getElementById('edit-discipline').value = doc.discipline;
  document.getElementById('edit-year').value = doc.year;
  document.getElementById('edit-author').value = doc.author;
  document.getElementById('edit-type').value = doc.type;
}

document.getElementById('edit-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value;
  const category = document.getElementById('edit-category').value;
  const discipline = document.getElementById('edit-discipline').value;
  const year = document.getElementById('edit-year').value;
  const author = document.getElementById('edit-author').value;
  const type = document.getElementById('edit-type').value;

  fetch('/api/documents/' + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify({ title, category, discipline, year, author, type })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Falha ao atualizar documento');
    }
    return response.json();
  })
  .then(data => {
    alert('Documento atualizado com sucesso!');
    showSection('search-section');
    document.getElementById('search-form').dispatchEvent(new Event('submit'));
  })
  .catch(error => {
    alert('Erro: ' + error.message);
  });
});

document.getElementById('back-to-search').addEventListener('click', function() {
  showSection('search-section');
});

document.getElementById('navbar').addEventListener('click', function(event) {
  if (event.target.tagName === 'A') {
    event.preventDefault();
    const section = event.target.getAttribute('data-section');
    if (section) {
      if (section === 'search') {
        // Trigger search form submit to load documents
        document.getElementById('search-form').dispatchEvent(new Event('submit'));
      } else {
        showSection(section + '-section');
      }
    }
  }
});

document.getElementById('logout').addEventListener('click', function(event) {
  event.preventDefault();
  currentUser = null;
  authToken = null;
  updateNav();
  showSection('login-section');
});
