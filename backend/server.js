const express = require('express');
const cors = require('cors'); // Vital para que guarde los eventos
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Permite que tu frontend guarde datos sin errores de seguridad
app.use(cors()); 
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// RUTA PARA CREAR USUARIOS (Nueva)
app.post('/api/usuarios', async (req, res) => {
    const { nombre, email, password } = req.body;
    const { data, error } = await supabase.from('usuarios').insert([{ nombre, email, password }]);
    if (error) return res.status(400).json(error);
    res.json({ mensaje: "Usuario creado con éxito" });
});

// TU RUTA DE EVENTOS (Corregida para asegurar guardado)
app.post('/api/crear-partido', async (req, res) => {
    const { deporte, lugar, fecha_hora, cupos_totales } = req.body;
    const { data, error } = await supabase.from('partidos').insert([
        { deporte, lugar, fecha_hora, cupos_totales: parseInt(cupos_totales), cupos_actuales: 0 }
    ]);
    if (error) return res.status(400).json(error);
    res.json({ mensaje: "¡Evento guardado en la base de datos! 🚀" });
});

app.listen(process.env.PORT || 10000);