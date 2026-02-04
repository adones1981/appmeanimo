// Obtener inscritos de un partido
app.get('/api/partidos/:id/inscritos', async (req, res) => {
    const { data, error } = await supabase
        .from('inscripciones')
        .select('nombre_usuario')
        .eq('partid_id', req.params.id);
    res.json(data);
});

// Ruta para desunirse
app.post('/api/desunirse', async (req, res) => {
    const { partidoId, nombre_usuario } = req.body;

    // 1. Eliminar la inscripción
    const { error: delError } = await supabase
        .from('inscripciones')
        .delete()
        .eq('partido_id', partidoId)
        .eq('nombre_usuario', nombre_usuario);

    if (delError) return res.status(400).json({ error: "No se pudo eliminar" });

    // 2. Restar 1 al contador del partido
    const { data: p } = await supabase.from('partidos').select('cupos_actuales').eq('id', partidoId).single();
    await supabase.from('partidos').update({ cupos_actuales: Math.max(0, p.cupos_actuales - 1) }).eq('id', partidoId);

    res.json({ mensaje: "Te has desvinculado del partido." });
});