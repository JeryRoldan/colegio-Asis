const express = require('express');
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




app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
