const restauranteNumero = '50375415287';
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        const listaPedido = document.getElementById('lista-pedido');
        const totalElement = document.getElementById('total');
        const botonesAnadir = document.querySelectorAll('.add-to-cart');
        const botonConfirmar = document.getElementById('confirmar-pedido');
        const inputDireccion = document.getElementById('direccion-cliente');
        const messageContainer = document.getElementById('message-container');

        // Referencias a los botones de acompañamiento y al campo de especificación
        const MaizBtn = document.getElementById('maiz-btn');
        const ArrozBtn = document.getElementById('arroz-btn');
        const especificacionInput = document.getElementById('especificacion');

        // Variables para almacenar la selección de acompañamiento
        let acompanamientoSeleccionado = '';
        let especificacionAdicional = '';

        // Función para mostrar mensajes de notificación personalizados
        const showMessage = (message, type = 'error') => {
            const messageDiv = document.createElement('div');
            messageDiv.textContent = message;
            messageDiv.className = `p-4 rounded-lg shadow-md text-sm transition-all duration-300 transform -translate-y-full opacity-0 fixed top-4 left-1/2 -translate-x-1/2 z-50
                                    ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`;
            messageContainer.appendChild(messageDiv);

            // Animación para mostrar el mensaje
            setTimeout(() => {
                messageDiv.style.transform = 'translateY(0)';
                messageDiv.style.opacity = '1';
            }, 10);

            // Ocultar el mensaje después de 3 segundos
            setTimeout(() => {
                messageDiv.style.transform = 'translateY(-100%)';
                messageDiv.style.opacity = '0';
                messageDiv.addEventListener('transitionend', () => messageDiv.remove());
            }, 3000);
        };

        const actualizarCarrito = () => {
            listaPedido.innerHTML = '';
            let total = 0;
            carrito.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'flex justify-between items-center text-gray-600 text-base';
                li.innerHTML = `
                    <div class="flex items-center">
                        <span class="decrease-btn mr-2 bg-red-200 text-red-700 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer" data-index="${index}">-</span>
                        <span class="font-semibold">${item.nombre} (x${item.cantidad})</span>
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

        botonesAnadir.forEach(boton => {
            boton.addEventListener('click', () => {
                const nombre = boton.dataset.nombre;
                const precio = parseFloat(boton.dataset.precio);
                
                // Nuevo: Verificar si existe un input de cantidad
                const targetId = boton.dataset.target;
                let cantidad = 1; // Cantidad predeterminada
                if (targetId) {
                    const cantidadInput = document.getElementById(targetId);
                    if (cantidadInput) {
                        cantidad = parseInt(cantidadInput.value, 10);
                    }
                }
                
                if (cantidad > 0) {
                    const existingItem = carrito.find(item => item.nombre === nombre);
                    if (existingItem) {
                        existingItem.cantidad += cantidad;
                    } else {
                        carrito.push({ nombre, precio, cantidad });
                    }
                    actualizarCarrito();
                }
            });
        });

        // Manejadores para los botones y el input de especificación de acompañamiento
        MaizBtn.addEventListener('click', () => {
            acompanamientoSeleccionado = MaizBtn.textContent.trim();
            especificacionAdicional = ''; // Limpiar el input al seleccionar un botón
            especificacionInput.value = '';
            showMessage(`Seleccionaste: ${acompanamientoSeleccionado}`, 'success');
        });

        ArrozBtn.addEventListener('click', () => {
            acompanamientoSeleccionado = ArrozBtn.textContent.trim();
            especificacionAdicional = ''; // Limpiar el input al seleccionar un botón
            especificacionInput.value = '';
            showMessage(`Seleccionaste: ${acompanamientoSeleccionado}`, 'success');
        });

        especificacionInput.addEventListener('input', () => {
            acompanamientoSeleccionado = ''; // Restablecer la selección del botón si el usuario escribe
            especificacionAdicional = especificacionInput.value.trim();
        });

        // Modificación del evento de confirmar pedido con advertencias
        botonConfirmar.addEventListener('click', () => {
            const direccionCliente = inputDireccion.value.trim();
            
            if (carrito.length === 0) {
                showMessage('Por favor, añade productos a tu pedido antes de enviarlo.', 'error');
                return;
            }

            const tieneAcompanamiento = acompanamientoSeleccionado !== '' || especificacionAdicional !== '';
            if (!tieneAcompanamiento) {
                showMessage('Por favor, elige un acompañamiento o escribe una especificación adicional.', 'error');
                return;
            }

            if (direccionCliente === '') {
                showMessage('Por favor, introduce tu dirección.', 'error');
                return;
            }



            // Array para construir el mensaje de los items
            let mensajeItems = [];
            let totalPedido = 0;

            // Llenar el array con los items del carrito y calcular el total
            carrito.forEach(item => {
                mensajeItems.push(`- ${item.nombre} (x${item.cantidad})`);
                totalPedido += item.precio * item.cantidad;
            });
            
            // Si se seleccionó una especificación
            const espec = acompanamientoSeleccionado || especificacionAdicional;
            if (espec) {
                // Insertar la especificación después del primer item
                mensajeItems.splice(1, 0, `\n Masa: ${espec}\n`);
            }

            // Construir el mensaje completo
            let mensaje = `¡Hola! Me gustaría hacer un pedido para la dirección: ${direccionCliente}\n\n`;
            mensaje += mensajeItems.join('\n');
            mensaje += `\n*Total a pagar: $${totalPedido.toFixed(2)}*\n\n`;
            mensaje += "Por favor, confirma el pedido. ¡Gracias!";
            
            const mensajeCodificado = encodeURIComponent(mensaje);
            const urlWhatsApp = `https://wa.me/${restauranteNumero}?text=${mensajeCodificado}`;
            
            window.open(urlWhatsApp, '_blank');

            carrito = [];
            localStorage.removeItem('carrito');
            actualizarCarrito();

            acompanamientoSeleccionado = '';
            especificacionAdicional = '';
            especificacionInput.value = '';
        });

        actualizarCarrito();