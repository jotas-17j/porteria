<?php
include '../../conexion/conectado.php';

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $chofer = $_POST['Chofer'];
    $cod1 = $_POST['cod1'];
    $patente = $_POST['Patente'];
    $f_salida = $_POST['F_Salida'];
    $f_ingreso = $_POST['F_Ingreso'];
    $h_sal = $_POST['H_Sal'];
    $h_ing = $_POST['H_ing'];
    $t_ocupado = $_POST['T_Ocupado'];
    $cod2 = $_POST['Cod2'];
    $lugar = $_POST['Lugar'];
    $detalle = $_POST['Detalle'];
    $k_ing = $_POST['K_Ing'];
    $k_sal = $_POST['K_Sal'];
    $k_ocup = $_POST['K_Ocup'];

    $sql = "INSERT INTO data_chofer (Chofer, cod1, Patente, F_Salida, F_Ingreso, H_Sal, H_ing, T_Ocupado, Cod2, Lugar, Detalle, K_Ing, K_Sal, K_Ocup) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sisssssssisiii', $chofer, $cod1, $patente, $f_salida, $f_ingreso, $h_sal, $h_ing, $t_ocupado, $cod2, $lugar, $detalle, $k_ing, $k_sal, $k_ocup);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Registro creado exitosamente';
    } else {
        $response['message'] = 'Error al crear el registro';
    }

    $stmt->close();
}

$conn->close();
echo json_encode($response); 