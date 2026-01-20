<?php
class NotificationController {
    public static function list(PDO $pdo): void {
        Response::json(['ok'=>true, 'notifications'=>[]]);
    }
    public static function markRead(PDO $pdo, Request $r): void {
        Response::json(['ok'=>true]);
    }
}
