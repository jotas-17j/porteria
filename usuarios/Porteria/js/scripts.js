// Función auxiliar para validar respuesta del servidor
async function handleServerResponse(response, errorMessage = 'Error en la operación') {
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La respuesta del servidor no es JSON válido');
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error(data.message || errorMessage);
    }

    return data;
}

// Función para crear un overlay de carga
function createLoadingOverlay(message = 'Cargando...') {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.innerHTML = `
        <div class="bg-white p-4 rounded-lg shadow-lg">
            <i class="fas fa-spinner fa-spin text-blue-500 mr-2"></i>
            ${escapeHtml(message)}
        </div>`;
    document.body.appendChild(overlay);
    return overlay;
}

// Función para mostrar mensajes al usuario
function showMessage(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 p-4 rounded shadow-lg ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white fade-in slide-in`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.classList.remove('fade-in', 'slide-in');
        alertDiv.classList.add('fade-out', 'slide-out');
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}

// Función para mostrar errores de validación
function showFieldError(field, message) {
    const input = document.getElementById(field);
    if (!input) return;

    input.classList.add('is-invalid');
    
    // Remover mensaje de error anterior si existe
    const existingFeedback = input.nextElementSibling;
    if (existingFeedback && existingFeedback.classList.contains('invalid-feedback')) {
        existingFeedback.remove();
    }
    
    // Crear y agregar nuevo mensaje de error
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    input.parentNode.insertBefore(feedback, input.nextSibling);
}

function validateForm(formData, formElement = null) {
    // Limpiar errores previos si se proporciona el elemento del formulario
    if (formElement) {
        formElement.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        formElement.querySelectorAll('.invalid-feedback').forEach(el => {
            el.remove();
        });
    }

    // Limpiar campos de texto
    ['nombre', 'obs', 'mes'].forEach(field => {
        const value = formData.get(field);
        if (value) {
            formData.set(field, value.trim());
        }
    });

    // Eliminar validaciones de campos requeridos y formatos
    // const errors = [];
    // const requiredFields = ['nombre', 'fecha', 'entrada', 'salida', 'mes'];
    
    // Verificar campos requeridos
    // for (let field of requiredFields) {
    //     const value = formData.get(field);
    //     if (!value || value.trim() === '') {
    //         errors.push({ field, message: `El campo ${field} es obligatorio` });
    //         if (formElement) showFieldError(field, `El campo ${field} es obligatorio`);
    //     }
    // }

    // Validar formato de fecha y asegurarse de que no sea futura
    // const fecha = formData.get('fecha');
    // if (fecha) {
    //     const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    //     if (!fechaRegex.test(fecha)) {
    //         errors.push({ field: 'fecha', message: 'El formato de fecha debe ser YYYY-MM-DD' });
    //         if (formElement) showFieldError('fecha', 'El formato de fecha debe ser YYYY-MM-DD');
    //     } else {
    //         const fechaSeleccionada = new Date(fecha);
    //         const hoy = new Date();
    //         hoy.setHours(0, 0, 0, 0);
    //         if (fechaSeleccionada > hoy) {
    //             errors.push({ field: 'fecha', message: 'La fecha no puede ser futura' });
    //             if (formElement) showFieldError('fecha', 'La fecha no puede ser futura');
    //         }
    //         if (isNaN(fechaSeleccionada.getTime())) {
    //             errors.push({ field: 'fecha', message: 'La fecha no es válida' });
    //             if (formElement) showFieldError('fecha', 'La fecha no es válida');
    //         }
    //     }
    // }

    // Validar formato de hora y secuencia lógica
    // const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    // const horas = {
    //     entrada: formData.get('entrada'),
    //     salida: formData.get('salida'),
    //     entrada2: formData.get('entrada2'),
    //     salida2: formData.get('salida2'),
    //     entrada3: formData.get('entrada3'),
    //     salida3: formData.get('salida3')
    // };

    // Object.entries(horas).forEach(([campo, valor]) => {
    //     if (valor && !horaRegex.test(valor)) {
    //         errors.push({ field: campo, message: `El formato debe ser HH:MM` });
    //         if (formElement) showFieldError(campo, `El formato debe ser HH:MM`);
    //     }
    // });

    // if (horas.entrada && horas.salida) {
    //     if (horas.entrada >= horas.salida) {
    //         errors.push({ field: 'salida', message: 'La salida debe ser posterior a la entrada' });
    //         if (formElement) showFieldError('salida', 'La salida debe ser posterior a la entrada');
    //     }
    // }

    // if (horas.entrada2 && horas.salida2) {
    //     if (horas.entrada2 >= horas.salida2) {
    //         errors.push({ field: 'salida2', message: 'La salida 2 debe ser posterior a la entrada 2' });
    //         if (formElement) showFieldError('salida2', 'La salida 2 debe ser posterior a la entrada 2');
    //     }
    //     if (horas.entrada2 <= horas.salida) {
    //         errors.push({ field: 'entrada2', message: 'La entrada 2 debe ser posterior a la salida 1' });
    //         if (formElement) showFieldError('entrada2', 'La entrada 2 debe ser posterior a la salida 1');
    //     }
    // }

    // if (horas.entrada3 && horas.salida3) {
    //     if (horas.entrada3 >= horas.salida3) {
    //         errors.push({ field: 'salida3', message: 'La salida 3 debe ser posterior a la entrada 3' });
    //         if (formElement) showFieldError('salida3', 'La salida 3 debe ser posterior a la entrada 3');
    //     }
    //     if (horas.entrada3 <= horas.salida2) {
    //         errors.push({ field: 'entrada3', message: 'La entrada 3 debe ser posterior a la salida 2' });
    //         if (formElement) showFieldError('entrada3', 'La entrada 3 debe ser posterior a la salida 2');
    //     }
    // }

    // const mes = formData.get('mes')?.trim().toLowerCase();
    // const mesesValidos = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    //                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    // if (mes && !mesesValidos.includes(mes)) {
    //     errors.push({ field: 'mes', message: 'El mes ingresado no es válido' });
    //     if (formElement) showFieldError('mes', 'El mes ingresado no es válido');
    // }

    // if (mes && fecha) {
    //     const mesesNum = {
    //         'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
    //         'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    //     };
    //     
    //     const fechaSeleccionada = new Date(fecha);
    //     if (mesesNum[mes] !== fechaSeleccionada.getMonth()) {
    //         errors.push({ field: 'mes', message: 'El mes no coincide con la fecha seleccionada' });
    //         if (formElement) showFieldError('mes', 'El mes no coincide con la fecha seleccionada');
    //     }
    // }

    // const obs = formData.get('obs');
    // if (obs && obs.length > 500) {
    //     errors.push({ field: 'obs', message: 'Las observaciones no pueden exceder los 500 caracteres' });
    //     if (formElement) showFieldError('obs', 'Las observaciones no pueden exceder los 500 caracteres');
    // }

    console.log('Validando formulario con los siguientes datos:', Object.fromEntries(formData.entries()));

    // if (errors.length > 0) {
    //     console.error('Errores de validación detectados:', errors);
    //     const error = new Error('Errores de validación');
    //     error.validationErrors = errors;
    //     throw error;
    // }

    return true;
}

// Función para limpiar y validar datos del formulario
function sanitizeFormData(formData) {
    ['nombre', 'obs', 'mes'].forEach(field => {
        const value = formData.get(field);
        if (value) {
            formData.set(field, value.trim());
        }
    });

    const mes = formData.get('mes');
    if (mes) {
        formData.set('mes', mes.toLowerCase());
    }

    const fecha = formData.get('fecha');
    if (fecha) {
        const fechaObj = new Date(fecha);
        formData.set('fecha', fechaObj.toISOString().split('T')[0]);
    }

    return formData;
}

// Función para enviar el formulario de agregar registro
document.getElementById('addForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const loadingOverlay = document.createElement('div');
    
    try {
        loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loadingOverlay.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow-lg">
                <i class="fas fa-spinner fa-spin text-blue-500 mr-2"></i>
                Guardando registro...
            </div>`;
        document.body.appendChild(loadingOverlay);

        let formData = new FormData(this);
        formData = sanitizeFormData(formData);
        validateForm(formData);
        
        const response = await fetch('process.php', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('La respuesta del servidor no es JSON válido');
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al agregar el registro');
        }

        const newRecord = {
            id: data.id,
            nombre: formData.get('nombre'),
            fecha: formData.get('fecha'),
            entrada: formData.get('entrada'),
            salida: formData.get('salida'),
            entrada2: formData.get('entrada2') || '',
            salida2: formData.get('salida2') || '',
            entrada3: formData.get('entrada3') || '',
            salida3: formData.get('salida3') || '',
            obs: formData.get('obs') || '',
            mes: formData.get('mes')
        };

        const tableBody = document.getElementById('tableBody');
        if (!tableBody) {
            throw new Error('Error al encontrar la tabla de registros');
        }

        const currentContent = tableBody.innerHTML;
        
        await renderRecords([newRecord]);

        if (currentContent && !currentContent.includes('No se encontraron registros')) {
            const firstRow = tableBody.firstChild;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = currentContent;
            Array.from(tempDiv.children).forEach(child => {
                if (child.tagName === 'TR') {
                    tableBody.insertBefore(child, firstRow.nextSibling);
                }
            });
        }

        const newRow = tableBody.querySelector(`tr[data-id="${data.id}"]`);
        if (newRow) {
            newRow.style.opacity = '0';
            newRow.style.transform = 'translateY(-20px)';
            requestAnimationFrame(() => {
                newRow.style.transition = 'all 0.5s ease';
                newRow.style.opacity = '1';
                newRow.style.transform = 'translateY(0)';
                newRow.style.backgroundColor = '#f0fdf4';
                setTimeout(() => {
                    newRow.style.backgroundColor = '';
                }, 1000);
            });
        }

        showMessage('Registro agregado exitosamente', 'success');
        cleanupForm('addForm', 'addModal');

    } catch (error) {
        console.error('Error al agregar registro:', error);
        showMessage(error.message, 'error');
    } finally {
        if (loadingOverlay.parentNode) {
            loadingOverlay.remove();
        }
    }
});

