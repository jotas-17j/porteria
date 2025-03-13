<?php
// Iniciar o reanudar la sesión
session_start();

// Verificar si el usuario está autenticado
if (!isset($_SESSION['user_id'])) {
    // Establecer un ID de usuario temporal para pruebas (solo en desarrollo)
    if ($_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_NAME'] === '127.0.0.1') {
        $_SESSION['user_id'] = 1;
        $_SESSION['username'] = 'admin';
    } else {
        // Redirigir al login en producción
        header('Location: ../../login.php');
        exit;
    }
}

// Habilitar la visualización de errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Gestión de Choferes</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet"/>
    <style>
        /* Estilos base modernizados */
        :root {
            --primary: #1d4ed8; /* Cambiado para diferenciar */
            --primary-light: #2563eb;
            --secondary: #475569;
            --success: #10b981;
            --danger: #ef4444;
            --warning: #f59e0b;
            --background: #e5e7eb;
            --surface: #ffffff;
            --text: #1e293b;
        }

        /* Fondo moderno con gradiente suave */
        body {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            min-height: 100vh;
        }

        /* Sidebar moderno */
        .w-64 {
            background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
            box-shadow: 4px 0 15px rgba(0, 0, 0, 0.05);
        }

        /* Contenedor principal optimizado */
        .main-container {
            max-height: 100vh;
            overflow-y: auto;
            padding: 1.5rem;
        }

        /* Tabla optimizada */
        .table-container {
            background: var(--surface);
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
        }

        .compact-table {
            font-size: 0.875rem;
        }

        .compact-table th {
            padding: 0.75rem 1rem;
            background: linear-gradient(90deg, #1e293b 0%, #334155 100%);
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            white-space: nowrap;
        }

        .compact-table td {
            padding: 0.75rem 1rem;
            white-space: nowrap;
        }

        /* Botones de acción en la tabla */
        .action-buttons {
            display: flex;
            gap: 0.5rem;
            padding: 0.25rem;
        }

        .action-button {
            padding: 0.5rem;
            border-radius: 0.5rem;
            transition: all 0.2s;
        }

        .action-button:hover {
            transform: translateY(-2px);
        }

        /* Campos de búsqueda modernos */
        .search-container {
            position: relative;
            max-width: 24rem;
        }

        .search-input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
            background: white;
            transition: all 0.2s;
        }

        .search-input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        /* Diseño responsivo mejorado */
        @media (max-width: 1280px) {
            .compact-table {
                font-size: 0.75rem;
            }
        }
    </style>
</head>
<body class="bg-gray-100 font-sans leading-normal tracking-normal">
<div class="flex">
    <!-- Sidebar mejorado -->
    <div class="w-64 bg-gray-900 h-screen p-4 fixed">
        <div class="flex flex-col items-center">
            <div class="w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-500 ring-opacity-50 mb-4">
                <img alt="User avatar" class="w-full h-full object-cover" src="https://storage.googleapis.com/a1aa/image/My5atNx3knf6zUdmV9HhqutfLt9jh2BUHHtRL4v7deo.jpg"/>
            </div>
            <h2 class="text-white text-xl font-semibold mb-8">Bienvenido, admi</h2>
        </div>
        <nav class="text-white">
        <ul>
    <li class="mb-4">
        <a class="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded transition duration-300" onclick="openModal('addModal')">
            <i class="fas fa-plus mr-2"></i> Agregar Registro
        </a>
    </li>
    <li class="mb-4">
        <a class="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded transition duration-300" onclick="viewTodayRecords()">
            <i class="fas fa-calendar-day mr-2"></i> Ver Registros de Hoy
        </a>
    </li>
    <li class="mb-4">
        <a class="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded transition duration-300" onclick="viewAllRecords()">
            <i class="fas fa-list mr-2"></i> Ver Todos los Registros
        </a>
    </li>
    <li class="mb-4">
        <a class="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded transition duration-300" href="../porteria/index.php">
            <i class="fas fa-home mr-2"></i> Volver a Inicio
        </a>
    </li>
    <li class="mb-4">
        <a class="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded transition duration-300" onclick="logout()">
            <i class="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
        </a>
    </li>
