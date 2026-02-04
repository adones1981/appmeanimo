// Ruta para crear un nuevo partido o actividad
app.post('/api/crear-partido', async (req, res) => {
  const { deporte, lugar, fecha_hora, cupos_totales } = req.body;

  const { data, error } = await supabase
    .from('partidos')
    .insert([
      { 
        deporte, 
        lugar, 
        fecha_hora, 
        cupos_totales: parseInt(cupos_totales), 
        cupos_actuales: 0 
      }
    ]);

  if (error) return res.status(400).json(error);
  res.json({ mensaje: "¡Actividad creada con éxito! 🚀" });
});