// Función para cargar los registros de hoy
async function loadTodayRecords() {
    try {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) {
            throw new Error('Error en la estructura de la página');
        }

        showMessage('Cargando registros...', 'info');
        
        const response = await fetch('get_today_records.php', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('La respuesta del servidor no es JSON válido');
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al cargar los registros');
        }

        await renderRecords(data.data, 'No se encontraron registros para hoy.');
        
        if (data.data && data.data.length > 0) {
            showMessage('Registros cargados exitosamente', 'success');
        } else {
            showMessage('No hay registros para hoy', 'info');
        }

    } catch (error) {
        console.error('Error al cargar los registros:', error);
        showMessage(error.message, 'error');
        await renderRecords([], `Error: ${error.message}`);
    }
}

// Función para limpiar formulario y cerrar modal
function cleanupForm(formId, modalId) {
    const form = document.getElementById(formId);
    const modal = document.getElementById(modalId);
    
    if (form) {
        form.reset();
        form.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        form.querySelectorAll('.invalid-feedback').forEach(el => {
            el.remove();
        });
    }
    
    if (modal) {
        if (modalId === 'viewModal') {
            const detailsContainer = modal.querySelector('#recordDetails');
            if (detailsContainer) {
                detailsContainer.innerHTML = '';
            }
        } else if (modalId === 'editModal') {
            modal.querySelectorAll('select').forEach(select => {
                select.value = select.firstElementChild?.value || '';
            });
        }

        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            modal.classList.add('opacity-0', 'pointer-events-none');
            modal.style.transform = '';
            document.body.classList.remove('modal-active');
        }, 200);
    }
}

