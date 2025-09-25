function resetPupusaSelection(card) {
    const quantityInput = card.querySelector('input[type="number"]');
    const masaRadios = card.querySelectorAll('input[type="radio"]');

    if (quantityInput) {
        quantityInput.value = '1';
    }
    masaRadios.forEach(radio => radio.checked = false);
}

const restauranteNumero = '50379111545';
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

const modalContainer = document.getElementById('modal-container');
const modalMessage = document.getElementById('modal-message');
const closeModalBtn = document.getElementById('close-modal');

const showModal = (content) => {
    modalMessage.textContent = content.mensaje;
    modalContainer.classList.remove('hidden');
};

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        modalContainer.classList.add('hidden');
    });
}

const listaPedido = document.getElementById('lista-pedido');
const totalElement = document.getElementById('total');
const botonesAnadir = document.querySelectorAll('.add-to-cart');
const botonConfirmar = document.getElementById('confirmar-pedido');
const inputDireccion = document.getElementById('direccion-cliente');
const messageContainer = document.getElementById('message-container');
const domicilioBtn = document.getElementById('dommicilio-btn');
const recogerBtn = document.getElementById('recoger-btn');
const inputTelefono = document.getElementById('telefono-cliente');
const inputNombre = document.getElementById('nombre-cliente');


let tipoEntrega = 'domicilio';

// Mensajes flotantes
const showMessage = (message, type = 'error') => {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.className = `p-4 rounded-lg shadow-md text-sm transition-all duration-300 transform -translate-y-full opacity-0 fixed top-4 left-1/2 -translate-x-1/2 z-50
                            ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`;
    messageContainer.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.transform = 'translateY(0)';
        messageDiv.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        messageDiv.style.transform = 'translateY(-100%)';
        messageDiv.style.opacity = '0';
        messageDiv.addEventListener('transitionend', () => messageDiv.remove());
    }, 3000);
};

// Actualizar carrito
const actualizarCarrito = () => {
    listaPedido.innerHTML = '';
    let total = 0;
    carrito.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center text-gray-600 text-base';
        const nombreConMasa = item.tipoMasa ? `${item.nombre} (${item.tipoMasa})` : item.nombre;
        li.innerHTML = `
            <div class="flex items-center">
                <span class="decrease-btn mr-2 bg-red-200 text-red-700 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer" data-index="${index}">-</span>
                <span class="font-semibold">${nombreConMasa} (x${item.cantidad})</span>
            </div>
            <div>
                <span class="mr-2">$${(item.precio * item.cantidad).toFixed(2)}</span>
                <span class="remove-btn bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer" data-index="${index}">&times;</span>
            </div>
        `;
        listaPedido.appendChild(li);
        total += item.precio * item.cantidad;
    });
    
    totalElement.textContent = `$${total.toFixed(2)}`;
    localStorage.setItem('carrito', JSON.stringify(carrito));

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', removerProducto);
    });
    document.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.addEventListener('click', disminuirCantidad);
    });
};

const removerProducto = (event) => {
    const index = event.target.dataset.index;
    carrito.splice(index, 1);
    actualizarCarrito();
};

const disminuirCantidad = (event) => {
    const index = event.target.dataset.index;
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        carrito.splice(index, 1);
    }
    actualizarCarrito();
};

// Añadir al carrito
botonesAnadir.forEach(boton => {
    boton.addEventListener('click', () => {
        const nombre = boton.dataset.nombre;
        const precio = parseFloat(boton.dataset.precio);
        
        const card = boton.closest('.pupusa-card');
        const tipoMasaInput = card.querySelector('input[name^="masa-"]:checked');
        
        let tipoMasa = null;
        if (tipoMasaInput) {
            tipoMasa = tipoMasaInput.value;
        }

        // En pupusas, exigir masa
        if (card.querySelector('input[type="radio"]') && !tipoMasaInput) {
            showMessage('Por favor, selecciona si la pupusa es de maíz o de arroz.', 'error');
            return;
        }

        const targetId = boton.dataset.target;
        let cantidad = 1;
        if (targetId) {
            const cantidadInput = document.getElementById(targetId);
            if (cantidadInput) {
                cantidad = parseInt(cantidadInput.value, 10);
            }
        }
        
        if (cantidad > 0) {
            const existingItem = carrito.find(item => item.nombre === nombre && item.tipoMasa === tipoMasa);
            if (existingItem) {
                existingItem.cantidad += cantidad;
            } else {
                carrito.push({ nombre, precio, cantidad, tipoMasa });
            }
            actualizarCarrito();
            showMessage(`${cantidad} ${nombre}${tipoMasa ? ' de ' + tipoMasa : ''} añadido${cantidad > 1 ? 's' : ''}.`, 'success');
            
            resetPupusaSelection(card);
        }
    });
});

