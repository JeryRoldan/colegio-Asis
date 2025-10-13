const express = require('express');
const sql = require('mssql');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const session = require('express-session');

app.use(session({
  secret: 'mi_secreto_seguro',  // cambia esto por algo único
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hora
}));

// ===== Cerrar sesión =====
app.post('/logout', (req, res) => {
  // Si usas sesiones con express-session
  if (req.session) {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ ok: false, msg: 'Error al cerrar sesión' });
      res.json({ ok: true });
    });
  } else {
    res.json({ ok: true });
  }
});



// Configuración de la base de datos
const dbConfig = {
  server: 'DESKTOP-6HNM4F3',
  database: 'colegio_db',
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  authentication: {
    type: 'ntlm',
    options: { domain: 'localhost' }
  }
};

// ===== Guardar formulario =====
app.post('/submit', async (req, res) => {
  try {
    const { formType, data } = req.body;
    if (!formType || !data) return res.status(400).json({ ok: false, msg: 'Falta formType o data' });

    const pool = await sql.connect(dbConfig);

    const columns = Object.keys(data).join(',');
    const values = Object.keys(data)
      .map((key, idx) => `@param${idx}`)
      .join(',');

    const request = pool.request();
    Object.values(data).forEach((val, idx) => request.input(`param${idx}`, val));

    const query = `INSERT INTO dbo.${formType} (${columns}) VALUES (${values})`;
    await request.query(query);

    res.json({ ok: true, msg: 'Guardado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error al guardar en SQL', error: err.message });
  }
});

function authMiddleware(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ ok: false, msg: 'No autorizado' });
  }
  next();
}

// Ejemplo: proteger la ruta de búsqueda
app.get('/buscar', authMiddleware, async (req, res) => {
  // tu código de búsqueda aquí
});


// Buscar alumnos
app.get('/buscar', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ ok: true, data: [] });

    const pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input('busqueda', sql.VarChar, `%${q}%`);

    const query = `
      SELECT TOP 10 * 
      FROM dbo.alumnos
      WHERE nombre_estudiante LIKE @busqueda
         OR CAST(dni AS VARCHAR) LIKE @busqueda
         OR grado_cursa LIKE @busqueda
    `;

    const result = await request.query(query);
    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error al buscar', error: err.message });
  }
});


document.getElementById('btnBuscar').addEventListener('click', async () => {
  const q = document.getElementById('busqueda').value.trim();
  if (!q) return alert('Ingresa un nombre o DNI');

  const res = await fetch(`/buscar?q=${encodeURIComponent(q)}`);
  const data = await res.json();

  const tbody = document.querySelector('#tablaResultados tbody');
  tbody.innerHTML = ''; // limpiar tabla

  if (data.ok && data.data.length > 0) {
    data.data.forEach(alumno => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${alumno.dni}</td>
        <td>${alumno.nombre_estudiante}</td>
        <td>${alumno.grado_cursa}</td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    tbody.innerHTML = `<tr><td colspan="3">No se encontraron resultados</td></tr>`;
  }
});



// ===== Actualizar alumno =====
app.post('/actualizar', async (req, res) => {
  try {
    const { formType, data } = req.body;
    if (!formType || !data || !data.dni)
      return res.status(400).json({ ok: false, msg: 'Falta formType o DNI' });

    const pool = await sql.connect(dbConfig);

    // Generar SET dinámico
    const setQuery = Object.keys(data)
      .filter(k => k !== 'dni')
      .map((key, idx) => `${key}=@param${idx}`)
      .join(',');

    const request = pool.request();
    Object.keys(data)
      .filter(k => k !== 'dni')
      .forEach((key, idx) => request.input(`param${idx}`, data[key]));
    request.input('dni', data.dni);

    const query = `UPDATE dbo.${formType} SET ${setQuery} WHERE dni=@dni`;
    await request.query(query);

    res.json({ ok: true, msg: 'Alumno actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error al actualizar', error: err.message });
  }
});


app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