// Función para mostrar modal con animación
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        modal.classList.remove('opacity-0', 'pointer-events-none');
        
        requestAnimationFrame(() => {
            modal.style.transition = 'all 0.2s ease-out';
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });

        document.body.classList.add('modal-active');
    }
}

// Event listeners para los modales
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal:not(.opacity-0)');
            modals.forEach(modal => {
                const modalId = modal.id;
                const formId = modalId === 'editModal' ? 'editForm' :
                             modalId === 'addModal' ? 'addForm' : null;
                
                cleanupForm(formId, modalId);
            });
        }
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                const modal = this.closest('.modal');
                if (modal) {
                    const modalId = modal.id;
                    const formId = modalId === 'editModal' ? 'editForm' :
                                 modalId === 'addModal' ? 'addForm' : null;
                    
                    cleanupForm(formId, modalId);
                }
            }
        });
    });

    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                const modalId = modal.id;
                const formId = modalId === 'editModal' ? 'editForm' :
                             modalId === 'addModal' ? 'addForm' : null;
                
                cleanupForm(formId, modalId);
            }
        });
    });

    loadTodayRecords();
});

// Función para ver un registro
async function viewRecord(id) {
    const loadingOverlay = createLoadingOverlay('Cargando detalles...');
    
    try {
        if (!id) {
            throw new Error('ID no proporcionado');
        }

        const response = await fetch(`get_record_details.php?id=${encodeURIComponent(id)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await handleServerResponse(response, 'Error al obtener los detalles del registro');
        
        const recordDetails = document.getElementById('recordDetails');
        if (!recordDetails) {
            throw new Error('No se encontró el elemento para mostrar los detalles');
        }

        recordDetails.innerHTML = '';
        recordDetails.style.opacity = '0';
        recordDetails.style.transform = 'translateY(-20px)';
        recordDetails.style.transition = 'all 0.3s ease';

        const record = {
            nombre: data.nombre || '',
            fecha: data.fecha || '',
            entrada: data.entrada || '',
            salida: data.salida || '',
            entrada2: data.entrada2 || '',
            salida2: data.salida2 || '',
            entrada3: data.entrada3 || '',
            salida3: data.salida3 || '',
            obs: data.obs || '',
            mes: data.mes || ''
        };

        const fechaFormateada = new Date(record.fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        recordDetails.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="border-b pb-2">
                        <p class="text-gray-600 text-sm">Nombre</p>
                        <p class="font-semibold">${escapeHtml(record.nombre)}</p>
                    </div>
                    <div class="border-b pb-2">
                        <p class="text-gray-600 text-sm">Fecha</p>
                        <p class="font-semibold">${escapeHtml(fechaFormateada)}</p>
                    </div>
                    <div class="border-b pb-2">
                        <p class="text-gray-600 text-sm">Mes</p>
                        <p class="font-semibold">${escapeHtml(record.mes)}</p>
                    </div>
                    <div class="border-b pb-2">
                        <p class="text-gray-600 text-sm">Entrada</p>
                        <p class="font-semibold">${escapeHtml(record.entrada)}</p>
                    </div>
                    <div class="border-b pb-2">
                        <p class="text-gray-600 text-sm">Salida</p>
                        <p class="font-semibold">${escapeHtml(record.salida)}</p>
                    </div>
                    ${record.entrada2 || record.salida2 ? `
                        <div class="border-b pb-2">
                            <p class="text-gray-600 text-sm">Entrada 2</p>
                            <p class="font-semibold">${escapeHtml(record.entrada2)}</p>
                        </div>
                        <div class="border-b pb-2">
                            <p class="text-gray-600 text-sm">Salida 2</p>
                            <p class="font-semibold">${escapeHtml(record.salida2)}</p>
                        </div>
                    ` : ''}
                    ${record.entrada3 || record.salida3 ? `
                        <div class="border-b pb-2">
                            <p class="text-gray-600 text-sm">Entrada 3</p>
                            <p class="font-semibold">${escapeHtml(record.entrada3)}</p>
                        </div>
                        <div class="border-b pb-2">
                            <p class="text-gray-600 text-sm">Salida 3</p>
                            <p class="font-semibold">${escapeHtml(record.salida3)}</p>
                        </div>
                    ` : ''}
                    ${record.obs ? `
                        <div class="col-span-2 border-b pb-2">
                            <p class="text-gray-600 text-sm">Observaciones</p>
                            <p class="font-semibold whitespace-pre-wrap">${escapeHtml(record.obs)}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        openModal('viewModal');
        requestAnimationFrame(() => {
            recordDetails.style.opacity = '1';
            recordDetails.style.transform = 'translateY(0)';
        });

        showMessage('Detalles cargados exitosamente', 'success');

    } catch (error) {
        console.error('Error al cargar los detalles:', error);
        showMessage(error.message, 'error');
        
        const modal = document.getElementById('viewModal');
        if (modal && !modal.classList.contains('opacity-0')) {
            closeModal('viewModal');
        }
    } finally {
        if (loadingOverlay.parentNode) {
            loadingOverlay.remove();
        }
    }
}

// Función para editar un registro
async function editRecord(id) {
    try {
        if (!id) {
            throw new Error('ID no proporcionado');
        }

        showMessage('Cargando detalles...', 'info');
        
        const response = await fetch(`get_record_details.php?id=${encodeURIComponent(id)}`, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en la respuesta:', errorText);
            throw new Error(`Error al obtener los detalles: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('La respuesta del servidor no es JSON válido');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al obtener los detalles del registro');
        }

        const formElements = [
            'editId', 'editNombre', 'editFecha', 'editEntrada', 'editSalida',
            'editEntrada2', 'editSalida2', 'editEntrada3', 'editSalida3',
            'editObs', 'editMes'
        ];

        for (const elementId of formElements) {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Elemento del formulario no encontrado: ${elementId}`);
            }
        }

        const form = document.getElementById('editForm');
        form.style.opacity = '0';
        form.style.transform = 'translateY(-20px)';
        form.style.transition = 'all 0.3s ease';

        document.getElementById('editId').value = data.id;
        document.getElementById('editNombre').value = data.nombre || '';
        document.getElementById('editFecha').value = data.fecha || '';
        document.getElementById('editEntrada').value = data.entrada || '';
        document.getElementById('editSalida').value = data.salida || '';
        document.getElementById('editEntrada2').value = data.entrada2 || '';
        document.getElementById('editSalida2').value = data.salida2 || '';
        document.getElementById('editEntrada3').value = data.entrada3 || '';
        document.getElementById('editSalida3').value = data.salida3 || '';
        document.getElementById('editObs').value = data.obs || '';
        document.getElementById('editMes').value = data.mes || '';

        openModal('editModal');

        setTimeout(() => {
            form.style.opacity = '1';
            form.style.transform = 'translateY(0)';
        }, 50);

        showMessage('Registro cargado exitosamente', 'success');
    } catch (error) {
        console.error('Error al cargar el registro:', error);
        showMessage(error.message, 'error');
        
        const modal = document.getElementById('editModal');
        if (modal && !modal.classList.contains('opacity-0')) {
            closeModal('editModal');
        }
    }
}

