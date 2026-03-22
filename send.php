<?php
/**
 * send.php — Manejador del formulario de contacto
 * Portfolio: Alejandro Díaz Guerrero
 */

// ── Configuración ──────────────────────────────────────────
define('RECIPIENT_EMAIL', 'nicolayevromero@gmail.com');  // ← Cambia tu email
define('SENDER_NAME',     'Portfolio AD');
define('SITE_NAME',       'Portfolio Alejandro Díaz');

// ── Headers de seguridad ───────────────────────────────────
header('Content-Type: text/plain; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

// ── Solo POST ──────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'error:method_not_allowed';
    exit;
}

// ── Función de sanitización ────────────────────────────────
function clean(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// ── Recoger y validar campos ───────────────────────────────
$name    = clean($_POST['name']    ?? '');
$company = clean($_POST['company'] ?? '');
$email   = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$phone   = clean($_POST['phone']   ?? '');
$role    = clean($_POST['role']    ?? '');
$service = clean($_POST['service'] ?? '');
$message = clean($_POST['message'] ?? '');
$budget  = clean($_POST['budget']  ?? '');

// Validaciones obligatorias
$errors = [];
if (empty($name))    $errors[] = 'name';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if (empty($service)) $errors[] = 'service';
if (empty($message)) $errors[] = 'message';

if (!empty($errors)) {
    http_response_code(422);
    echo 'error:validation:' . implode(',', $errors);
    exit;
}

// ── Rate limit básico (sesión) ─────────────────────────────
session_start();
$now      = time();
$cooldown = 300; // 5 minutos entre envíos

if (isset($_SESSION['last_contact_send'])) {
    $elapsed = $now - $_SESSION['last_contact_send'];
    if ($elapsed < $cooldown) {
        http_response_code(429);
        echo 'error:rate_limit';
        exit;
    }
}
$_SESSION['last_contact_send'] = $now;

// ── Construcción del email ─────────────────────────────────
$subject = '[Portfolio] Nuevo contacto: ' . $name . ' — ' . $service;

$body  = "═══════════════════════════════════════\n";
$body .= "   NUEVO MENSAJE — " . SITE_NAME . "\n";
$body .= "═══════════════════════════════════════\n\n";

$body .= "DATOS DE CONTACTO\n";
$body .= "─────────────────\n";
$body .= "Nombre:    {$name}\n";
$body .= "Email:     {$email}\n";
if ($phone)   $body .= "Teléfono:  {$phone}\n";
if ($company) $body .= "Empresa:   {$company}\n";
if ($role)    $body .= "Cargo:     {$role}\n";

$body .= "\nPROYECTO\n";
$body .= "────────\n";
$body .= "Servicio:  {$service}\n";
if ($budget) $body .= "Presupuesto: {$budget} USD\n";

$body .= "\nMENSAJE\n";
$body .= "───────\n";
$body .= $message . "\n\n";

$body .= "─────────────────────────────────────\n";
$body .= "Enviado: " . date('d/m/Y H:i:s') . " UTC\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";
$body .= "═══════════════════════════════════════\n";

// ── Headers del email ──────────────────────────────────────
$headers  = "From: " . SENDER_NAME . " <noreply@diazguerrero.co>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

// ── Envío ──────────────────────────────────────────────────
$sent = mail(RECIPIENT_EMAIL, $subject, $body, $headers);

if ($sent) {
    // Email de confirmación al remitente
    $confirmSubject = 'Recibí tu mensaje — ' . SITE_NAME;
    $confirmBody  = "Hola {$name},\n\n";
    $confirmBody .= "Gracias por contactarme. Recibí tu mensaje y te responderé\n";
    $confirmBody .= "en las próximas 24 horas.\n\n";
    $confirmBody .= "─────────────────────────────────────\n";
    $confirmBody .= "Resumen de tu solicitud:\n";
    $confirmBody .= "• Servicio: {$service}\n";
    if ($budget) $confirmBody .= "• Presupuesto: {$budget} USD\n";
    $confirmBody .= "─────────────────────────────────────\n\n";
    $confirmBody .= "Alejandro Díaz Guerrero\n";
    $confirmBody .= "Senior Digital Designer | LatAm\n";
    $confirmBody .= "alejandro@diazguerrero.co\n";
    $confirmBody .= "linkedin.com/in/alejandrodiaz\n";

    $confirmHeaders  = "From: Alejandro Díaz <alejandro@diazguerrero.co>\r\n";
    $confirmHeaders .= "MIME-Version: 1.0\r\n";
    $confirmHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";

    mail($email, $confirmSubject, $confirmBody, $confirmHeaders);

    echo 'success';
} else {
    http_response_code(500);
    echo 'error:mail_failed';
}
