document.addEventListener('DOMContentLoaded', ()=>{
    fetch('data.json').then(r=>r.json()).then(data=>{
        const jornada = data.jornadas[0]; 
        renderPronosticos(jornada, data);
    });
});

function renderPronosticos(jornada, data) {
    const usuarioActual = sessionStorage.getItem("currentUser");
    const contenedor = document.getElementById("tablaPronosticos");
    contenedor.innerHTML = "";

    const thead = document.createElement("thead");
    let headRow = document.createElement("tr");

    let thJugador = document.createElement("th");
    thJugador.textContent = "Jugador";
    headRow.appendChild(thJugador);

    jornada.partidos.forEach((p) => {
        const th = document.createElement("th");
        th.textContent = p.local + " - " + p.visitante;
        headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    contenedor.appendChild(thead);

    const tbody = document.createElement("tbody");

    data.players.forEach(player => {
        const fila = document.createElement("tr");
        const tdNombre = document.createElement("td");
        tdNombre.textContent = player.name;
        fila.appendChild(tdNombre);

        jornada.partidos.forEach((partido, index) => {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.maxLength = 1;

            const guardado = data.pronosticos?.[player.username]?.[jornada.id]?.[index] || "";
            input.value = guardado;

            if (player.username !== usuarioActual) {
                input.disabled = true;
            }

            input.addEventListener("input", () => {
                if (player.username === usuarioActual) {
                    if (!data.pronosticos[player.username]) data.pronosticos[player.username] = {};
                    if (!data.pronosticos[player.username][jornada.id]) data.pronosticos[player.username][jornada.id] = [];
                    data.pronosticos[player.username][jornada.id][index] = input.value;
                    localStorage.setItem("data_working", JSON.stringify(data));
                }
            });

            td.appendChild(input);
            fila.appendChild(td);
        });

        tbody.appendChild(fila);
    });

    contenedor.appendChild(tbody);
}