</ul>
        </nav>
    </div>
    <!-- Main Content -->
    <div class="flex-1 pl-64">
        <div class="main-container">
            <div class="max-w-full mx-auto">
                <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-800 flex items-center">
                                <i class="fas fa-clipboard-list text-blue-500 mr-3"></i>
                                Gestión de Choferes
                            </h1>
                            <p class="text-gray-600 mt-1" id="currentView">Registros de Hoy</p>
                        </div>
                        
                        <div class="flex items-center gap-4">
                            <div class="search-container">
                                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input type="text" id="searchInput" class="search-input" placeholder="Buscar..." onkeyup="filterTable()"/>
                                <div id="suggestions" class="absolute bg-white border border-gray-300 rounded mt-1 w-full z-10 hidden"></div>
                            </div>
                            
                            <button class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-lg" onclick="openModal('addModal')">
                                <i class="fas fa-plus-circle"></i>
                                Agregar
                            </button>
                        </div>
                    </div>

                    <div class="table-container">
                        <table class="min-w-full compact-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Chofer</th>
                                    <th>Cod1</th>
                                    <th>Patente</th>
                                    <th>F. Salida</th>
                                    <th>F. Ingreso</th>
                                    <th>H. Sal</th>
                                    <th>H. Ing</th>
                                    <th>T. Ocupado</th>
                                    <th>Cod2</th>
                                    <th>Lugar</th>
                                    <th>Detalle</th>
                                    <th>K. Ing</th>
                                    <th>K. Sal</th>
                                    <th>K. Ocup</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tableBody">
                            <?php
                            include '../../conexion/conectado.php';
                            $sql = "SELECT * FROM data_chofer ORDER BY id DESC";
                            $result = $conn->query($sql);

                            if ($result->num_rows > 0) {
                                while($row = $result->fetch_assoc()) {
                                    echo "<tr class='hover:bg-gray-50 transition-colors' data-id='{$row['id']}'>";
                                    echo "<td>{$row['id']}</td>";
                                    echo "<td>{$row['Chofer']}</td>";
                                    echo "<td>{$row['cod1']}</td>";
                                    echo "<td>{$row['Patente']}</td>";
                                    echo "<td>{$row['F_Salida']}</td>";
                                    echo "<td>{$row['F_Ingreso']}</td>";
                                    echo "<td>{$row['H_Sal']}</td>";
                                    echo "<td>{$row['H_ing']}</td>";
                                    echo "<td>{$row['T_Ocupado']}</td>";
                                    echo "<td>{$row['Cod2']}</td>";
                                    echo "<td>{$row['Lugar']}</td>";
                                    echo "<td>{$row['Detalle']}</td>";
                                    echo "<td>{$row['K_Ing']}</td>";
                                    echo "<td>{$row['K_Sal']}</td>";
                                    echo "<td>{$row['K_Ocup']}</td>";
                                    echo "<td>
                                        <div class='action-buttons'>
                                            <button class='action-button text-blue-500 hover:text-blue-700' onclick='viewRecord({$row['id']})'>
                                                <i class='fas fa-eye'></i>
                                            </button>
                                            <button class='action-button text-yellow-500 hover:text-yellow-700' onclick='editRecord({$row['id']})'>
                                                <i class='fas fa-edit'></i>
                                            </button>
                                            <button class='action-button text-red-500 hover:text-red-700' onclick='deleteRecord({$row['id']})'>
                                                <i class='fas fa-trash'></i>
                                            </button>
                                        </div>
                                    </td>";
                                    echo "</tr>";
                                }
                            } else {
                                echo "<tr><td colspan='12' class='text-center py-4 text-gray-500'>No se encontraron registros</td></tr>";
                            }
                            $conn->close();
                            ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- Add Modal -->
