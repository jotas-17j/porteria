// Interceptor global para peticiones fetch
async function fetchWithSession(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (response.status === 401) {
            showMessage('Sesión Expirada', 'Su sesión ha expirado. Será redirigido al login.', 'warning');
            setTimeout(() => {
                window.location.href = '../login.php?expired=1';
            }, 2000);
            throw new Error('Sesión expirada');
        }
        
        return response;
    } catch (error) {
        if (error.message === 'Sesión expirada') {
            throw error;
        }
        showMessage('Error', 'Error de conexión', 'danger');
        throw error;
    }
}

// Variables globales
let currentRecordId = null;
let isProcessing = false;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    initializeEventListeners();
    loadTodayRecords();
});

function initializeUI() {
    // Crear loader si no existe
    if (!document.getElementById('loader-container')) {
        const loaderContainer = document.createElement('div');
        loaderContainer.id = 'loader-container';
        loaderContainer.className = 'loader-container';
        loaderContainer.innerHTML = '<div class="loader"></div>';
        document.body.appendChild(loaderContainer);
    }

    // Inicializar tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function initializeEventListeners() {
    // Eventos de navegación
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', async function(e) {
            e.preventDefault();
            if (isProcessing) return;

            const section = this.dataset.section;
            await switchSection(section);
        });
    });

    // Eventos de búsqueda
    const searchInput = document.getElementById('searchName');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchByName();
        });
    }

    // Prevenir doble envío de formularios
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (isProcessing) {
                e.preventDefault();
                return;
            }
            isProcessing = true;
        });
    });
}

async function switchSection(sectionId) {
    showLoading();
    try {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
        });

        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) throw new Error('Sección no encontrada');

        targetSection.style.display = 'block';
        
        // Actualizar navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.nav-item[data-section="${sectionId}"]`)?.classList.add('active');

        // Actualizar título
        document.getElementById('currentView').textContent = targetSection.dataset.title || '';

        // Cargar datos si es necesario
        if (sectionId === 'viewTodayRecordsSection') {
            await loadTodayRecords();
        } else if (sectionId === 'searchSection') {
            initializeSearchName();
        }

    } catch (error) {
        showMessage('Error', error.message, 'danger');
    } finally {
        hideLoading();
    }
}

