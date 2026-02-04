const express = require('express');
const cors = require('cors'); // Requerido para solucionar el error que viste en consola
const { createClient } = require('@supabase/supabase-js');

const app = express();

// CONFIGURACIÓN DE SEGURIDAD (CORS)
// Esto permite que tu frontend en Render pueda hablar con este backend
app.use(cors({
    origin: 'https://appmeanimo.onrender.com'
}));

app.use(express.json());

// CONFIGURACIÓN DE SUPABASE
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// RUTA PARA VERIFICAR EL SERVIDOR
app.get('/', (req, res) => {
  res.send('⚽ El servidor de MeAnimo está funcionando correctamente');
});

// RUTA PARA OBTENER TODOS LOS PARTIDOS
app.get('/api/partidos', async (req, res) => {
  const { data, error } = await supabase.from('partidos').select('*');
  if (error) return res.status(400).json(error);
  res.json(data);
});

// TU RUTA ACTUALIZADA PARA CREAR ACTIVIDADES
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

// RUTA PARA UNIRSE A UN PARTIDO
app.post('/api/unirse', async (req, res) => {
  const { partidoId } = req.body;
  
  // Primero obtenemos el estado actual del partido
  const { data: partido, error: errorFetch } = await supabase
    .from('partidos')
    .select('cupos_actuales, cupos_totales')
    .eq('id', partidoId)
    .single();

  if (errorFetch || !partido) return res.status(404).json({ error: "Partido no encontrado" });

  if (partido.cupos_actuales >= partido.cupos_totales) {
    return res.status(400).json({ error: "¡Partido lleno!" });
  }

  // Aumentamos el contador de inscritos
  const { error: errorUpdate } = await supabase
    .from('partidos')
    .update({ cupos_actuales: partido.cupos_actuales + 1 })
    .eq('id', partidoId);

  if (errorUpdate) return res.status(400).json(errorUpdate);
  res.json({ mensaje: "¡Te has unido exitosamente! ⚽" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});