// Función para eliminar un registro
async function deleteRecord(id) {
    if (!id) {
        showMessage('ID de registro no válido', 'error');
        return;
    }

    if (!confirm('¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.')) {
        return;
    }

    const loadingOverlay = createLoadingOverlay('Eliminando registro...');
    console.log('Intentando eliminar registro con ID:', id);

    const row = document.querySelector(`tr[data-id="${id}"]`);
    console.log('Fila encontrada:', row);

    if (!row) {
        loadingOverlay.remove();
        showMessage('Registro no encontrado en la tabla', 'error');
        return;
    }

    try {
        row.style.backgroundColor = '#fee2e2';
        row.style.opacity = '0.5';

        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', id);

        const response = await fetch('process.php', {
            method: 'POST',
            body: formData,
            headers: {'X-Requested-With': 'XMLHttpRequest'}
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Error al eliminar el registro');
        }

        row.style.transition = 'all 0.3s ease';
        row.style.transform = 'translateX(100%)';
        row.style.opacity = '0';

        await new Promise(resolve => setTimeout(resolve, 300));
        
        row.remove();
        showMessage('Registro eliminado exitosamente', 'success');
        
        await loadTodayRecords();

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, 'error');
        
        if (row) {
            row.style.transition = 'all 0.3s ease';
            row.style.backgroundColor = '';
            row.style.opacity = '1';
            row.style.transform = '';
        }
    } finally {
        loadingOverlay.remove();
    }
}

