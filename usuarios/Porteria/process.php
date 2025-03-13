<?php
include '../../conexion/conectado.php';

// Configuración general
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Sistema de logging personalizado
function logError($message, $context = []) {
    $logFile = __DIR__ . '/error.log';
    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? json_encode($context) : '';
    $logMessage = "[$timestamp] ERROR: $message $contextStr\n";
    error_log($logMessage, 3, $logFile);
}

// Clase para manejar respuestas JSON
class JsonResponse {
    public static function success($data = null, $message = 'Operación exitosa') {
        return json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }

    public static function error($message = 'Error en la operación', $code = 400) {
        http_response_code($code);
        return json_encode([
            'success' => false,
            'message' => $message,
            'code' => $code
        ]);
    }
}

// Clase para validación
class Validator {
    public static function validateRequired($data, $fields) {
        foreach ($fields as $field) {
            if (empty($data[$field])) {
                throw new Exception("El campo $field es requerido");
            }
        }
    }

    public static function validateDate($date) {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            throw new Exception('Formato de fecha inválido');
        }
        if (strtotime($date) === false) {
            throw new Exception('Fecha inválida');
        }
        if (strtotime($date) > time()) {
            throw new Exception('La fecha no puede ser futura');
        }
    }

    public static function validateTime($time) {
        if (!empty($time) && !preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $time)) {
            throw new Exception('Formato de hora inválido');
        }
    }
}

// Router simple para manejar diferentes acciones
class Router {
    private static $routes = [];

    public static function add($action, $callback) {
        self::$routes[$action] = $callback;
    }

    public static function handle($action, $data) {
        if (isset(self::$routes[$action])) {
            try {
                return call_user_func(self::$routes[$action], $data);
            } catch (Exception $e) {
                logError($e->getMessage(), ['action' => $action, 'data' => $data]);
                return JsonResponse::error($e->getMessage());
            }
        }
        return JsonResponse::error('Acción no válida', 404);
    }
}

// Clase para operaciones CRUD
class CrudOperations {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    // Crear nuevo registro
    public function create($data) {
        try {
            // Validar campos requeridos
            Validator::validateRequired($data, ['nombre', 'fecha', 'mes']);
            Validator::validateDate($data['fecha']);

            // Validar horas si están presentes
            foreach (['entrada', 'salida', 'entrada2', 'salida2', 'entrada3', 'salida3'] as $field) {
                if (!empty($data[$field])) {
                    Validator::validateTime($data[$field]);
                }
            }

            $sql = "INSERT INTO data_admi (nombre, fecha, entrada, salida, entrada2, salida2, entrada3, salida3, obs, mes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Error al preparar la consulta: " . $this->conn->error . " | SQL: " . $sql);
            }

            $stmt->bind_param("ssssssssss",
                $data['nombre'],
                $data['fecha'],
                $data['entrada'] ?? '',
                $data['salida'] ?? '',
                $data['entrada2'] ?? '',
                $data['salida2'] ?? '',
                $data['entrada3'] ?? '',
                $data['salida3'] ?? '',
                $data['obs'] ?? '',
                strtolower($data['mes'])
            );
            
            if (!$stmt->execute()) {
                throw new Exception("Error al ejecutar la consulta: " . $stmt->error . " | Datos: " . json_encode($data));
            }

            $id = $stmt->insert_id;
            $stmt->close();

