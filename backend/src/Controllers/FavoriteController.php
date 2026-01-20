<?php
class FavoriteController {
    public static function list(PDO $pdo): void {
        Response::json(['ok'=>true, 'favorites'=>[]]);
    }
    public static function toggle(PDO $pdo, Request $r): void {
        Response::json(['ok'=>true]);
    }
}
