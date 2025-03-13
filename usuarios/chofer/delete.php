<?php
include '../../conexion/conectado.php';

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;

    if ($id) {
        $sql = "DELETE FROM data_chofer WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                $response['success'] = true;
                $response['message'] = 'Registro eliminado exitosamente';
            } else {
                $response['message'] = 'No se encontró el registro para eliminar';
            }
        } else {
            $response['message'] = 'Error al ejecutar la consulta de eliminación';
        }

        $stmt->close();
    } else {
        $response['message'] = 'ID no proporcionado o inválido';
    }
}

$conn->close();
echo json_encode($response); 