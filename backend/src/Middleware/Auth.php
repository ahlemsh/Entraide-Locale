<?php
class Auth {
  public static function require(): int {
    $uid = Security::userId();
    if (!$uid) Response::error("Non authentifié", 401);
    return $uid;
  }
}