// Función para escapar HTML y prevenir XSS
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/"/g, '"')
        .replace(/'/g, "&#039;");
}

// Función para normalizar texto (remover acentos y convertir a minúsculas)
function normalizeText(text) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// Función para resaltar el texto encontrado
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const normalizedText = text.toString();
    const normalizedSearchTerm = searchTerm.toString();
    const regex = new RegExp(normalizedSearchTerm, 'gi');
    return normalizedText.replace(regex, match => `<span class="bg-yellow-200">${match}</span>`);
}

// Función para filtrar la tabla y mostrar sugerencias
async function filterTable() {
    const input = document.getElementById('search');
    const searchTerm = input.value.toLowerCase();
    const suggestionsContainer = document.getElementById('suggestions');
    const tableBody = document.getElementById('tableBody');
    const rows = tableBody.getElementsByTagName('tr');
    let matchCount = 0;
    const suggestions = [];

    // Limpiar sugerencias
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.classList.add('hidden');

    // Filtrar filas
    Array.from(rows).forEach(row => {
        const cells = row.getElementsByTagName('td');
        const nameCell = cells[1]; // Suponiendo que el nombre está en la segunda columna
        const name = nameCell.textContent.toLowerCase();

        if (name.startsWith(searchTerm) && searchTerm.length > 0) {
            matchCount++;
            row.style.display = '';
            suggestions.push(nameCell.textContent); // Agregar a las sugerencias
        } else {
            row.style.display = 'none';
        }
    });

    // Mostrar sugerencias
    if (searchTerm.length > 0) {
        const uniqueSuggestions = [...new Set(suggestions)]; // Eliminar duplicados
        uniqueSuggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item cursor-pointer p-2 hover:bg-gray-200';
            suggestionItem.textContent = suggestion;
            suggestionItem.onclick = () => {
                input.value = suggestion; // Completar el input con la sugerencia
                suggestionsContainer.classList.add('hidden'); // Ocultar sugerencias
                filterTable(); // Volver a filtrar la tabla
            };
            suggestionsContainer.appendChild(suggestionItem);
        });
        suggestionsContainer.classList.remove('hidden'); // Mostrar el contenedor de sugerencias
    }
}

