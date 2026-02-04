const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Obtener partidos
app.get('/api/partidos', async (req, res) => {
    const { data } = await supabase.from('partidos').select('*').order('id', { ascending: false });
    res.json(data || []);
});

// Crear partido con teléfono y comentarios
app.post('/api/crear-partido', async (req, res) => {
    const { deporte, lugar, fecha_hora, cupos_totales, comentarios, telefono_organizador } = req.body;
    const { error } = await supabase.from('partidos').insert([{ 
        deporte, lugar, fecha_hora, cupos_totales: parseInt(cupos_totales), 
        comentarios, telefono_organizador, cupos_actuales: 0 
    }]);
    if (error) return res.status(400).json(error);
    res.json({ mensaje: "Publicación creada con éxito" });
});

// Inscripción con VALIDACIÓN DE CUPOS
app.post('/api/unirse', async (req, res) => {
    const { partidoId, nombre_usuario } = req.body;

    const { data: partido } = await supabase.from('partidos').select('cupos_actuales, cupos_totales, telefono_organizador, deporte, lugar').eq('id', partidoId).single();

    if (partido.cupos_actuales >= partido.cupos_totales) {
        return res.status(400).json({ error: "¡Cupos llenos!" });
    }

    await supabase.from('inscripciones').insert([{ partido_id: partidoId, nombre_usuario }]);
    await supabase.from('partidos').update({ cupos_actuales: partido.cupos_actuales + 1 }).eq('id', partidoId);
    
    res.json({ mensaje: "Inscripción exitosa", telefono: partido.telefono_organizador, deporte: partido.deporte, lugar: partido.lugar });
});

// Editar y Eliminar
app.put('/api/partidos/:id/comentario', async (req, res) => {
    const { error } = await supabase.from('partidos').update({ comentarios: req.body.comentarios }).eq('id', req.params.id);
    res.json({ mensaje: "Actualizado" });
});

app.delete('/api/partidos/:id', async (req, res) => {
    await supabase.from('partidos').delete().eq('id', req.params.id);
    res.json({ mensaje: "Eliminado" });
});

app.get('/api/partidos/:id/inscritos', async (req, res) => {
    const { data } = await supabase.from('inscripciones').select('nombre_usuario').eq('partido_id', req.params.id);
    res.json(data || []);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor MeAnimo listo`));