// LOGIN JUGADOR
document.getElementById("loginJugadorForm")?.addEventListener("submit", function(e) {
    e.preventDefault();

    const user = document.getElementById("jugadorUser").value.trim();
    const pass = document.getElementById("jugadorPass").value.trim();

    fetch("data.json")
        .then(res => res.json())
        .then(data => {
            const players = data.players;

            const found = players.find(p =>
                p.username.toUpperCase() === user.toUpperCase() &&
                p.password === pass
            );

            if (!found) {
                document.getElementById("loginJugadorError").innerText =
                    "❌ Usuario o contraseña incorrectos";
                return;
            }

            localStorage.setItem("jugadorActivo", found.username);
            window.location.href = "jugador_home.html";
        });
});

// MOSTRAR / OCULTAR CONTRASEÑA
function toggleJugadorPass() {
    const input = document.getElementById("jugadorPass");
    input.type = input.type === "password" ? "text" : "password";
}