async function loadTodayRecords() {
    const todayRecordsTable = document.getElementById('todayRecordsTable');
    if (!todayRecordsTable) return;

    showLoading();
    try {
        console.log('Cargando registros de hoy...');
        const response = await fetchWithSession('get_today_records.php');
        console.log('Respuesta del servidor:', response);
        const data = await response.json();
        console.log('Datos recibidos:', data);

        if (data.error) {
            console.error('Error al cargar registros:', data.error);
            throw new Error(data.error);
        }

        let tableHTML = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th class="column-id">#</th>
                            <th class="column-name">Nombre</th>
                            <th class="column-time">Fecha</th>
                            <th class="column-time">E1</th>
                            <th class="column-time">S1</th>
                            <th class="column-time">E2</th>
                            <th class="column-time">S2</th>
                            <th class="column-time">E3</th>
                            <th class="column-time">S3</th>
                            <th>Observaciones</th>
                            <th class="column-time">Mes</th>
                            <th class="column-actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (data.records && data.records.length > 0) {
            data.records.forEach(record => {
                tableHTML += `
                    <tr>
                        <td class="column-id">${escapeHtml(record.id)}</td>
                        <td class="column-name">${escapeHtml(record.nombre)}</td>
                        <td class="column-time">${escapeHtml(record.fecha)}</td>
                        <td class="column-time">${escapeHtml(record.entrada)}</td>
                        <td class="column-time">${escapeHtml(record.salida)}</td>
                        <td class="column-time">${escapeHtml(record.entrada2)}</td>
                        <td class="column-time">${escapeHtml(record.salida2)}</td>
                        <td class="column-time">${escapeHtml(record.entrada3)}</td>
                        <td class="column-time">${escapeHtml(record.salida3)}</td>
                        <td>${escapeHtml(record.obs)}</td>
                        <td class="column-time">${escapeHtml(record.mes)}</td>
                        <td class="column-actions">
                            <div class="btn-group">
                                <button class="btn btn-warning" onclick="openEditModal(${record.id})" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger" onclick="deleteRecord(${record.id})" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        } else {
            tableHTML += '<tr><td colspan="12" class="text-center">No se encontraron registros para hoy.</td></tr>';
        }

        tableHTML += '</tbody></table></div>';
        todayRecordsTable.innerHTML = tableHTML;

    } catch (error) {
        console.error('Error en loadTodayRecords:', error);
        showMessage('Error', error.message, 'danger');
        todayRecordsTable.innerHTML = '<div class="alert alert-danger">Error al cargar los registros</div>';
    } finally {
        hideLoading();
        console.log('Carga de registros completada.');
    }
}

function validateForm(formData) {
    const required = ['nombre', 'fecha', 'entrada', 'salida', 'mes'];
    const missing = required.filter(field => !formData.get(field)?.trim());
    
    if (missing.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
    }

    // Validar formato de fecha
    const fecha = formData.get('fecha');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        throw new Error('Formato de fecha inválido');
    }

    // Validar horarios
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const horarios = [
        { valor: formData.get('entrada'), nombre: 'Entrada 1' },
        { valor: formData.get('salida'), nombre: 'Salida 1' },
        { valor: formData.get('entrada2'), nombre: 'Entrada 2' },
        { valor: formData.get('salida2'), nombre: 'Salida 2' },
        { valor: formData.get('entrada3'), nombre: 'Entrada 3' },
        { valor: formData.get('salida3'), nombre: 'Salida 3' }
    ];

    horarios.forEach(({ valor, nombre }) => {
        if (valor && !horaRegex.test(valor)) {
            throw new Error(`Formato de hora inválido en ${nombre}`);
        }
    });
}

async function saveRecord() {
    if (isProcessing) return;
    isProcessing = true;
    showLoading();

    try {
        console.log('Guardando registro...');
        if (!currentRecordId) {
            throw new Error('No se ha seleccionado ningún registro');
        }

        const formData = new FormData();
        formData.append('id', currentRecordId);
        formData.append('nombre', document.getElementById('edit-nombre').value.trim());
        formData.append('fecha', document.getElementById('edit-fecha').value);
        formData.append('entrada', document.getElementById('edit-entrada').value);
        formData.append('salida', document.getElementById('edit-salida').value);
        formData.append('entrada2', document.getElementById('edit-entrada2').value);
        formData.append('salida2', document.getElementById('edit-salida2').value);
        formData.append('entrada3', document.getElementById('edit-entrada3').value);
        formData.append('salida3', document.getElementById('edit-salida3').value);
        formData.append('obs', document.getElementById('edit-obs').value.trim());
        formData.append('mes', document.getElementById('edit-mes').value.trim());
        formData.append('action', 'update');

        console.log('Datos del formulario:', Object.fromEntries(formData));

        validateForm(formData);

        const response = await fetchWithSession('edit_records.php', {
            method: 'POST',
            body: formData
        });

        console.log('Respuesta del servidor:', response);
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (!data.success) {
            console.error('Error al guardar registro:', data.message);
            throw new Error(data.message || 'Error al guardar los cambios');
        }

        showMessage('Éxito', 'Registro actualizado correctamente', 'success');
        $('#editModal').modal('hide');
        
        // Recargar vista actual
        const currentView = document.getElementById('currentView').textContent;
        if (currentView === 'Registros de Hoy') {
            await loadTodayRecords();
        }

    } catch (error) {
        console.error('Error en saveRecord:', error);
        showMessage('Error', error.message, 'danger');
    } finally {
        isProcessing = false;
        hideLoading();
        console.log('Guardado de registro completado.');
    }
}

async function deleteRecord(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
        try {
            console.log('Eliminando registro con ID:', id);
            const response = await fetchWithSession('delete_records.php', {
                method: 'POST',
                body: JSON.stringify({ id }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Respuesta del servidor:', response);
            const data = await response.json();
            console.log('Datos recibidos:', data);
            if (!data.success) {
                console.error('Error al eliminar registro:', data.error);
                throw new Error(data.error || 'Error al eliminar el registro');
            }
            showMessage('Éxito', data.message, 'success');
            await loadTodayRecords(); // Reload records after deletion
        } catch (error) {
            console.error('Error en deleteRecord:', error);
            showMessage('Error', error.message, 'danger');
        }
    }
}

function showLoading() {
    const loader = document.getElementById('loader-container');
    if (loader) {
        loader.style.display = 'flex';
        setTimeout(() => loader.classList.add('show'), 0);
    }
}

function hideLoading() {
    const loader = document.getElementById('loader-container');
    if (loader) {
        loader.classList.remove('show');
        setTimeout(() => loader.style.display = 'none', 300);
    }
}

function showMessage(title, message, type = 'info', duration = 8000) {
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
    if (!alertPlaceholder) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'alert-wrapper mb-3';
    
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <div class="d-flex align-items-center">
                <div class="alert-icon me-2">
                    ${getAlertIcon(type)}
                </div>
                <div>
                    <strong>${title}</strong>
                    <div class="alert-message">${message}</div>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    wrapper.innerHTML = alertHTML;
    alertPlaceholder.insertBefore(wrapper, alertPlaceholder.firstChild);

    setTimeout(() => {
        const alert = wrapper.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => wrapper.remove(), 300);
        }
    }, duration);
}

function getAlertIcon(type) {
    const icons = {
        'success': '<i class="fas fa-check-circle"></i>',
        'info': '<i class="fas fa-info-circle"></i>',
        'warning': '<i class="fas fa-exclamation-triangle"></i>',
        'danger': '<i class="fas fa-times-circle"></i>'
    };
    return icons[type] || icons.info;
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Recargar datos automáticamente
setInterval(() => {
    const currentView = document.getElementById('currentView')?.textContent;
    if (currentView === 'Registros de Hoy' && !isProcessing) {
        loadTodayRecords();
    }
}, 300000); // Cada 5 minutos
