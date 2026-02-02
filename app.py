from flask import Flask, render_template, redirect, url_for

app = Flask(__name__)

# Datos simulados del partido
partido = {
    "deporte": "Fútbol",
    "lugar": "Canchas Inacap Santiago",
    "fecha": "Viernes 20:00",
    "cupos_totales": 12,
    "participantes": ["Julio Adones", "Carlos"]
}

@app.route('/')
def home():
    return render_template('index.html', partido=partido)

@app.route('/unirse')
def unirse():
    if len(partido["participantes"]) < partido["cupos_totales"]:
        partido["participantes"].append("Nuevo Jugador")
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)
