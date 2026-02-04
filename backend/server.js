const express = require('express');
const cors = require('cors'); 
const { createClient } = require('@supabase/supabase-js');

const app = express();

// 1. SOLUCIÓN AL ERROR DE CONEXIÓN: Habilitar CORS para todos
app.use(cors()); 
app.use(express.json());

// Configuración de Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 2. SOLUCIÓN AL "Cannot GET /": Definir la ruta raíz
app.get('/', (req, res) => {
    res.send('⚽ El servidor de MeAnimo está en línea. Listo para recibir partidos de Inacap Santiago Sur.');
});

// RUTA PARA VER ACTIVIDADES (GET)
app.get('/api/partidos', async (req, res) => {
    const { data, error } = await supabase.from('partidos').select('*').order('fecha_hora', { ascending: true });
    if (error) return res.status(400).json(error);
    res.json(data);
});

// RUTA PARA CREAR ACTIVIDADES (POST)
app.post('/api/crear-partido', async (req, res) => {
    const { deporte, lugar, fecha_hora, cupos_totales } = req.body;
    const { data, error } = await supabase.from('partidos').insert([
        { deporte, lugar, fecha_hora, cupos_totales: parseInt(cupos_totales), cupos_actuales: 0 }
    ]);
    if (error) return res.status(400).json(error);
    res.json({ mensaje: "¡Evento guardado con éxito! 🚀" });
});

// RUTA PARA UNIRSE
app.post('/api/unirse', async (req, res) => {
    const { partidoId } = req.body;
    const { data: p } = await supabase.from('partidos').select('cupos_actuales').eq('id', partidoId).single();
    const { error } = await supabase.from('partidos').update({ cupos_actuales: p.cupos_actuales + 1 }).eq('id', partidoId);
    if (error) return res.status(400).json(error);
    res.json({ mensaje: "¡Inscrito correctamente!" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});