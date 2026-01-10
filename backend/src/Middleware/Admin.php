<?php
class Admin {
  public static function require(PDO $pdo): int {
    $uid = Auth::require();
    $st = $pdo->prepare("SELECT role FROM users WHERE id=?");
    $st->execute([$uid]);
    $u = $st->fetch();
    if (!$u) Response::error("Utilisateur introuvable", 401);
    if ($u['role'] !== 'admin') Response::error("Accès admin requis", 403);
    return $uid;
  }
}