<div class="modal fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0 pointer-events-none" id="addModal">
    <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
    <div class="modal-container bg-white w-11/12 md:max-w-4xl mx-auto rounded-2xl shadow-2xl z-50 overflow-y-auto">
        <div class="modal-content py-6 text-left px-8">
            <!-- Título -->
            <div class="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
                <p class="text-3xl font-bold text-gray-800 flex items-center">
                    <i class="fas fa-plus-circle text-blue-500 mr-3"></i>
                    Agregar Registro
                </p>
                <div class="modal-close cursor-pointer z-50 hover:bg-gray-100 rounded-full p-2 transition-all duration-300" onclick="closeModal('addModal')">
                    <svg class="fill-current text-gray-500 hover:text-gray-800" height="24" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                    </svg>
                </div>
            </div>
            <!-- Body -->
            <div class="my-5">
                <form id="addForm" onsubmit="handleFormSubmit(event, 'addForm', 'create.php')">
                    <input type="hidden" name="action" value="add">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="Chofer">
                                <i class="fas fa-user text-blue-500 mr-2"></i>
                                Chofer
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="Chofer" name="Chofer" placeholder="Nombre del chofer" type="text" required/>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="cod1">
                                <i class="fas fa-hashtag text-blue-500 mr-2"></i>
                                Cod1
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="cod1" name="cod1" type="number" required/>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="Patente">
                                <i class="fas fa-car text-blue-500 mr-2"></i>
                                Patente
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="Patente" name="Patente" placeholder="Patente del vehículo" type="text" required/>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="F_Salida">
                                <i class="fas fa-calendar text-blue-500 mr-2"></i>
                                F. Salida
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="F_Salida" name="F_Salida" type="date" required/>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="F_Ingreso">
                                <i class="fas fa-calendar text-blue-500 mr-2"></i>
                                F. Ingreso
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="F_Ingreso" name="F_Ingreso" type="date" required/>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="H_Sal">
                                <i class="fas fa-clock text-blue-500 mr-2"></i>
                                H. Sal
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="H_Sal" name="H_Sal" type="time" required/>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="H_ing">
                                <i class="fas fa-clock text-blue-500 mr-2"></i>
                                H. Ing
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="H_ing" name="H_ing" type="time" required/>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="T_Ocupado">
                                <i class="fas fa-clock text-blue-500 mr-2"></i>
                                T. Ocupado
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="T_Ocupado" name="T_Ocupado" type="text" required/>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="Cod2">
                                <i class="fas fa-hashtag text-blue-500 mr-2"></i>
                                Cod2
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="Cod2" name="Cod2" type="number" required/>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="Lugar">
                                <i class="fas fa-map-marker-alt text-blue-500 mr-2"></i>
                                Lugar
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="Lugar" name="Lugar" placeholder="Lugar" type="text" required/>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="Detalle">
                                <i class="fas fa-comment-alt text-blue-500 mr-2"></i>
                                Detalle
                            </label>
                            <textarea class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="Detalle" name="Detalle" placeholder="Detalle" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="K_Ing">
                                <i class="fas fa-tachometer-alt text-blue-500 mr-2"></i>
                                K. Ing
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="K_Ing" name="K_Ing" type="number" required/>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="K_Sal">
                                <i class="fas fa-tachometer-alt text-blue-500 mr-2"></i>
                                K. Sal
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="K_Sal" name="K_Sal" type="number" required/>
                        </div>
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-3 flex items-center" for="K_Ocup">
                                <i class="fas fa-tachometer-alt text-blue-500 mr-2"></i>
                                K. Ocup
                            </label>
                            <input class="w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" id="K_Ocup" name="K_Ocup" type="number" required/>
                        </div>
                    </div>
                    <div class="flex justify-end gap-4 mt-8">
                        <button class="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transform hover:scale-105 transition-all duration-300 flex items-center gap-2" type="button" onclick="closeModal('addModal')">
                            <i class="fas fa-times"></i>
                            Cancelar
                        </button>
                        <button class="px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-lg" type="submit">
                            <i class="fas fa-save"></i>
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<!-- Edit Modal -->
<div class="modal fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0 pointer-events-none" id="editModal">
    <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
    <div class="modal-container bg-white w-11/12 md:max-w-2xl mx-auto rounded shadow-lg z-50 overflow-y-auto">
        <div class="modal-content py-4 text-left px-6">
            <!-- Title -->
            <div class="flex justify-between items-center pb-3 border-b border-gray-200">
                <p class="text-2xl font-bold text-gray-800"><i class="fas fa-edit mr-2 text-yellow-500"></i> Editar Registro</p>
                <div class="modal-close cursor-pointer z-50" onclick="closeModal('editModal')">
                    <svg class="fill-current text-black" height="18" viewbox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.53 3.47a.75.75 0 00-1.06 0L9 7.94 4.53 3.47a.75.75 0 10-1.06 1.06L7.94 9l-4.47 4.47a.75.75 0 101.06 1.06L9 10.06l4.47 4.47a.75.75 0 101.06-1.06L10.06 9l4.47-4.47a.75.75 0 000-1.06z"></path>
                    </svg>
                </div>
            </div>
            <!-- Body -->
            <div class="my-5">
                <form id="editForm" onsubmit="handleFormSubmit(event, 'editForm', 'update.php')">
                    <input type="hidden" name="action" value="edit">
                    <input type="hidden" id="editId" name="id">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editChofer">Chofer</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editChofer" name="Chofer" placeholder="Nombre del chofer" type="text" required/>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editCod1">Cod1</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editCod1" name="cod1" type="number" required/>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editPatente">Patente</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editPatente" name="Patente" placeholder="Patente del vehículo" type="text" required/>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editF_Salida">F. Salida</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editF_Salida" name="F_Salida" type="date" required/>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editF_Ingreso">F. Ingreso</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editF_Ingreso" name="F_Ingreso" type="date" required/>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editH_Sal">H. Sal</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editH_Sal" name="H_Sal" type="time" required/>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editH_ing">H. Ing</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editH_ing" name="H_ing" type="time" required/>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editT_Ocupado">T. Ocupado</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editT_Ocupado" name="T_Ocupado" type="text" required/>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editCod2">Cod2</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editCod2" name="Cod2" type="number" required/>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editLugar">Lugar</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editLugar" name="Lugar" placeholder="Lugar" type="text" required/>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editDetalle">Detalle</label>
                            <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editDetalle" name="Detalle" placeholder="Detalle" required></textarea>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editK_Ing">K. Ing</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editK_Ing" name="K_Ing" type="number" required/>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editK_Sal">K. Sal</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editK_Sal" name="K_Sal" type="number" required/>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2" for="editK_Ocup">K. Ocup</label>
                            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="editK_Ocup" name="K_Ocup" type="number" required/>
                        </div>
                    </div>
                    <div class="flex justify-end pt-2">
                        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300" type="submit">Guardar</button>
                        <button class="modal-close px-4 py-2 rounded bg-gray-500 text-white ml-2 hover:bg-gray-700 transition duration-300" type="button" onclick="closeModal('editModal')">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<!-- Delete Modal -->
