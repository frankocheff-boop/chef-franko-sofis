
 <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema POS (Punto de Venta)</title>
    <!-- Carga de Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Carga de Iconos (Ionicons) -->
    <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
    <script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
    <style>
        /* Fuente Inter para un look moderno */
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Estilos para la barra de scroll */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #2d3748; /* gris oscuro */
        }
        ::-webkit-scrollbar-thumb {
            background: #4a5568; /* gris más claro */
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #718096;
        }
        /* Ocultar flechas de input numérico */
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input[type='number'] {
            -moz-appearance: textfield;
        }

        /* Estilos de Impresión */
        @media print {
            body * {
                visibility: hidden;
            }
            #ticket-to-print, #ticket-to-print * {
                visibility: visible;
            }
            #ticket-to-print {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20px;
                background: #ffffff;
                color: #000000;
            }
            .no-print {
                display: none !important;
            }
            #print-modal-content {
                border: none !important;
                box-shadow: none !important;
            }
        }
    </style>
</head>
<body class="bg-gray-900 text-white antialiased">

    <!-- Contenedor Principal de la App -->
    <div id="app" class="flex h-screen overflow-hidden">

        <!-- Columna Izquierda: Menú y Categorías -->
        <div class="w-3/5 flex flex-col h-screen">
            <!-- Encabezado -->
            <header class="bg-gray-800 p-4 shadow-md flex justify-between items-center">
                <h1 class="text-2xl font-bold">Chef Franko POS</h1>
                <div class="flex items-center space-x-4">
                    <button onclick="showHistoryModal()" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2">
                        <ion-icon name="document-text-outline" class="text-xl"></ion-icon>
                        <span>Historial</span>
                    </button>
                    <div class="text-lg font-semibold text-right">
                        <span id="clock">12:00:00</span>
                    </div>
                </div>
            </header>

            <!-- Pestañas de Categorías -->
            <nav class="flex-shrink-0 bg-gray-800 p-2">
                <div id="category-tabs" class="flex space-x-2 overflow-x-auto">
                    <!-- Las pestañas se generarán aquí -->
                </div>
            </nav>

            <!-- Grid de Productos -->
            <main id="menu-grid" class="flex-1 p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <!-- Los productos se generarán aquí -->
            </main>
        </div>

        <!-- Columna Derecha: Comanda / Ticket -->
        <aside class="w-2/5 bg-gray-800 h-screen flex flex-col shadow-lg border-l-4 border-gray-700">
            <!-- Encabezado de la Comanda -->
            <div class="p-4 border-b border-gray-700">
                <h2 class="text-xl font-bold">Comanda #<span id="order-number">1024</span></h2>
            </div>

            <!-- Lista de Items en la Comanda -->
            <div id="ticket-items" class="flex-1 p-4 overflow-y-auto">
                <!-- Items de la comanda irán aquí -->
                <p id="empty-ticket-message" class="text-gray-400 text-center mt-10">Agregue productos del menú...</p>
            </div>

            <!-- Resumen de Costos -->
            <div class="p-4 border-t border-gray-700 bg-gray-900">
                <div class="space-y-2 text-lg">
                    <div class="flex justify-between font-medium">
                        <span>Subtotal:</span>
                        <span id="subtotal">$0.00</span>
                    </div>
                    <div class="flex justify-between font-medium">
                        <span>IVA (16%):</span>
                        <span id="tax">$0.00</span>
                    </div>
                    <div class="flex justify-between text-2xl font-bold text-cyan-400">
                        <span>TOTAL:</span>
                        <span id="total">$0.00</span>
                    </div>
                </div>

                <!-- Botones de Acción -->
                <div class="grid grid-cols-2 gap-4 mt-6">
                    <button onclick="clearOrder()" class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg transition duration-200 flex items-center justify-center space-x-2">
                        <ion-icon name="trash-outline" class="text-2xl"></ion-icon>
                        <span>Cancelar</span>
                    </button>
                    <button onclick="showPaymentModal()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg transition duration-200 flex items-center justify-center space-x-2">
                        <ion-icon name="card-outline" class="text-2xl"></ion-icon>
                        <span>Cobrar</span>
                    </button>
                </div>
            </div>
        </aside>

    </div>

    <!-- Modal de Pago -->
    <div id="payment-modal" class="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 hidden">
        <div class="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md border-t-4 border-cyan-400">
            <h2 class="text-3xl font-bold text-center mb-6">Procesar Pago</h2>
            <div class="text-center mb-6">
                <span class="text-gray-400 text-lg">Total a Pagar</span>
                <p id="modal-total" class="text-6xl font-extrabold text-cyan-400">$0.00</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <button onclick="processPayment('Efectivo')" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-lg text-lg flex items-center justify-center space-x-3 transition duration-200">
                    <ion-icon name="cash-outline" class="text-3xl"></ion-icon>
                    <span>Efectivo</span>
                </button>
                <button onclick="processPayment('Tarjeta')" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg shadow-lg text-lg flex items-center justify-center space-x-3 transition duration-200">
                    <ion-icon name="card-outline" class="text-3xl"></ion-icon>
                    <span>Tarjeta</span>
                </button>
                <button onclick="processPayment('Cargo Habitación')" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-lg shadow-lg text-lg flex items-center justify-center space-x-3 transition duration-200">
                    <ion-icon name="bed-outline" class="text-3xl"></ion-icon>
                    <span>Cargo Habitación</span>
                </button>
                <button onclick="processPayment('Transferencia')" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg shadow-lg text-lg flex items-center justify-center space-x-3 transition duration-200">
                    <ion-icon name="swap-horizontal-outline" class="text-3xl"></ion-icon>
                    <span>Transferencia</span>
                </button>
            </div>
            <button onclick="hidePaymentModal()" class="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-lg text-lg mt-4 transition duration-200">
                Cancelar
            </button>
        </div>
    </div>

    <!-- Modal de Impresión de Ticket -->
    <div id="print-modal" class="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 hidden">
        <div id="print-modal-content" class="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border-t-4 border-cyan-400">
            <h2 class="text-2xl font-bold text-center p-6 bg-gray-700 rounded-t-lg">Ticket de Venta</h2>
            
            <!-- Contenido del Ticket para Imprimir -->
            <div id="ticket-to-print" class="p-6 text-gray-900 bg-white">
                <div class="text-center mb-4">
                    <h3 class="text-xl font-bold">Restaurante "La Villa"</h3>
                    <p class="text-sm">Av. Siempre Viva 123, Puerto Vallarta</p>
                    <p class="text-sm">R.F.C. VIL123456ABC</p>
                    <hr class="border-dashed border-gray-400 my-2">
                    <p class="text-sm font-bold">ORDEN: #<span id="print-order-id"></span></p>
                    <p class="text-sm">Fecha: <span id="print-date"></span></p>
                    <p class="text-sm">Método de Pago: <span id="print-method"></span></p>
                </div>
                <hr class="border-dashed border-gray-400 my-2">
                <!-- Items -->
                <div id="print-items" class="text-sm space-y-1">
                    <!-- items se inyectan aquí -->
                </div>
                <hr class="border-dashed border-gray-400 my-2">
                <!-- Totales -->
                <div class="text-sm space-y-1 font-medium">
                    <div class="flex justify-between">
                        <span>Subtotal:</span>
                        <span id="print-subtotal"></span>
                    </div>
                    <div class="flex justify-between">
                        <span>IVA (16%):</span>
                        <span id="print-tax"></span>
                    </div>
                    <div class="flex justify-between font-bold text-lg">
                        <span>TOTAL:</span>
                        <span id="print-total"></span>
                    </div>
                </div>
                <hr class="border-dashed border-gray-400 my-2">
                <p class="text-center text-xs font-semibold mt-4">¡Gracias por su visita!</p>
            </div>
            
            <!-- Botones del Modal (No Imprimibles) -->
            <div class="p-6 bg-gray-800 rounded-b-lg flex space-x-4 no-print">
                <button onclick="finalizeOrder()" class="w-1/2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-lg text-lg transition duration-200">
                    Cerrar
                </button>
                <button onclick="printTicket()" class="w-1/2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg shadow-lg text-lg flex items-center justify-center space-x-3 transition duration-200">
                    <ion-icon name="print-outline" class="text-2xl"></ion-icon>
                    <span>Imprimir</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Modal de Historial de Órdenes -->
    <div id="history-modal" class="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 hidden">
        <div class="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-2xl border-t-4 border-cyan-400 h-3/4 flex flex-col">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold text-center">Historial de Órdenes</h2>
                <button onclick="hideHistoryModal()" class="text-gray-400 hover:text-white transition duration-200">
                    <ion-icon name="close-circle-outline" class="text-4xl"></ion-icon>
                </button>
            </div>
            <div id="history-list" class="flex-1 overflow-y-auto space-y-4 pr-2">
                <!-- El historial de órdenes se inyecta aquí -->
            </div>
        </div>
    </div>

    <!-- Modal de Confirmación (Alerta Personalizada) -->
    <div id="alert-modal" class="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 hidden">
        <div class="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-sm border-t-4 border-green-500">
            <div class="text-center">
                <div id="alert-icon" class="flex items-center justify-center text-green-500 text-6xl mb-4">
                    <ion-icon name="checkmark-circle-outline"></ion-icon>
                </div>
                <h3 id="alert-title" class="text-2xl font-bold mb-2">Pago Exitoso</h3>
                <p id="alert-message" class="text-gray-300 mb-6">La orden ha sido procesada.</p>
                <button onclick="hideAlertModal()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-lg shadow-lg transition duration-200">
                    Aceptar
                </button>
            </div>
        </div>
    </div>


    <script>
        // --- Base de Datos (Simulada) ---
        // ESTE ES SU MENÚ DE AUTOR, AHORA CARGADO EN EL POS
        const menuItems = [
            // Entradas
            { id: 1, name: "Tostada de Atún (Autor)", price: 290, category: "Entradas", img: "https://placehold.co/300x200/2d3748/ffffff?text=Tostada" },
            { id: 2, name: "Crema de Langosta", price: 350, category: "Entradas", img: "https://placehold.co/300x200/2d3748/ffffff?text=Langosta" },

            // Platos Fuertes
            { id: 3, name: "Filete Mignon (Local)", price: 650, category: "Fuertes", img: "https://placehold.co/300x200/2d3748/ffffff?text=Filete" },
            { id: 4, name: "Robalo en Costra de Sal", price: 580, category: "Fuertes", img: "https://placehold.co/300x200/2d3748/ffffff?text=Robalo" },
            { id: 5, name: "Pato Confitado", price: 550, category: "Fuertes", img: "https://placehold.co/300x200/2d3748/ffffff?text=Pato" },
            { id: 6, name: "Hamburguesa Gourmet", price: 380, category: "Fuertes", img: "https://placehold.co/300x200/2d3748/ffffff?text=Burger" },
            { id: 7, name: "Tacos de Arrachera", price: 360, category: "Fuertes", img: "https://placehold.co/300x200/2d3748/ffffff?text=Tacos" },

            // Bebidas
            { id: 8, name: "Margarita (Premium)", price: 210, category: "Bebidas", img: "https://placehold.co/300x200/2d3748/ffffff?text=Margarita" },
            { id: 9, name: "Vino Tinto (Copa)", price: 250, category: "Bebidas", img: "https://placehold.co/300x200/2d3748/ffffff?text=Vino" },
            { id: 10, name: "Agua Embotellada", price: 80, category: "Bebidas", img: "https://placehold.co/300x200/2d3748/ffffff?text=Agua" },
            { id: 11, name: "Carajillo", price: 190, category: "Bebidas", img: "https://placehold.co/300x200/2d3748/ffffff?text=Carajillo" },
            
            // Postres
            { id: 12, name: "Flan de la Casa", price: 150, category: "Postres", img: "https://placehold.co/300x200/2d3748/ffffff?text=Flan" },
            { id: 13, name: "Pastel de Chocolate", price: 180, category: "Postres", img: "https://placehold.co/300x200/2d3748/ffffff?text=Pastel" }
        ];

        // --- Estado de la Aplicación ---
        let currentOrder = []; // Aquí se guarda la comanda actual
        let orderHistory = []; // Historial de órdenes pagadas
        let currentCategory = "Entradas"; // Categoría por defecto (Cambiado de "Desayuno" a "Entradas")
        let orderNumber = 1024; // Número de orden inicial

        // --- Elementos del DOM ---
        const menuGrid = document.getElementById('menu-grid');
        const categoryTabsContainer = document.getElementById('category-tabs');
        const ticketItemsContainer = document.getElementById('ticket-items');
        const emptyTicketMessage = document.getElementById('empty-ticket-message');
        const subtotalEl = document.getElementById('subtotal');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');
        const orderNumberEl = document.getElementById('order-number');
        const clockEl = document.getElementById('clock');
        const paymentModal = document.getElementById('payment-modal');
        const modalTotalEl = document.getElementById('modal-total');
        const alertModal = document.getElementById('alert-modal');
        const printModal = document.getElementById('print-modal');
        const historyModal = document.getElementById('history-modal');

        // --- Lógica de la Aplicación ---

        // Función para inicializar el POS
        function init() {
            loadOrderHistory(); // Cargar historial primero
            orderNumberEl.textContent = orderNumber;
            renderCategories();
            renderMenu(currentCategory);
            updateClock();
            setInterval(updateClock, 1000);
            updateTicket();
        }

        // Actualiza el reloj
        function updateClock() {
            clockEl.textContent = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }

        // Renderiza las pestañas de categorías
        function renderCategories() {
            // ... (Sin cambios)
            const categories = [...new Set(menuItems.map(item => item.category))];
            categoryTabsContainer.innerHTML = ''; // Limpiar pestañas
            categories.forEach(category => {
                const isActive = category === currentCategory;
                const tab = document.createElement('button');
                tab.textContent = category;
                tab.className = `px-6 py-3 font-semibold rounded-lg transition duration-200 whitespace-nowrap ${
                    isActive 
                        ? 'bg-cyan-500 text-white shadow-lg' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`;
                tab.onclick = () => {
                    currentCategory = category;
                    renderCategories();
                    renderMenu(currentCategory);
                };
                categoryTabsContainer.appendChild(tab);
            });
        }

        // Renderiza los productos en el grid
        function renderMenu(category) {
            // ... (Sin cambios)
            menuGrid.innerHTML = ''; // Limpiar grid
            const items = menuItems.filter(item => item.category === category);
            
            items.forEach(item => {
                const card = document.createElement('div');
                card.className = "bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transition duration-300 hover:scale-105 hover:shadow-cyan-500/30 border-2 border-gray-700 hover:border-cyan-500";
                card.onclick = () => addToOrder(item.id);
                
                card.innerHTML = `
                    <img src="${item.img}" alt="${item.name}" class="w-full h-32 object-cover">
                    <div class="p-4">
                        <h3 class="font-bold text-lg truncate">${item.name}</h3>
                        <p class="text-cyan-400 font-semibold text-xl">$${item.price.toFixed(2)}</p>
                    </div>
                `;
                menuGrid.appendChild(card);
            });
        }

        // Añade un producto a la comanda
        function addToOrder(itemId) {
            // ... (Sin cambios)
            const existingItem = currentOrder.find(item => item.id === itemId);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                const item = menuItems.find(item => item.id === itemId);
                currentOrder.push({ ...item, quantity: 1 });
            }
            updateTicket();
        }

        // Actualiza la comanda (ticket)
        function updateTicket() {
            // ... (Casi sin cambios)
            ticketItemsContainer.innerHTML = ''; 

            if (currentOrder.length === 0) {
                emptyTicketMessage.classList.remove('hidden');
                ticketItemsContainer.innerHTML = '<p id="empty-ticket-message" class="text-gray-400 text-center mt-10">Agregue productos del menú...</p>';
            } else {
                emptyTicketMessage.classList.add('hidden');
                currentOrder.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.className = "bg-gray-900 rounded-lg p-3 mb-3 flex items-center shadow";
                    itemEl.innerHTML = `
                        <div class="flex-1">
                            <p class="font-bold text-white truncate">${item.name}</p>
                            <p class="text-cyan-400 font-medium">$${item.price.toFixed(2)}</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <button onclick="updateQuantity(${item.id}, -1)" class="bg-gray-700 w-8 h-8 rounded-full font-bold text-lg hover:bg-red-600 transition duration-200">-</button>
                            <span class="font-bold text-xl w-8 text-center">${item.quantity}</span>
                            <button onclick="updateQuantity(${item.id}, 1)" class="bg-gray-700 w-8 h-8 rounded-full font-bold text-lg hover:bg-green-600 transition duration-200">+</button>
                        </div>
                        <div class="w-20 text-right font-bold text-lg pl-3">
                            $${(item.price * item.quantity).toFixed(2)}
                        </div>
                    `;
                    ticketItemsContainer.appendChild(itemEl);
                });
            }

            // Calcular totales
            const subtotal = currentOrder.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const tax = subtotal * 0.16; // 16% IVA
            const total = subtotal + tax;

            subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
            taxEl.textContent = `$${tax.toFixed(2)}`;
            totalEl.textContent = `$${total.toFixed(2)}`;
        }

        // Actualiza la cantidad de un item o lo elimina
        function updateQuantity(itemId, change) {
            // ... (Sin cambios)
            const item = currentOrder.find(item => item.id === itemId);
            if (!item) return;

            if (change > 0) {
                item.quantity++;
            } else if (change < 0) {
                item.quantity--;
                if (item.quantity <= 0) {
                    // Eliminar item si la cantidad es 0 o menos
                    currentOrder = currentOrder.filter(i => i.id !== itemId);
                }
            }
            updateTicket();
        }

        // Limpia la comanda
        function clearOrder() {
            currentOrder = [];
            updateTicket();
        }

        // Muestra el modal de pago
        function showPaymentModal() {
            // ... (Sin cambios)
            if (currentOrder.length === 0) {
                showAlert("Error", "No hay productos en la comanda.", "error");
                return;
            }
            const total = currentOrder.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 1.16;
            modalTotalEl.textContent = `$${total.toFixed(2)}`;
            paymentModal.classList.remove('hidden');
        }

        // Oculta el modal de pago
        function hidePaymentModal() {
            paymentModal.classList.add('hidden');
        }

        // Procesa el pago (simulado)
        function processPayment(method) {
            hidePaymentModal();

            // 1. Calcular totales
            const subtotal = currentOrder.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const tax = subtotal * 0.16;
            const total = subtotal + tax;

            // 2. Crear el objeto de la orden completada
            const completedOrder = {
                id: orderNumber,
                items: JSON.parse(JSON.stringify(currentOrder)), // Copia profunda
                subtotal: subtotal,
                tax: tax,
                total: total,
                method: method,
                date: new Date().toISOString()
            };

            // 3. Guardar la orden en el historial y localStorage
            saveOrder(completedOrder);

            // 4. Mostrar el modal de impresión
            showPrintModal(completedOrder);
        }

        // --- NUEVAS FUNCIONES DE HISTORIAL Y TICKETS ---

        // Carga el historial desde localStorage
        function loadOrderHistory() {
            const savedHistory = localStorage.getItem('posHistory');
            if (savedHistory) {
                orderHistory = JSON.parse(savedHistory);
                // Asegurar que el próximo número de orden sea el siguiente al más alto
                if (orderHistory.length > 0) {
                    const lastOrder = orderHistory[orderHistory.length - 1];
                    orderNumber = lastOrder.id + 1;
                }
            }
        }

        // Guarda la orden en el historial y en localStorage
        function saveOrder(orderData) {
            orderHistory.push(orderData);
            localStorage.setItem('posHistory', JSON.stringify(orderHistory));
        }

        // Muestra el modal de historial
        function showHistoryModal() {
            const historyList = document.getElementById('history-list');
            historyList.innerHTML = ''; // Limpiar lista

            if (orderHistory.length === 0) {
                historyList.innerHTML = '<p class="text-gray-400 text-center mt-10">No hay órdenes en el historial.</p>';
            } else {
                // Mostrar en orden reverso (más nuevo primero)
                [...orderHistory].reverse().forEach(order => {
                    const orderCard = document.createElement('div');
                    orderCard.className = 'bg-gray-700 rounded-lg p-4 shadow-md';
                    
                    const itemsHtml = order.items.map(item => 
                        `<li class="text-sm text-gray-300">${item.quantity} x ${item.name}</li>`
                    ).join('');

                    orderCard.innerHTML = `
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-xl text-cyan-400">Orden #${order.id}</span>
                            <span class="font-bold text-xl text-white">$${order.total.toFixed(2)}</span>
                        </div>
                        <div class="text-gray-400 text-sm mb-3">
                            ${new Date(order.date).toLocaleString('es-MX')} - Pagado con ${order.method}
                        </div>
                        <ul class="list-disc list-inside mb-2">${itemsHtml}</ul>
                    `;
                    historyList.appendChild(orderCard);
                });
            }

            historyModal.classList.remove('hidden');
        }

        // Oculta el modal de historial
        function hideHistoryModal() {
            historyModal.classList.add('hidden');
        }

        // Muestra el modal de impresión con los datos de la orden
        function showPrintModal(order) {
            document.getElementById('print-order-id').textContent = order.id;
            document.getElementById('print-date').textContent = new Date(order.date).toLocaleString('es-MX');
            document.getElementById('print-method').textContent = order.method;

            const itemsContainer = document.getElementById('print-items');
            itemsContainer.innerHTML = '';
            order.items.forEach(item => {
                itemsContainer.innerHTML += `
                    <div class="flex justify-between">
                        <span>${item.quantity} x ${item.name}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `;
            });

            document.getElementById('print-subtotal').textContent = `$${order.subtotal.toFixed(2)}`;
            document.getElementById('print-tax').textContent = `$${order.tax.toFixed(2)}`;
            document.getElementById('print-total').textContent = `$${order.total.toFixed(2)}`;
            
            printModal.classList.remove('hidden');
        }

        // Oculta el modal de impresión
        function hidePrintModal() {
            printModal.classList.add('hidden');
        }

        // Finaliza la orden (después de imprimir/cerrar modal)
        function finalizeOrder() {
            hidePrintModal();
            showAlert("¡Orden Guardada!", `La orden #${orderNumber} ha sido procesada y guardada.`, "success");
            
            // Incrementar número de orden y limpiar comanda
            orderNumber++;
            orderNumberEl.textContent = orderNumber;
            clearOrder();
        }

        // Dispara la impresión del ticket
        function printTicket() {
            window.print();
        }


        // Muestra una alerta personalizada
        function showAlert(title, message, type = "success") {
            const alertTitle = document.getElementById('alert-title');
            const alertMessage = document.getElementById('alert-message');
            const alertIcon = document.getElementById('alert-icon');
            const alertButton = alertModal.querySelector('button');
            const alertBorder = alertModal.querySelector('.bg-gray-800');

            alertTitle.textContent = title;
            alertMessage.textContent = message;

            if (type === 'success') {
                alertIcon.innerHTML = '<ion-icon name="checkmark-circle-outline"></ion-icon>';
                alertIcon.className = 'flex items-center justify-center text-green-500 text-6xl mb-4';
                alertButton.className = 'bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-lg shadow-lg transition duration-200';
                alertBorder.className = 'bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-sm border-t-4 border-green-500';
            } else if (type === 'error') {
                alertIcon.innerHTML = '<ion-icon name="alert-circle-outline"></ion-icon>';
                alertIcon.className = 'flex items-center justify-center text-red-500 text-6xl mb-4';
                alertButton.className = 'bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-8 rounded-lg shadow-lg transition duration-200';
                alertBorder.className = 'bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-sm border-t-4 border-red-500';
            }
            
            alertModal.classList.remove('hidden');
        }

        // Oculta la alerta personalizada
        function hideAlertModal() {
            alertModal.classList.add('hidden');
        }


        // Iniciar la aplicación cuando se carga la página
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
