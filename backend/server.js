const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ESTA RUTA EVITA EL "CANNOT GET" AL ENTRAR AL LINK DEL BACKEND
app.get('/', (req, res) => {
    res.send('⚽ Servidor MeAnimo Activo. Las rutas de la API están funcionando correctamente.');
});

// Obtener partidos
app.get('/api/partidos', async (req, res) => {
    const { data } = await supabase.from('partidos').select('*').order('id', { ascending: false });
    res.json(data || []);
});

// Crear partido con mensaje de éxito
app.post('/api/crear-partido', async (req, res) => {
    const { deporte, lugar, fecha_hora, cupos_totales, comentarios, telefono_organizador } = req.body;
    const { error } = await supabase.from('partidos').insert([{ 
        deporte, lugar, fecha_hora, cupos_totales: parseInt(cupos_totales), 
        comentarios, telefono_organizador, cupos_actuales: 0 
    }]);
    if (error) return res.status(400).json(error);
    res.json({ mensaje: "¡Publicación creada con éxito!" });
});

// Unirse con validación de cupos
app.post('/api/unirse', async (req, res) => {
    const { partidoId, nombre_usuario } = req.body;
    const { data: p } = await supabase.from('partidos').select('*').eq('id', partidoId).single();
    
    if (p.cupos_actuales >= p.cupos_totales) {
        return res.status(400).json({ error: "¡Cupos llenos!" });
    }

    await supabase.from('inscripciones').insert([{ partido_id: partidoId, nombre_usuario }]);
    await supabase.from('partidos').update({ cupos_actuales: p.cupos_actuales + 1 }).eq('id', partidoId);
    res.json({ mensaje: "Inscrito", telefono: p.telefono_organizador, deporte: p.deporte, lugar: p.lugar });
});

// Salir del evento
app.post('/api/desunirse', async (req, res) => {
    const { partidoId, nombre_usuario } = req.body;
    const { data: insc } = await supabase.from('inscripciones').select('id').eq('partido_id', partidoId).eq('nombre_usuario', nombre_usuario).limit(1).single();
    
    if (insc) {
        await supabase.from('inscripciones').delete().eq('id', insc.id);
        const { data: p } = await supabase.from('partidos').select('cupos_actuales').eq('id', partidoId).single();
        await supabase.from('partidos').update({ cupos_actuales: Math.max(0, p.cupos_actuales - 1) }).eq('id', partidoId);
        res.json({ mensaje: "Has salido del evento" });
    } else {
        res.status(404).json({ error: "No se encontró tu inscripción" });
    }
});

// Ver inscritos
app.get('/api/partidos/:id/inscritos', async (req, res) => {
    const { data } = await supabase.from('inscripciones').select('nombre_usuario').eq('partido_id', req.params.id);
    res.json(data || []);
});

// Editar comentario
app.put('/api/partidos/:id/comentario', async (req, res) => {
    await supabase.from('partidos').update({ comentarios: req.body.comentarios }).eq('id', req.params.id);
    res.json({ mensaje: "Actualizado" });
});

// Eliminar publicación
app.delete('/api/partidos/:id', async (req, res) => {
    await supabase.from('partidos').delete().eq('id', req.params.id);
    res.json({ mensaje: "Eliminado" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor MeAnimo OK en puerto ${PORT}`));