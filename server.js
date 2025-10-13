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
