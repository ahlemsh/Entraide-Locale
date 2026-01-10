<?php
class AuthController {
  public static function register(PDO $pdo, Request $r): void {
    Security::startSession();
    Validator::requireFields($r->body, ['full_name','email','password']);
    $full = Validator::maxLen((string)$r->body['full_name'], 120, 'Nom complet');
    $email = mb_strtolower(trim((string)$r->body['email']));
    Validator::email($email);
    $pass = (string)$r->body['password'];
    if (mb_strlen($pass) < 6) Response::error("Mot de passe trop court (min 6)", 422);

    $quartier = isset($r->body['quartier']) ? Validator::maxLen((string)$r->body['quartier'], 120, 'Quartier') : null;

    $hash = password_hash($pass, PASSWORD_BCRYPT);
    try {
      $st = $pdo->prepare("INSERT INTO users(full_name,email,password_hash,role,quartier) VALUES(?,?,?,?,?)");
      $st->execute([$full,$email,$hash,'user',$quartier]);
      $_SESSION['user_id'] = (int)$pdo->lastInsertId();
      Response::json(['ok'=>true], 201);
    } catch (Throwable $e) {
      if (str_contains($e->getMessage(), 'Duplicate')) Response::error("Email déjà utilisé", 409);
      Response::error("Erreur register: ".$e->getMessage(), 500);
    }
  }

  public static function login(PDO $pdo, Request $r): void {
    Security::startSession();
    Validator::requireFields($r->body, ['email','password']);
    $email = mb_strtolower(trim((string)$r->body['email']));
    $pass = (string)$r->body['password'];

    $st = $pdo->prepare("SELECT id, full_name, email, role, quartier, password_hash FROM users WHERE email=?");
    $st->execute([$email]);
    $u = $st->fetch();
    if (!$u || !password_verify($pass, $u['password_hash'])) {
      Response::error("Identifiants invalides", 401);
    }

    $_SESSION['user_id'] = (int)$u['id'];
    Response::json(['ok'=>true, 'user'=>[
      'id'=>(int)$u['id'],
      'full_name'=>$u['full_name'],
      'email'=>$u['email'],
      'role'=>$u['role'],
      'quartier'=>$u['quartier']
    ]]);
  }

  public static function me(PDO $pdo): void {
    Security::startSession();
    $uid = Security::userId();
    if (!$uid) Response::json(['ok'=>true,'user'=>null]);

    $st = $pdo->prepare("SELECT id, full_name, email, role, quartier, phone, bio, created_at FROM users WHERE id=?");
    $st->execute([$uid]);
    $u = $st->fetch();
    Response::json(['ok'=>true, 'user'=>$u ?: null]);
  }

  public static function logout(): void {
    Security::startSession();
    session_unset();
    session_destroy();
    Response::json(['ok'=>true]);
  }
}
