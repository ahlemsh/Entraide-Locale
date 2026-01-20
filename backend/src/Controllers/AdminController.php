<?php
class AdminController {
    public static function reports(PDO $pdo): void {
        Admin::require($pdo);
        Response::json(['ok'=>true, 'reports'=>[]]);
    }
    public static function makeAdmin(PDO $pdo, Request $r): void {
        Admin::require($pdo);
        Response::json(['ok'=>true]);
    }
}
