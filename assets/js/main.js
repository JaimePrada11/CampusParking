
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
const plantilla = document.querySelector(".plantillaVehiculo");

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById('contenedor');
    const contenedorHistorial = document.getElementById('contenedorHistorial'); // Define aquí
    const filterButton = document.getElementById('filter-button');
    const filterPlaca = document.getElementById('filter-placa');
    const radioButtons = document.querySelectorAll('input[name="vehiculo"]');

    const imagenes = {
        moto: "https://media-public.canva.com/ujLLY/MAEu5YujLLY/1/t.png",
        carro: "https://media-public.canva.com/SXI7M/MAEGS_SXI7M/1/t.png",
        camion: "https://media-public.canva.com/MAA0IRNFyKU/2/thumbnail_large-1.png"
    };

    // Precios por hora
    const precioMoto = 10000;
    const precioCarro = 20000;
    const precioCamion = 20000;

    let vehiculos = [];

    function mostrarvehiculos(filteredVehiculos) {
        contenedor.innerHTML = '';
        filteredVehiculos.forEach(vehiculo => {
            if (!vehiculo.HoraSalida) { 
                const nvplantilla = document.importNode(plantilla.content, true);

                const imgElement = nvplantilla.querySelector('img');
                imgElement.src = imagenes[vehiculo.Tipo.toLowerCase()];
                imgElement.alt = `Imagen de ${vehiculo.Tipo}`;

                nvplantilla.querySelector('.placa').textContent = vehiculo.Placa;
                nvplantilla.querySelector('.tipo').textContent = vehiculo.Tipo;
                nvplantilla.querySelector('.lugar span').textContent = vehiculo.Lugar;
                nvplantilla.querySelector('.horaentrada span').textContent = vehiculo.HoraEntrada;
                nvplantilla.querySelector('.horasalida').style.display = "none";
                nvplantilla.querySelector('.tiempo').style.display = "none";
                nvplantilla.querySelector('.costo').style.display = "none";

                // Agregar botón de salida
                const btnSalida = nvplantilla.querySelector('#sacar');
                btnSalida.addEventListener('click', () => registrarSalida(vehiculo));

                contenedor.appendChild(nvplantilla);
            }
        });
    }

    function mostrarHistorial() {
        if (!contenedorHistorial) {
            console.error("Contenedor de historial no está definido.");
            return;
        }
        contenedorHistorial.innerHTML = '';
        vehiculos.forEach(vehiculo => {
            if (vehiculo.HoraSalida) { 
                const nvplantilla = document.importNode(plantilla.content, true);

                const imgElement = nvplantilla.querySelector('img');
                imgElement.src = imagenes[vehiculo.Tipo.toLowerCase()];
                imgElement.alt = `Imagen de ${vehiculo.Tipo}`;

                nvplantilla.querySelector('.placa').textContent = vehiculo.Placa;
                nvplantilla.querySelector('.tipo').textContent = vehiculo.Tipo;
                nvplantilla.querySelector('.lugar span').textContent = vehiculo.Lugar;
                nvplantilla.querySelector('.horaentrada span').textContent = vehiculo.HoraEntrada;
                nvplantilla.querySelector('.horasalida span').textContent = vehiculo.HoraSalida;
                nvplantilla.querySelector('.tiempo span').textContent = vehiculo.Tiempo;
                nvplantilla.querySelector('.costo span').textContent = vehiculo.Costo;
                nvplantilla.querySelector('#sacar').style.display = "none";
                contenedorHistorial.appendChild(nvplantilla);
            }
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

        mostrarvehiculos(filteredVehiculos);
    }

    function agregarVehiculo(nuevoVehiculo) {
        vehiculos.push(nuevoVehiculo);
        mostrarvehiculos(vehiculos);
    }

    async function registrarSalida(vehiculo) {
        const ahora = new Date();
        const HoraSalida = ahora.toTimeString().split(' ')[0].slice(0, 5);

        const entrada = new Date();
        const [horasEntrada, minutosEntrada] = vehiculo.HoraEntrada.split(':');
        entrada.setHours(horasEntrada);
        entrada.setMinutes(minutosEntrada);

        const tiempoEnMinutos = Math.floor((ahora - entrada) / 60000);
        const horasTotales = Math.ceil(tiempoEnMinutos / 60);

        let costoPorHora;
        switch (vehiculo.Tipo.toLowerCase()) {
            case 'moto':
                costoPorHora = precioMoto;
                break;
            case 'carro':
                costoPorHora = precioCarro;
                break;
            case 'camion':
                costoPorHora = precioCamion;
                break;
            default:
                costoPorHora = 0;
                break;
        }

        const costoTotal = horasTotales * costoPorHora;

        const vehiculoActualizado = {
            ...vehiculo,
            HoraSalida: HoraSalida,
            Tiempo: horasTotales,
            Costo: costoTotal,
            Estado: true 
        };

        try {
            const response = await fetch(`${urlVehiculos}/${vehiculo.ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(vehiculoActualizado)
            });

            if (!response.ok) {
                throw new Error('Error al registrar la salida del vehículo.');
            }

            const data = await response.json();
            alert(`Vehículo con placa ${vehiculo.Placa} ha salido. Tiempo total: ${horasTotales} horas. Costo total: ${costoTotal} COP.`);

            vehiculos = vehiculos.map(v => v.ID === vehiculo.ID ? data : v);
            mostrarvehiculos(vehiculos);

            mostrarHistorial();
        } catch (error) {
            console.error('Error al registrar la salida del vehículo:', error);
            alert('Error al registrar la salida.');
        }
    }

    const plantillaHistorial = document.getElementById('plantillaVehiculoHistorial').content;

    async function mostrarHistorial() {
        if (!contenedorHistorial) {
            console.error("Contenedor de historial no está definido.");
            return;
        }
        contenedorHistorial.innerHTML = '';
        vehiculos.forEach(vehiculo => {
            if (vehiculo.HoraSalida) { // Solo mostrar vehículos con HoraSalida
                const nvplantilla = document.importNode(plantillaHistorial, true);

                const imgElement = nvplantilla.querySelector('img');
                imgElement.src = imagenes[vehiculo.Tipo.toLowerCase()];
                imgElement.alt = `Imagen de ${vehiculo.Tipo}`;

                nvplantilla.querySelector('.placa').textContent = vehiculo.Placa;
                nvplantilla.querySelector('.tipo').textContent = vehiculo.Tipo;
                nvplantilla.querySelector('.lugar span').textContent = vehiculo.Lugar;
                nvplantilla.querySelector('.horaentrada span').textContent = vehiculo.HoraEntrada;
                nvplantilla.querySelector('.horasalida span').textContent = vehiculo.HoraSalida;
                nvplantilla.querySelector('.tiempo span').textContent = vehiculo.Tiempo;
                nvplantilla.querySelector('.costo span').textContent = vehiculo.Costo;

                // Cambiar el botón de salida por un botón de borrar
                const btnBorrar = nvplantilla.querySelector('#borrar');
                btnBorrar.addEventListener('click', () => borrarVehiculo(vehiculo.ID));

                contenedorHistorial.appendChild(nvplantilla);
            }
        });
    }

    async function borrarVehiculo(id) {
        try {
            const response = await fetch(`${urlVehiculos}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el vehículo.');
            }

            vehiculos = vehiculos.filter(v => v.ID !== id);
            mostrarvehiculos(vehiculos); 
            mostrarHistorial(); 

            alert('Vehículo eliminado exitosamente.');
        } catch (error) {
            console.error('Error al eliminar el vehículo:', error);
            alert('Error al eliminar el vehículo.');
        }
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

    filterPlaca.addEventListener('input', applyFilters);

    radioButtons.forEach(rb => rb.addEventListener('change', applyFilters));

    const formulario = document.getElementById('formvehiculo');
    if (formulario) {
        formulario.addEventListener('submit', async (event) => {
            event.preventDefault();

            const placa = document.getElementById("placa").value.toUpperCase();
            const tipo = document.querySelector('input[name="vehiculo"]:checked').value;
            const estado = false;
            const Lugar = "a1";
            const ahora = new Date();
            const Entrada = ahora.toTimeString().split(' ')[0].slice(0, 5);
            const Salida = null;
            const Tiempo = null;
            const Costo = null;

            const placaRegex = /^[A-Z]{3}[0-9]{3}$/;
            if (!placaRegex.test(placa)) {
                alert('El formato de la placa no es válido. Debe ser asi (Ejemplo: ABC123).');
                return;
            }
            const placaExistente = vehiculos.find(vehiculo => vehiculo.Placa === placa);
            if (placaExistente) {
                if (placaExistente.Estado) { // Si el estado es true, permitir el registro
                    alert('Ya existe un vehículo con esta placa pero puede ser registrado nuevamente.');
                } else { // Si el estado es false, no permitir el registro
                    alert('Ya existe un vehículo con esta placa y no puede ser registrado nuevamente.');
                    return;
                }
            }

            const nuevoVehiculo = {
                ID: `id-${Date.now()}`,
                Placa: placa,
                Tipo: tipo,
                Estado: estado,
                Lugar: Lugar,
                HoraEntrada: Entrada,
                HoraSalida: Salida,
                Tiempo: Tiempo,
                Costo: Costo
            };

            try {
                const responseCreate = await fetch(urlVehiculos, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(nuevoVehiculo)
                });

                if (!responseCreate.ok) {
                    throw new Error('Error al crear el vehículo');
                }

                const data = await responseCreate.json();
                alert('Vehículo creado con éxito.');

                agregarVehiculo(data);
            } catch (error) {
                console.error('Error al crear el vehículo:', error);
                alert('Error al crear el vehículo.');
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const contenedorHistorial = document.getElementById('contenedorHistorial');
    const plantillaHistorial = document.getElementById('plantillaVehiculoHistorial').content;

    async function borrarVehiculo(id) {
        try {
            const response = await fetch(`${urlVehiculos}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el vehículo.');
            }

            // Actualizar la lista local de vehículos
            vehiculos = vehiculos.filter(v => v.ID !== id);
            mostrarvehiculos(vehiculos); // Refrescar la lista de vehículos
            mostrarHistorial(); // Refrescar el historial

            alert('Vehículo eliminado exitosamente.');
        } catch (error) {
            console.error('Error al eliminar el vehículo:', error);
            alert('Error al eliminar el vehículo.');
        }
    }

    fetchVehiculos();
});