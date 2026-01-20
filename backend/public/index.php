<?php
$config = require __DIR__ . '/../src/Config/config.php';

header("Access-Control-Allow-Origin: {$config['cors']['origin']}");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

require __DIR__ . '/../src/Core/Response.php';
require __DIR__ . '/../src/Core/Request.php';
require __DIR__ . '/../src/Core/Router.php';
require __DIR__ . '/../src/Utils/Security.php';
require __DIR__ . '/../src/Utils/Validator.php';
require __DIR__ . '/../src/Middleware/Auth.php';
require __DIR__ . '/../src/Middleware/Admin.php';
require __DIR__ . '/../src/Config/db.php';

require __DIR__ . '/../src/Controllers/AuthController.php';
require __DIR__ . '/../src/Controllers/RequestController.php';
require __DIR__ . '/../src/Controllers/OfferController.php';
require __DIR__ . '/../src/Controllers/FavoriteController.php';
require __DIR__ . '/../src/Controllers/NotificationController.php';
require __DIR__ . '/../src/Controllers/MessageController.php';
require __DIR__ . '/../src/Controllers/AdminController.php';

$req = new Request();
$router = new Router();

// Définition dynamique du chemin de base pour éviter les erreurs de dossier
$base = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));

/* HEALTH */
$router->add('GET', $base . '/api/health', fn() =>
  Response::json(['ok'=>true, 'message'=>'API Entraide opérationnelle'])
);

/* AUTH */
$router->add('POST', $base . '/api/auth/register', fn($r) => AuthController::register($pdo, $r));
$router->add('POST', $base . '/api/auth/login', fn($r) => AuthController::login($pdo, $r));
$router->add('GET',  $base . '/api/auth/me', fn($r) => AuthController::me($pdo));
$router->add('POST', $base . '/api/auth/logout', fn($r) => AuthController::logout());
$router->add('GET',  $base . '/api/users/show', fn($r) => AuthController::getUser($pdo, $r));
$router->add('GET',  $base . '/api/users', fn($r) => AuthController::listUsers($pdo, $r));

/* CATEGORIES */
$router->add('GET', $base . '/api/categories', fn($r) => RequestController::categories($pdo));

/* REQUESTS */
$router->add('GET',  $base . '/api/requests', fn($r) => RequestController::list($pdo, $r));
$router->add('GET',  $base . '/api/requests/show', fn($r) => RequestController::show($pdo, $r));
$router->add('POST', $base . '/api/requests', fn($r) => RequestController::create($pdo, $r));
$router->add('PATCH',$base . '/api/requests/status', fn($r) => RequestController::updateStatus($pdo, $r));
$router->add('DELETE',$base . '/api/requests', fn($r) => RequestController::delete($pdo, $r));

/* OFFERS */
$router->add('GET',  $base . '/api/offers', fn($r) => OfferController::list($pdo, $r));
$router->add('GET',  $base . '/api/offers/show', fn($r) => OfferController::show($pdo, $r));
$router->add('POST', $base . '/api/offers', fn($r) => OfferController::create($pdo, $r));
$router->add('PATCH',$base . '/api/offers/status', fn($r) => OfferController::updateStatus($pdo, $r));
$router->add('DELETE',$base . '/api/offers', fn($r) => OfferController::delete($pdo, $r));

/* FAVORITES */
$router->add('GET',  $base . '/api/favorites', fn($r) => FavoriteController::list($pdo));
$router->add('POST', $base . '/api/favorites/toggle', fn($r) => FavoriteController::toggle($pdo, $r));

/* NOTIFICATIONS */
$router->add('GET',  $base . '/api/notifications', fn($r) => NotificationController::list($pdo));
$router->add('PATCH',$base . '/api/notifications/read', fn($r) => NotificationController::markRead($pdo, $r));

/* MESSAGES */
$router->add('GET',  $base . '/api/conversations', fn($r) => MessageController::listConversations($pdo));
$router->add('GET',  $base . '/api/messages', fn($r) => MessageController::listMessages($pdo, $r));
$router->add('POST', $base . '/api/messages', fn($r) => MessageController::send($pdo, $r));

/* ADMIN */
$router->add('GET', $base . '/api/admin/reports', fn($r) => AdminController::reports($pdo));
$router->add('POST',$base . '/api/admin/make-admin', fn($r) => AdminController::makeAdmin($pdo, $r));

$router->dispatch($req);