<div class="modal fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0 pointer-events-none" id="deleteModal">
    <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
    <div class="modal-container bg-white w-11/12 md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto">
        <div class="modal-content py-4 text-left px-6">
            <!-- Title -->
            <div class="flex justify-between items-center pb-3 border-b border-gray-200">
                <p class="text-2xl font-bold text-gray-800"><i class="fas fa-trash mr-2 text-red-500"></i> Eliminar Registro</p>
                <div class="modal-close cursor-pointer z-50" onclick="closeModal('deleteModal')">
                    <svg class="fill-current text-black" height="18" viewbox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.53 3.47a.75.75 0 00-1.06 0L9 7.94 4.53 3.47a.75.75 0 10-1.06 1.06L7.94 9l-4.47 4.47a.75.75 0 101.06 1.06L9 10.06l4.47 4.47a.75.75 0 101.06-1.06L10.06 9l4.47-4.47a.75.75 0 000-1.06z"></path>
                    </svg>
                </div>
            </div>
            <!-- Body -->
            <div class="my-5">
                <p class="text-gray-700">¿Está seguro de que desea eliminar este registro?</p>
                <form id="deleteForm" onsubmit="handleFormSubmit(event, 'deleteForm', 'delete.php')" method="POST">
                    <input type="hidden" name="action" value="delete">
                    <input type="hidden" id="deleteId" name="id">
                    <div class="flex justify-end pt-2">
                        <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300" type="submit">Eliminar</button>
                        <button class="modal-close px-4 py-2 rounded bg-gray-500 text-white ml-2 hover:bg-gray-700 transition duration-300" type="button" onclick="closeModal('deleteModal')">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<!-- View Modal -->
<div class="modal fixed w-full h-full top-0 left-0 flex items-center justify-center opacity-0 pointer-events-none" id="viewModal">
    <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
    <div class="modal-container bg-white w-11/12 md:max-w-4xl mx-auto rounded shadow-lg z-50 overflow-y-auto">
        <div class="modal-content py-4 text-left px-6">
            <!-- Title -->
            <div class="flex justify-between items-center pb-3 border-b border-gray-200">
                <p class="text-2xl font-bold text-gray-800"><i class="fas fa-eye mr-2 text-blue-500"></i> Ver Registro</p>
                <div class="modal-close cursor-pointer z-50" onclick="closeModal('viewModal')">
                    <svg class="fill-current text-black" height="18" viewbox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.53 3.47a.75.75 0 00-1.06 0L9 7.94 4.53 3.47a.75.75 0 10-1.06 1.06L7.94 9l-4.47 4.47a.75.75 0 101.06 1.06L9 10.06l4.47 4.47a.75.75 0 101.06-1.06L10.06 9l4.47-4.47a.75.75 0 000-1.06z"></path>
                    </svg>
                </div>
            </div>
            <!-- Body -->
            <div class="my-5">
                <div id="viewDetails">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="viewChofer">Chofer:</label>
                    <select id="viewChofer" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4">
                        <!-- Options will be populated dynamically -->
                    </select>
                    <div id="recordDetails">
                        <!-- Record details will be populated dynamically -->
                    </div>
                </div>
            </div>
            <!-- Footer -->
            <div class="flex justify-end pt-2">
                <button class="modal-close px-4 py-2 rounded bg-gray-500 text-white ml-2 hover:bg-gray-700 transition duration-300" type="button" onclick="closeModal('viewModal')">Cerrar</button>
            </div>
        </div>
    </div>
</div>
<div id="message" class="fixed top-4 right-4 z-50"></div>
<script src="scripts.js"></script>
</body>
</html>
