// INICIO DE SESION 
const datausuarios = "../data/Usuarios.json";

formularioregistro = document.querySelector(".login");

formularioregistro.addEventListener("submit", async (event) => {
    event.preventDefault(); 

    try {
        const response = await fetch(datausuarios);

        if (!response.ok) {
            throw new Error('Error al cargar el JSON: ' + response.statusText);
        }

        const data = await response.json();
        console.log(data); 

        const usuario = document.getElementById('usuario').value;
        const contraseña = document.getElementById('password').value;

        const usuarioEncontrado = data.find(user => user.Usuario === usuario && user.Contraseña === contraseña);

        if (usuarioEncontrado) {
            alert('Inicio de sesión exitoso');
            localStorage.setItem('Usuario', JSON.stringify(usuarioEncontrado))
            formularioregistro.reset();
            window.location.href = '../pages/Home.html';

        } else {
            alert('Usuario o contraseña incorrectos');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al iniciar sesión');
    }
});