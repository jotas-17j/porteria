// Función para abrir un modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }
}

// Función para cerrar un modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
    }
}

// Función para mostrar notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 bg-${type}-500 text-white px-4 py-2 rounded shadow-lg`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Función para manejar el envío de formularios
async function handleFormSubmit(event, formId, actionUrl) {
    event.preventDefault();
    const form = document.getElementById(formId);
    const formData = new FormData(form);

    // Log de los datos del formulario
    console.log('Datos del formulario:', Object.fromEntries(formData.entries()));

    try {
        const response = await fetch(actionUrl, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        // Log de la respuesta del servidor
        console.log('Respuesta del servidor:', result);

        if (result.success) {
            showNotification('Operación exitosa', 'green');
            closeModal('deleteModal'); // Cerrar el modal de eliminación
            // Remover la fila de la tabla
            const row = document.querySelector(`tr[data-id='${formData.get('id')}']`);
            if (row) {
                row.remove();
            }
            // Recargar la página después de un breve retraso
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showNotification('Error: ' + result.message, 'red');
        }
    } catch (error) {
        console.error('Error en la operación:', error);
        showNotification('Error en la operación', 'red');
    }
}

// Función para editar un registro
function editRecord(recordId) {
    console.log('Editando registro:', recordId);
    const row = document.querySelector(`tr[data-id='${recordId}']`);
    if (row) {
        document.getElementById('editId').value = recordId;
        document.getElementById('editChofer').value = row.cells[1].textContent.trim();
        document.getElementById('editCod1').value = row.cells[2].textContent.trim();
        document.getElementById('editPatente').value = row.cells[3].textContent.trim();
        document.getElementById('editF_Salida').value = row.cells[4].textContent.trim();
        document.getElementById('editF_Ingreso').value = row.cells[5].textContent.trim();
        document.getElementById('editH_Sal').value = row.cells[6].textContent.trim();
        document.getElementById('editH_ing').value = row.cells[7].textContent.trim();
        document.getElementById('editT_Ocupado').value = row.cells[8].textContent.trim();
        document.getElementById('editCod2').value = row.cells[9].textContent.trim();
        document.getElementById('editLugar').value = row.cells[10].textContent.trim();
        document.getElementById('editDetalle').value = row.cells[11].textContent.trim();
        document.getElementById('editK_Ing').value = row.cells[12].textContent.trim();
        document.getElementById('editK_Sal').value = row.cells[13].textContent.trim();
        document.getElementById('editK_Ocup').value = row.cells[14].textContent.trim();
    }
    openModal('editModal');
}

// Función para eliminar un registro
function deleteRecord(recordId) {
    console.log('Eliminando registro:', recordId);
    document.getElementById('deleteId').value = recordId;
    openModal('deleteModal');
}

// Función para ver un registro
function viewRecord(recordId) {
    console.log('Viendo registro:', recordId);
    const row = document.querySelector(`tr[data-id='${recordId}']`);
    if (row) {
        const details = `
            <table class="min-w-full text-left text-gray-700">
                <tr><th class="pr-4 py-2">Chofer:</th><td class="pr-8">${row.cells[1].textContent.trim()}</td><th class="pr-4 py-2">Cod1:</th><td>${row.cells[2].textContent.trim()}</td><th class="pr-4 py-2">Patente:</th><td>${row.cells[3].textContent.trim()}</td></tr>
                <tr><th class="pr-4 py-2">F. Salida:</th><td class="pr-8">${row.cells[4].textContent.trim()}</td><th class="pr-4 py-2">F. Ingreso:</th><td>${row.cells[5].textContent.trim()}</td><th class="pr-4 py-2">H. Sal:</th><td>${row.cells[6].textContent.trim()}</td></tr>
                <tr><th class="pr-4 py-2">H. Ing:</th><td class="pr-8">${row.cells[7].textContent.trim()}</td><th class="pr-4 py-2">T. Ocupado:</th><td>${row.cells[8].textContent.trim()}</td><th class="pr-4 py-2">Cod2:</th><td>${row.cells[9].textContent.trim()}</td></tr>
                <tr><th class="pr-4 py-2">Lugar:</th><td class="pr-8">${row.cells[10].textContent.trim()}</td><th class="pr-4 py-2">Detalle:</th><td>${row.cells[11].textContent.trim()}</td><th class="pr-4 py-2">K. Ing:</th><td>${row.cells[12].textContent.trim()}</td></tr>
                <tr><th class="pr-4 py-2">K. Sal:</th><td class="pr-8">${row.cells[13].textContent.trim()}</td><th class="pr-4 py-2">K. Ocup:</th><td>${row.cells[14].textContent.trim()}</td></tr>
            </table>
        `;
        document.getElementById('recordDetails').innerHTML = details;
    }
    openModal('viewModal');
}

function viewTodayRecords() {
    const today = new Date().toISOString().split('T')[0]; // Obtener la fecha de hoy en formato YYYY-MM-DD
    const rows = document.querySelectorAll('#tableBody tr');
    rows.forEach(row => {
        const dateCell = row.cells[4]; // Suponiendo que la fecha de salida está en la quinta columna
        if (dateCell) {
            const recordDate = dateCell.textContent.trim();
            if (recordDate === today) {
                row.style.display = ''; // Mostrar la fila
            } else {
                row.style.display = 'none'; // Ocultar la fila
            }
        }
    });
}

function viewAllRecords() {
    const rows = document.querySelectorAll('#tableBody tr');
    rows.forEach(row => {
        row.style.display = ''; // Mostrar todas las filas
    });
}

// Ejecutar showImportantFields al cargar la página
// window.onload = showImportantFields;

function showImportantFields() {
    console.log('Ejecutando showImportantFields');
    const rows = document.querySelectorAll('#tableBody tr');
    rows.forEach((row, rowIndex) => {
        console.log(`Procesando fila ${rowIndex}`);
        // Convertir row.cells a un array para usar forEach
        Array.from(row.cells).forEach((cell, cellIndex) => {
            if (cellIndex < 7) {
                cell.style.display = ''; // Mostrar los campos importantes
            } else {
                cell.style.display = 'none'; // Ocultar los campos no importantes
            }
        });
    });
}

function filterTable() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
        const rowText = row.textContent.toLowerCase();

        if (rowText.includes(searchInput)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

document.getElementById('searchInput').addEventListener('input', function() {
    const input = this.value.toLowerCase();
    const suggestionsContainer = document.getElementById('suggestions');
    const rows = document.querySelectorAll('#tableBody tr');
    const suggestions = [];

    if (input.length > 0) {
        rows.forEach(row => {
            const chofer = row.cells[1].textContent.toLowerCase();
            if (chofer.startsWith(input) && !suggestions.includes(chofer)) {
                suggestions.push(chofer);
            }
        });
    }

    suggestionsContainer.innerHTML = '';
    if (suggestions.length > 0) {
        suggestionsContainer.classList.remove('hidden');
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'px-4 py-2 cursor-pointer hover:bg-gray-200';
            suggestionItem.textContent = suggestion;
            suggestionItem.addEventListener('click', function() {
                document.getElementById('searchInput').value = suggestion;
                suggestionsContainer.classList.add('hidden');
                filterTable();
            });
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        suggestionsContainer.classList.add('hidden');
    }
}); 