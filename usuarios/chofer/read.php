<?php
include '../../conexion/conectado.php';

$response = ['success' => false, 'data' => [], 'message' => ''];

$sql = "SELECT * FROM data_chofer ORDER BY id DESC";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $response['success'] = true;
    while ($row = $result->fetch_assoc()) {
        $response['data'][] = $row;
    }
} else {
    $response['message'] = 'No se encontraron registros';
}

$conn->close();
echo json_encode($response); 