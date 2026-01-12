<?php
class Auth {
    public static function require(): int {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Response::error("Token manquant", 401);
        }
        
        $token = $matches[1];
        global $pdo;
        
        $stmt = $pdo->prepare("SELECT id FROM users WHERE token = ?");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        if (!$user) {
             Response::error("Token invalide ou expiré", 401);
        }
        
        return (int)$user['id'];
    }
}