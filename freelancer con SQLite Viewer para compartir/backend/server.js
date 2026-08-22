const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde tu frontend HTML
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión/Creación de la Base de Datos SQLite
const db = new sqlite3.Database('./contactos.db', (err) => {
    if (err) console.error("Error al conectar BD:", err.message);
    else console.log("Base de datos SQLite conectada correctamente.");
});

// Crear tabla de mensajes si no existe
db.run(`CREATE TABLE IF NOT EXISTS mensajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    telefono TEXT,
    correo TEXT,
    mensaje TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// 1. Ruta para GUARDAR los mensajes enviados desde el formulario
app.post('/api/contacto', (req, res) => {
    const { nombre, telefono, correo, mensaje } = req.body;

    if (!nombre || !correo || !mensaje) {
        return res.status(400).json({ error: "Por favor llena los campos requeridos." });
    }

    const query = `INSERT INTO mensajes (nombre, telefono, correo, mensaje) VALUES (?, ?, ?, ?)`;
    db.run(query, [nombre, telefono, correo, mensaje], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ mensaje: "Mensaje guardado con éxito", id: this.lastID });
    });
});

// 2. Ruta para VER todos los mensajes recibidos en formato JSON
app.get('/api/contacto', (req, res) => {
    const query = `SELECT * FROM mensajes ORDER BY fecha DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});