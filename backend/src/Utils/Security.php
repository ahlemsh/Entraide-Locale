<?php
class Security {
    public static function hashPassword(string $password): string {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    public static function verifyPassword(string $password, string $hash): bool {
        return password_verify($password, $hash);
    }
    
    public static function sanitize(string $data): string {
        return htmlspecialchars(strip_tags(trim($data)));
    }
}