            return [
                'success' => true,
                'message' => 'Registro agregado correctamente',
                'id' => $id
            ];

        } catch (Exception $e) {
            logError("Error en create", ['error' => $e->getMessage(), 'data' => $data]);
            throw $e;
        }
    }

    // Obtener registros
    public function read($id = null) {
        try {
            if ($id) {
                $sql = "SELECT * FROM data_admi WHERE id = ?";
                $stmt = $this->conn->prepare($sql);
                $stmt->bind_param("i", $id);
            } else {
                $sql = "SELECT * FROM data_admi ORDER BY id DESC";
                $stmt = $this->conn->prepare($sql);
            }

            if (!$stmt->execute()) {
                throw new Exception("Error al obtener registros");
            }

            $result = $stmt->get_result();
            $data = $result->fetch_all(MYSQLI_ASSOC);
            $stmt->close();

            return [
                'success' => true,
                'data' => $data
            ];

        } catch (Exception $e) {
            logError("Error en read", ['error' => $e->getMessage(), 'id' => $id]);
            throw $e;
        }
    }

    // Actualizar registro
    public function update($id, $data) {
        try {
            Validator::validateRequired($data, ['id', 'nombre', 'fecha', 'mes']);
            Validator::validateDate($data['fecha']);

            foreach (['entrada', 'salida', 'entrada2', 'salida2', 'entrada3', 'salida3'] as $field) {
                if (!empty($data[$field])) {
                    Validator::validateTime($data[$field]);
                }
            }

            $sql = "UPDATE data_admi SET
                    nombre=?, fecha=?, entrada=?, salida=?,
                    entrada2=?, salida2=?, entrada3=?, salida3=?,
                    obs=?, mes=?
                    WHERE id=?";

            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("ssssssssssi",
                $data['nombre'],
                $data['fecha'],
                $data['entrada'] ?? '',
                $data['salida'] ?? '',
                $data['entrada2'] ?? '',
                $data['salida2'] ?? '',
                $data['entrada3'] ?? '',
                $data['salida3'] ?? '',
                $data['obs'] ?? '',
                strtolower($data['mes']),
                $id
            );

            if (!$stmt->execute()) {
                throw new Exception("Error al actualizar registro");
            }

            if ($stmt->affected_rows === 0) {
                throw new Exception("No se encontró el registro para actualizar");
            }

            $stmt->close();
            return [
                'success' => true,
                'message' => 'Registro actualizado correctamente'
            ];

        } catch (Exception $e) {
            logError("Error en update", ['error' => $e->getMessage(), 'data' => $data]);
            throw $e;
        }
    }

    // Eliminar registro
    public function delete($id) {
        try {
            if (empty($id)) {
                throw new Exception("ID no proporcionado");
            }

            // Verificar si existe el registro
            $checkStmt = $this->conn->prepare("SELECT COUNT(*) FROM data_admi WHERE id = ?");
            $checkStmt->bind_param("i", $id);
            $checkStmt->execute();
            $count = 0;
            $checkStmt->bind_result($count);
            $checkStmt->fetch();
            $checkStmt->close();

            if ($count === 0) {
                throw new Exception("El registro no existe");
            }

            // Proceder con la eliminación
            $stmt = $this->conn->prepare("DELETE FROM data_admi WHERE id = ?");
            $stmt->bind_param("i", $id);

            if (!$stmt->execute()) {
                throw new Exception("Error al eliminar el registro");
            }

            if ($stmt->affected_rows === 0) {
                throw new Exception("No se pudo eliminar el registro");
            }

            $stmt->close();
            return [
                'success' => true,
                'message' => 'Registro eliminado correctamente'
            ];

        } catch (Exception $e) {
            logError("Error en delete", ['error' => $e->getMessage(), 'id' => $id]);
            throw $e;
        }
    }
}

// Función para agregar un registro
function addRecord($nombre, $fecha, $entrada, $salida, $entrada2, $salida2, $entrada3, $salida3, $obs, $mes) {
    global $conn;
    try {
        // Validar datos
        if (empty($nombre) || empty($fecha) || empty($mes)) {
            throw new Exception("Los campos nombre, fecha y mes son obligatorios");
        }

        // Preparar la consulta
        $sql = "INSERT INTO data_admi (nombre, fecha, entrada, salida, entrada2, salida2, entrada3, salida3, obs, mes) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }

        // Todos los campos son strings en la base de datos
        $stmt->bind_param("ssssssssss", $nombre, $fecha, $entrada, $salida, $entrada2, $salida2, $entrada3, $salida3, $obs, $mes);
        
        if (!$stmt->execute()) {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }

        return true;
    } catch (Exception $e) {
        error_log("Error en addRecord: " . $e->getMessage());
        throw $e;
    } finally {
        if (isset($stmt)) {
            $stmt->close();
        }
    }
}

// Función para editar un registro
function editRecord($id, $nombre, $fecha, $entrada, $salida, $entrada2, $salida2, $entrada3, $salida3, $obs, $mes) {
    global $conn;
    try {
        if (empty($id) || empty($nombre) || empty($fecha) || empty($mes)) {
            throw new Exception("Los campos ID, nombre, fecha y mes son obligatorios");
        }

        $sql = "UPDATE data_admi SET nombre=?, fecha=?, entrada=?, salida=?, entrada2=?, salida2=?, entrada3=?, salida3=?, obs=?, mes=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }

        $stmt->bind_param("ssssssssssi", $nombre, $fecha, $entrada, $salida, $entrada2, $salida2, $entrada3, $salida3, $obs, $mes, $id);
        
        if (!$stmt->execute()) {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }

        return true;
    } catch (Exception $e) {
        error_log("Error en editRecord: " . $e->getMessage());
        throw $e;
    } finally {
        if (isset($stmt)) {
            $stmt->close();
        }
    }
}

