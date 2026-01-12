<?php

class Security {

  /* Nettoyage basique des entrées */
  public static function clean(string $value): string {
    return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
  }

  /* Hash du mot de passe */
  public static function hashPassword(string $password): string {
    return password_hash($password, PASSWORD_BCRYPT);
  }

  /* Vérification du mot de passe */
  public static function verifyPassword(string $password, string $hash): bool {
    return password_verify($password, $hash);
  }

  /* Générer un token sécurisé */
  public static function generateToken(int $length = 32): string {
    return bin2hex(random_bytes($length));
  }

  /* Protection simple contre accès non autorisé */
  public static function requirePost(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
      Response::error("Méthode non autorisée", 405);
    }
  }
}
