const restauranteNumero = '50375415287';
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

const listaPedido = document.getElementById('lista-pedido');
const totalElement = document.getElementById('total');
const botonesAnadir = document.querySelectorAll('.add-to-cart');
const botonConfirmar = document.getElementById('confirmar-pedido');
const inputDireccion = document.getElementById('direccion-cliente'); 

const actualizarCarrito = () => {
    listaPedido.innerHTML = '';
    let total = 0;
    carrito.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center text-gray-600 text-base';
        li.innerHTML = `
            <div class="flex items-center">
                <span class="decrease-btn mr-2 bg-red-200 text-red-700 rounded-full w-6 h-6 flex items-center justify-center" data-index="${index}">-</span>
                <span class="font-semibold">${item.nombre} (x${item.cantidad})</span>
            </div>
            <div>
                <span class="mr-2">$${(item.precio * item.cantidad).toFixed(2)}</span>
                <span class="remove-btn bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center" data-index="${index}">&times;</span>
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

botonesAnadir.forEach(boton => {
    boton.addEventListener('click', () => {
        const nombre = boton.dataset.nombre;
        const precio = parseFloat(boton.dataset.precio);
        const targetId = boton.dataset.target;
        const cantidadInput = document.getElementById(targetId);
        const cantidad = parseInt(cantidadInput.value, 10);
        
        if (cantidad > 0) {
            const existingItem = carrito.find(item => item.nombre === nombre);
            if (existingItem) {
                existingItem.cantidad += cantidad;
            } else {
                carrito.push({ nombre, precio, cantidad });
            }
            actualizarCarrito();
        }
        
        actualizarCarrito();
    });
});

botonConfirmar.addEventListener('click', () => {
    const direccionCliente = inputDireccion.value.trim(); 
    
    if (direccionCliente === '') {
        alert('Por favor, introduce tu dirección.');
        return;
    }

    if (carrito.length === 0) {
        alert('Por favor, añade productos a tu pedido antes de enviarlo.');
        return;
    }

    let mensaje = `¡Hola! Me gustaría hacer un pedido para la dirección: ${direccionCliente}\n\n`;
    let totalPedido = 0;
    carrito.forEach(item => {
        mensaje += `- ${item.nombre} (x${item.cantidad})\n`;
        totalPedido += item.precio * item.cantidad;
    });
    mensaje += `\n*Total a pagar: $${totalPedido.toFixed(2)}*\n\n`;
    mensaje += "Por favor, confirma el pedido. ¡Gracias!";
    
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    const urlWhatsApp = `https://wa.me/${restauranteNumero}?text=${mensajeCodificado}`;
    
    window.open(urlWhatsApp, '_blank');

    carrito = [];
    localStorage.removeItem('carrito');
    actualizarCarrito();
});


actualizarCarrito();