// Función para obtener el nombre del campo según el índice
function getFieldName(index) {
    const fieldNames = [
        'ID', 'Nombre', 'Fecha', 'Entrada', 'Salida',
        'Entrada 2', 'Salida 2', 'Entrada 3', 'Salida 3',
        'Observaciones', 'Mes'
    ];
    return fieldNames[index] || null;
}

// Función para mostrar sugerencias de búsqueda
function showSearchSuggestions(searchTerm) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    const table = document.getElementById('tableBody');
    const allCells = Array.from(table.getElementsByTagName('td'));
    const allTexts = allCells.map(cell => cell.textContent || cell.innerText);
    
    const suggestions = allTexts
        .filter(text => normalizeText(text).length > 0)
        .filter((text, index, self) => self.indexOf(text) === index)
        .filter(text => {
            const similarity = calculateSimilarity(searchTerm, normalizeText(text));
            return similarity > 0.3;
        })
        .slice(0, 3);

    if (suggestions.length > 0) {
        searchResults.innerHTML = `
            <div class="text-sm text-gray-600 mt-2">
                No se encontraron resultados para "${searchTerm}"<br>
                Sugerencias:
                <ul class="mt-1">
                    ${suggestions.map(sugg => `
                        <li class="cursor-pointer text-blue-500 hover:text-blue-700"
                            onclick="document.getElementById('search').value='${sugg}'; filterTable();">
                            ¿Quisiste buscar "${sugg}"?
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
}

