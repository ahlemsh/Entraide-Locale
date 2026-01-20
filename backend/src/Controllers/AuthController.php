<?php
class AuthController {
    public static function register(PDO $pdo, Request $r): void {
        Validator::requireFields($r->body, ['full_name', 'email', 'password', 'quartier']);
        
        $email = Validator::email($r->body['email']);
        
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error("Cet email est déjà utilisé", 409);
        }
        
        $hash = Security::hashPassword($r->body['password']);
        
        $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password, quartier, role) VALUES (?, ?, ?, ?, 'member')");
        $stmt->execute([
            Security::sanitize($r->body['full_name']),
            $email,
            $hash,
            Security::sanitize($r->body['quartier'])
        ]);
        
        Response::json(['ok' => true, 'message' => 'Inscription réussie'], 201);
    }

    public static function login(PDO $pdo, Request $r): void {
        Validator::requireFields($r->body, ['email', 'password']);
        
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$r->body['email']]);
        $user = $stmt->fetch();
        
        if (!$user || !Security::verifyPassword($r->body['password'], $user['password'])) {
            Response::error("Identifiants incorrects", 401);
        }
        
        $token = bin2hex(random_bytes(32));
        $upd = $pdo->prepare("UPDATE users SET token = ? WHERE id = ?");
        $upd->execute([$token, $user['id']]);
        
        Response::json([
            'ok' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'quartier' => $user['quartier']
            ]
        ]);
    }

    public static function me(PDO $pdo): void {
        $uid = Auth::require();
        $stmt = $pdo->prepare("SELECT id, full_name, email, quartier, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$uid]);
        $user = $stmt->fetch();
        Response::json(['ok' => true, 'user' => $user]);
    }

    public static function logout(): void {
        Response::json(['ok' => true]);
    }

    public static function getUser(PDO $pdo, Request $r): void {
        $id = (int)($r->query['id'] ?? 0);
        $stmt = $pdo->prepare("SELECT id, full_name, email, quartier, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        
        if (!$user) Response::error("Utilisateur introuvable", 404);

        // Récupérer les statistiques réelles
        $stmtReq = $pdo->prepare("SELECT COUNT(*) as count FROM requests WHERE user_id = ?");
        $stmtReq->execute([$id]);
        $user['requests_count'] = $stmtReq->fetch()['count'];

        $stmtOff = $pdo->prepare("SELECT COUNT(*) as count FROM offers WHERE user_id = ?");
        $stmtOff->execute([$id]);
        $user['offers_count'] = $stmtOff->fetch()['count'];

        Response::json(['ok' => true, 'user' => $user]);
    }

    public static function listUsers(PDO $pdo, Request $r): void {
        $uid = Auth::require();
        $search = trim((string)($r->query['q'] ?? ''));

        $sql = "SELECT id, full_name, quartier, role FROM users WHERE id <> :uid";
        $params = [':uid' => $uid];
        if ($search !== '') {
            $sql .= " AND full_name LIKE :q";
            $params[':q'] = "%" . $search . "%";
        }
        $sql .= " ORDER BY full_name ASC LIMIT 30";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $users = $stmt->fetchAll();

        Response::json(['ok'=>true,'users'=>$users]);
    }
}
