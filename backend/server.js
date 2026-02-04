// 1. CARGAR LIBRERÍAS
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// 2. INICIALIZAR LA APP (Esto define "app")
const app = express();
app.use(cors());
app.use(express.json());

// 3. CONECTAR A LA BASE DE DATOS
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 4. RUTAS (Aquí van tus funciones de Mapas e Inscritos)
app.get('/', (req, res) => res.send('⚽ Servidor MeAnimo Activo con Mapas e Inscritos'));

app.get('/api/partidos', async (req, res) => {
    const { data, error } = await supabase.from('partidos').select('*').order('fecha_hora', { ascending: true });
    if (error) return res.status(400).json(error);
    res.json(data);
});

app.get('/api/partidos/:id/inscritos', async (req, res) => {
    const { data, error } = await supabase.from('inscripciones').select('nombre_usuario').eq('partido_id', req.params.id);
    if (error) return res.status(400).json(error);
    res.json(data || []);
});

app.post('/api/unirse', async (req, res) => {
    const { partidoId, nombre_usuario } = req.body;
    await supabase.from('inscripciones').insert([{ partido_id: partidoId, nombre_usuario }]);
    const { data: p } = await supabase.from('partidos').select('cupos_actuales').eq('id', partidoId).single();
    await supabase.from('partidos').update({ cupos_actuales: p.cupos_actuales + 1 }).eq('id', partidoId);
    res.json({ mensaje: "¡Te has unido con éxito!" });
});

app.post('/api/desunirse', async (req, res) => {
    const { partidoId, nombre_usuario } = req.body;
    await supabase.from('inscripciones').delete().eq('partido_id', partidoId).eq('nombre_usuario', nombre_usuario);
    const { data: p } = await supabase.from('partidos').select('cupos_actuales').eq('id', partidoId).single();
    await supabase.from('partidos').update({ cupos_actuales: Math.max(0, p.cupos_actuales - 1) }).eq('id', partidoId);
    res.json({ mensaje: "Ya no estás en la lista." });
});

app.post('/api/crear-partido', async (req, res) => {
    const { deporte, lugar, fecha_hora, cupos_totales } = req.body;
    const { error } = await supabase.from('partidos').insert([{ deporte, lugar, fecha_hora, cupos_totales, cupos_actuales: 0 }]);
    if (error) return res.status(400).json(error);
    res.json({ mensaje: "¡Evento publicado!" });
});

// 5. ENCENDER EL MOTOR
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});