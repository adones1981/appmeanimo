const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/', (req, res) => res.send('⚽ Servidor MeAnimo Activo - Gestión de Comentarios y Borrado'));

// Obtener partidos
app.get('/api/partidos', async (req, res) => {
    const { data, error } = await supabase.from('partidos').select('*').order('id', { ascending: false });
    res.json(data || []);
});

// Crear partido
app.post('/api/crear-partido', async (req, res) => {
    const { deporte, lugar, fecha_hora, cupos_totales, comentarios } = req.body;
    const { error } = await supabase.from('partidos').insert([{ 
        deporte, lugar, fecha_hora, cupos_totales: parseInt(cupos_totales), comentarios, cupos_actuales: 0 
    }]);
    if (error) return res.status(400).json(error);
    res.json({ mensaje: "Publicación creada con éxito" });
});

// Editar comentario
app.put('/api/partidos/:id/comentario', async (req, res) => {
    const { comentarios } = req.body;
    const { error } = await supabase.from('partidos').update({ comentarios }).eq('id', req.params.id);
    if (error) return res.status(400).json(error);
    res.json({ mensaje: "Comentario actualizado" });
});

// Eliminar publicación
app.delete('/api/partidos/:id', async (req, res) => {
    const { error } = await supabase.from('partidos').delete().eq('id', req.params.id);
    if (error) return res.status(400).json(error);
    res.json({ mensaje: "Publicación eliminada" });
});

// Rutas de inscripción (unirse/inscritos)
app.get('/api/partidos/:id/inscritos', async (req, res) => {
    const { data } = await supabase.from('inscripciones').select('nombre_usuario').eq('partido_id', req.params.id);
    res.json(data || []);
});

app.post('/api/unirse', async (req, res) => {
    const { partidoId, nombre_usuario } = req.body;
    await supabase.from('inscripciones').insert([{ partido_id: partidoId, nombre_usuario }]);
    const { data: p } = await supabase.from('partidos').select('cupos_actuales').eq('id', partidoId).single();
    await supabase.from('partidos').update({ cupos_actuales: p.cupos_actuales + 1 }).eq('id', partidoId);
    res.json({ mensaje: "Te has unido" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Puerto ${PORT}`));