// Función para eliminar un registro
function deleteRecord($id) {
    global $conn;
    try {
        // Validar ID
        if (empty($id) || !is_numeric($id)) {
            throw new Exception("ID no válido");
        }

        // Verificar si el registro existe
        $checkSql = "SELECT COUNT(*) FROM data_admi WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        if (!$checkStmt) {
            throw new Exception("Error al preparar la consulta de verificación: " . $conn->error);
        }

        $checkStmt->bind_param("i", $id);
        if (!$checkStmt->execute()) {
            throw new Exception("Error al verificar el registro: " . $checkStmt->error);
        }

        $checkStmt->bind_result($count);
        $checkStmt->fetch();
        $checkStmt->close();

        if ($count === 0) {
            throw new Exception("El registro no existe");
        }

        // Proceder con la eliminación
        $sql = "DELETE FROM data_admi WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta de eliminación: " . $conn->error);
        }

        $stmt->bind_param("i", $id);
        
        if (!$stmt->execute()) {
            throw new Exception("Error al eliminar el registro: " . $stmt->error);
        }

        // Verificar que se eliminó correctamente
        if ($stmt->affected_rows === 0) {
            throw new Exception("No se pudo eliminar el registro");
        }

        return [
            'success' => true,
            'message' => 'Registro eliminado correctamente'
        ];

    } catch (Exception $e) {
        error_log("Error en deleteRecord: " . $e->getMessage());
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    } finally {
        if (isset($stmt)) {
            $stmt->close();
        }
    }
}

// Función para obtener detalles de un registro
function getRecordDetails($id) {
    global $conn;
    try {
        if (empty($id)) {
            throw new Exception("El ID es requerido");
        }

        $sql = "SELECT * FROM data_admi WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }

        $stmt->bind_param("i", $id);
        
        if (!$stmt->execute()) {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }

        $result = $stmt->get_result();
        if (!$result) {
            throw new Exception("Error al obtener el resultado");
        }

        $record = $result->fetch_assoc();
        if (!$record) {
            throw new Exception("Registro no encontrado");
        }

        return [
            'success' => true,
            'data' => $record
        ];
    } catch (Exception $e) {
        error_log("Error en getRecordDetails: " . $e->getMessage());
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    } finally {
        if (isset($stmt)) {
            $stmt->close();
        }
    }
}

// Función para obtener registros de hoy
function getTodayRecords() {
    global $conn;
    try {
        $today = date('Y-m-d');
        
        // Verificar conexión
        if ($conn->connect_error) {
            throw new Exception("Error de conexión: " . $conn->connect_error);
        }

        $sql = "SELECT * FROM data_admi WHERE fecha = ? ORDER BY id DESC";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }

        $stmt->bind_param("s", $today);
        
        if (!$stmt->execute()) {
            throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
        }

        $result = $stmt->get_result();
        if (!$result) {
            throw new Exception("Error al obtener los resultados");
        }

        $records = $result->fetch_all(MYSQLI_ASSOC);

        return [
            'success' => true,
            'data' => $records,
            'count' => count($records),
            'date' => $today
        ];
    } catch (Exception $e) {
        error_log("Error en getTodayRecords: " . $e->getMessage());
        return [
            'success' => false,
            'message' => $e->getMessage(),
            'data' => [],
            'count' => 0
        ];
    } finally {
        if (isset($stmt)) {
            $stmt->close();
        }
    }
}

// Manejar las acciones del formulario
if (isset($_POST['action'])) {
    try {
        $response = array();
        $action = $_POST['action'];

        switch ($action) {
            case 'add':
                if (addRecord(
                    $_POST['nombre'] ?? '',
                    $_POST['fecha'] ?? '',
                    $_POST['entrada'] ?? '',
                    $_POST['salida'] ?? '',
                    $_POST['entrada2'] ?? '',
                    $_POST['salida2'] ?? '',
                    $_POST['entrada3'] ?? '',
                    $_POST['salida3'] ?? '',
                    $_POST['obs'] ?? '',
                    $_POST['mes'] ?? ''
                )) {
                    $response = array(
                        "success" => true,
                        "message" => "Registro agregado correctamente"
                    );
                }
                break;

            case 'edit':
                if (editRecord(
                    $_POST['id'] ?? '',
                    $_POST['nombre'] ?? '',
                    $_POST['fecha'] ?? '',
                    $_POST['entrada'] ?? '',
                    $_POST['salida'] ?? '',
                    $_POST['entrada2'] ?? '',
                    $_POST['salida2'] ?? '',
                    $_POST['entrada3'] ?? '',
                    $_POST['salida3'] ?? '',
                    $_POST['obs'] ?? '',
                    $_POST['mes'] ?? ''
                )) {
                    $response = array(
                        "success" => true,
                        "message" => "Registro actualizado correctamente"
                    );
                }
                break;

            case 'delete':
                try {
                    if (empty($_POST['id'])) {
                        throw new Exception('ID no proporcionado');
                    }
                    
                    $deleteResult = deleteRecord($_POST['id']);
                    echo json_encode($deleteResult);
                    exit;
                    
                } catch (Exception $e) {
                    echo json_encode([
                        'success' => false,
                        'message' => $e->getMessage()
                    ]);
                    exit;
                }
                break;

            default:
                throw new Exception("Acción no válida");
        }

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(array(
            "success" => false,
            "error" => $e->getMessage(),
            "message" => "Error en la operación"
        ));
    }
    exit();
}
?>
