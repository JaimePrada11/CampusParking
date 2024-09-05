
const sections = document.querySelectorAll('section[id]')

function scrollActive() {
    const scrollY = window.pageYOffset

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight,
            sectionTop = current.offsetTop - 50,
            sectionId = current.getAttribute('id')

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link')
        } else {
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link')
        }
    })
}
window.addEventListener('scroll', scrollActive)


/*=============== CHANGE BACKGROUND HEADER ===============*/
function scrollHeader() {
    const header = document.getElementById('header')
    // When the scroll is greater than 80 viewport height, add the scroll-header class to the header tag
    if (this.scrollY >= 80) header.classList.add('scroll-header'); else header.classList.remove('scroll-header')
}
window.addEventListener('scroll', scrollHeader)



// LLAMADO DE MOCKAPI

const urlVehiculos = "https://66d47f105b34bcb9ab3ebfd8.mockapi.io/api/v1/Vehiculos";
const plantilla = document.querySelector(".plantillaVehiculo")



document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formvehiculo");

    if (formulario) {
        formulario.addEventListener("submit", async (event) => {
            event.preventDefault();

            const placa = document.getElementById("placa").value;
            const tipo = document.querySelector('input[name="vehiculo"]:checked').value;
            const estado = false; // Asegúrate de establecer el estado correctamente

            // Definir las visitas con la estructura deseada
            const visitas = [
                {
                    "Lugar": "A1",
                    "Hora-Entrada": "",
                    "Hora-Salida": "",
                    "Tiempo": "",
                    "Costo": ""
                },

            ];

            // Crear un nuevo vehículo con el formato adecuado
            const nuevoVehiculo = {
                ID: `id-${Date.now()}`, // Generar un ID único
                Placa: placa,
                Tipo: tipo,
                Estado: estado,
                Visitas: visitas
            };

            try {
                // Verificar si la placa ya existe
                const responseExistencia = await fetch(urlVehiculos);
                if (!responseExistencia.ok) {
                    throw new Error('Error al verificar la existencia de la placa');
                }

                const vehiculosExistentes = await responseExistencia.json();
                const placaExiste = vehiculosExistentes.some(vehiculo => vehiculo.Placa === nuevoVehiculo.Placa);

                if (placaExiste) {
                    alert('La placa ya existe. Por favor, ingrese una placa diferente.');
                    return;
                }

                // Enviar el nuevo vehículo a la API
                const response = await fetch(urlVehiculos, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(nuevoVehiculo)
                });

                if (!response.ok) {
                    throw new Error('Error en la respuesta de la API');
                }

                const data = await response.json();
                console.log('Vehículo creado:', data);
                alert('Vehículo creado con éxito');

                // Limpiar el formulario
                formulario.reset();
            } catch (error) {
                console.error('Error al crear el vehículo:', error);
                alert('Hubo un error al crear el vehículo');
            }
        });
    } else {
        console.error('Formulario con clase "formvehiculo" no encontrado.');
    }

});

document.addEventListener("DOMContentLoaded", () => {
    const urlVehiculos = "https://66d47f105b34bcb9ab3ebfd8.mockapi.io/api/v1/Vehiculos";
    const plantilla = document.querySelector('.plantillaVehiculo');
    const contenedor = document.getElementById('contenedor');
    const filterButton = document.getElementById('filter-button');
    const filterPlaca = document.getElementById('filter-placa');
    const radioButtons = document.querySelectorAll('input[name="vehiculo"]');

    const imagenes = {
        moto: "https://media-public.canva.com/ujLLY/MAEu5YujLLY/1/t.png",
        carro: "https://media-public.canva.com/SXI7M/MAEGS_SXI7M/1/t.png",
        camion: "https://media-public.canva.com/MAA0IRNFyKU/2/thumbnail_large-1.png"
    };

    let vehiculos = [];

    function mostrarvehiculos(filteredVehiculos) {
        contenedor.innerHTML = ''; 
        filteredVehiculos.forEach(vehiculo => {
            const nvplantilla = document.importNode(plantilla.content, true);

            const imgElement = nvplantilla.querySelector('img');
            imgElement.src = imagenes[vehiculo.Tipo.toLowerCase()];
            imgElement.alt = `Imagen de ${vehiculo.Tipo}`;

            nvplantilla.querySelector('.placa').textContent = vehiculo.Placa;
            nvplantilla.querySelector('.tipo').textContent = vehiculo.Tipo;

            const visita = vehiculo.Visitas[0];
            nvplantilla.querySelector('.lugar span').textContent = visita.Lugar;
            nvplantilla.querySelector('.infoestacionamiento p:nth-child(1) span').textContent = visita["Hora-Entrada"];
            nvplantilla.querySelector('.infoestacionamiento p:nth-child(2) span').textContent = visita["Hora-Salida"];
            nvplantilla.querySelector('.infoestacionamiento p:nth-child(3) span').textContent = visita.Tiempo;
            nvplantilla.querySelector('.infoestacionamiento p:nth-child(4) span').textContent = `${visita.Costo} COP`;

            contenedor.appendChild(nvplantilla);
        });
    }

    function applyFilters() {
        let filteredVehiculos = vehiculos;

        const selectedType = Array.from(radioButtons).find(rb => rb.checked)?.value;
        if (selectedType && selectedType !== 'todos') {
            filteredVehiculos = filteredVehiculos.filter(vehiculo => vehiculo.Tipo === selectedType);
        }

        const placaFilter = filterPlaca.value.toUpperCase();
        if (placaFilter) {
            filteredVehiculos = filteredVehiculos.filter(vehiculo => vehiculo.Placa.toUpperCase().includes(placaFilter));
        }

        renderVehiculos(filteredVehiculos);
    }

    fetch(urlVehiculos)
        .then(response => response.json())
        .then(data => {
            vehiculos = data; 
            mostrarvehiculos(vehiculos); 
        })
        .catch(error => {
            console.error('Error al cargar los datos:', error);
        });

    filterButton.addEventListener('click', applyFilters);
});