// Opciones entrega (solo index.html tiene estos botones)
if (domicilioBtn && recogerBtn && inputDireccion) {
    const direccionContainer = inputDireccion.parentElement;

    domicilioBtn.addEventListener('click', () => {
        tipoEntrega = 'domicilio';
        domicilioBtn.classList.add('bg-blue-600');
        recogerBtn.classList.remove('bg-green-600');
        recogerBtn.classList.add('bg-gray-400');
        direccionContainer.style.display = 'block';
        inputDireccion.setAttribute('required', 'true');
        showMessage('Seleccionaste: Entrega a domicilio.', 'success');
    });

    recogerBtn.addEventListener('click', () => {
        tipoEntrega = 'recoger';
        recogerBtn.classList.add('bg-green-600');
        domicilioBtn.classList.remove('bg-blue-600');
        domicilioBtn.classList.add('bg-gray-400');
        direccionContainer.style.display = 'none';
        inputDireccion.value = '';
        inputDireccion.removeAttribute('required');
        showMessage('Seleccionaste: Pasar a recoger.', 'success');
    });

    tipoEntrega = 'domicilio';
    domicilioBtn.classList.add('bg-blue-600');
    recogerBtn.classList.add('bg-gray-400');
    if (direccionContainer) {
        direccionContainer.style.display = 'block';
        inputDireccion.setAttribute('required', 'true');
    }
}


// Confirmar pedido
if (botonConfirmar) {
    botonConfirmar.addEventListener('click', () => {
        if (carrito.length === 0) {
            showMessage('Por favor, añade productos a tu pedido antes de enviarlo.', 'error');
            return;
        }

        if (tipoEntrega === 'domicilio' && inputDireccion && inputDireccion.required) {
            const direccionCliente = inputDireccion.value.trim();
            if (direccionCliente === '') {
                showMessage('Para la entrega a domicilio, debes ingresar una dirección.', 'error');
                return;
            }
        }
        const telefonoCliente = inputTelefono ? inputTelefono.value.trim() : '';
if (telefonoCliente === '') {
    showMessage('Por favor, ingresa un número de contacto.', 'error');
    return;
}
   const nombreCliente = inputNombre ? inputNombre.value.trim() : '';
if (nombreCliente === '') {
    showMessage('Por favor, ingresa un nombre para el pedido.', 'error');
    return;
}

        

        let mensajeItems = [];
        let totalPedido = 0;

        carrito.forEach(item => {
            const nombreConMasa = item.tipoMasa ? `${item.nombre} (${item.tipoMasa})` : item.nombre;
            mensajeItems.push(`- ${nombreConMasa} (x${item.cantidad})`);
            totalPedido += item.precio * item.cantidad;
        });

        let mensaje = `¡Hola! Me gustaría hacer un pedido.\n\n`;
        if (tipoEntrega === 'domicilio' && inputDireccion) {
            mensaje += `Tipo de entrega: A domicilio\n`;
            mensaje += `Dirección: ${inputDireccion.value.trim()}\n\n`;
            mensaje += `Número de contacto: ${telefonoCliente}\n\n`;
            mensaje += `Nombre del cliente: ${nombreCliente}\n\n`;
        } else {
            mensaje += `Tipo de entrega: Pasar a recoger\n\n`;
            mensaje += `Número de contacto: ${telefonoCliente}\n\n`;
            mensaje += `Nombre del cliente: ${nombreCliente}\n\n`;

        }
        

        mensaje += mensajeItems.join('\n');
        mensaje += `\n\n*Total a pagar: $${totalPedido.toFixed(2)}*\n\n`;
        mensaje += "Por favor, confirma el pedido. ¡Gracias!";
        
        const mensajeCodificado = encodeURIComponent(mensaje);
        const urlWhatsApp = `https://wa.me/${restauranteNumero}?text=${mensajeCodificado}`;
        
        window.open(urlWhatsApp, '_blank');

        carrito = [];
        localStorage.removeItem('carrito');
        actualizarCarrito();
    });
}

actualizarCarrito();