// Función para calcular la similitud entre dos textos
function calculateSimilarity(text1, text2) {
    text1 = normalizeText(text1);
    text2 = normalizeText(text2);
    
    if (text1.length === 0 || text2.length === 0) return 0;
    if (text1 === text2) return 1;
    
    const length = Math.max(text1.length, text2.length);
    const editDistance = levenshteinDistance(text1, text2);
    
    return 1 - (editDistance / length);
}

// Función para calcular la distancia de Levenshtein
function levenshteinDistance(text1, text2) {
    const matrix = Array(text2.length + 1).fill(null)
        .map(() => Array(text1.length + 1).fill(null));

    for (let i = 0; i <= text1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= text2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= text2.length; j++) {
        for (let i = 1; i <= text1.length; i++) {
            const indicator = text1[i - 1] === text2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }

    return matrix[text2.length][text1.length];
}

// Agregar event listener para búsqueda en tiempo real
document.getElementById('search')?.addEventListener('input', debounce(filterTable, 300));

// Función debounce para mejorar el rendimiento
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Funciones para manejar los modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        document.body.classList.add('modal-active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        document.body.classList.remove('modal-active');
    }
}

// Manejar el formulario de edición
async function handleEditFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const loadingOverlay = createLoadingOverlay('Guardando cambios...');

    try {
        const response = await fetch('process.php', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('La respuesta del servidor no es JSON válido');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Error al editar el registro');
        }

        showMessage('Registro editado exitosamente', 'success');
        cleanupForm('editForm', 'editModal');
        await loadTodayRecords();

    } catch (error) {
        console.error('Error al editar registro:', error);
        showMessage(error.message, 'error');
    } finally {
        if (loadingOverlay.parentNode) {
            loadingOverlay.remove();
        }
    }
}

async function renderRecords(records, emptyMessage) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    if (records.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 12;
        cell.className = 'text-center py-4 text-gray-500';
        cell.textContent = emptyMessage;
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    records.forEach(record => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';

        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.nombre || 'N/A'}</td>
            <td>${record.fecha || 'N/A'}</td>
            <td>${record.entrada || 'N/A'}</td>
            <td>${record.salida || 'N/A'}</td>
            <td>${record.entrada2 || 'N/A'}</td>
            <td>${record.salida2 || 'N/A'}</td>
            <td>${record.entrada3 || 'N/A'}</td>
            <td>${record.salida3 || 'N/A'}</td>
            <td class='max-w-xs truncate'>${record.obs || 'N/A'}</td>
            <td>${record.mes || 'N/A'}</td>
            <td>
                <div class='action-buttons'>
                    <button class='action-button text-blue-500 hover:text-blue-700' onclick='viewRecord(${record.id})'>
                        <i class='fas fa-eye'></i>
                    </button>
                    <button class='action-button text-yellow-500 hover:text-yellow-700' onclick='editRecord(${record.id})'>
                        <i class='fas fa-edit'></i>
                    </button>
                    <button class='action-button text-red-500 hover:text-red-700' onclick='deleteRecord(${record.id})'>
                        <i class='fas fa-trash'></i>
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

async function viewAllRecords() {
    try {
        const response = await fetch('get_all_records.php', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await handleServerResponse(response, 'Error al cargar todos los registros');
        await renderRecords(data.data, 'No se encontraron registros.');
        showMessage('Todos los registros cargados exitosamente', 'success');
    } catch (error) {
        console.error('Error al cargar todos los registros:', error);
        showMessage(error.message, 'error');
    }
}

async function viewTodayRecords() {
    try {
        const response = await fetch('get_today_records.php', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await handleServerResponse(response, 'Error al cargar los registros de hoy');
        await renderRecords(data.data, 'No se encontraron registros para hoy.');
        showMessage('Registros de hoy cargados exitosamente', 'success');
    } catch (error) {
        console.error('Error al cargar los registros de hoy:', error);
        showMessage(error.message, 'error');
    }
}
