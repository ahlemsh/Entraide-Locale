<?php
class Validator {
  public static function requireFields(array $data, array $fields): void {
    foreach ($fields as $f) {
      if (!isset($data[$f]) || trim((string)$data[$f]) === '') {
        Response::error("Champ obligatoire manquant: $f", 422);
      }
    }
  }
  public static function email(string $email): void {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      Response::error("Email invalide", 422);
    }
  }
  public static function maxLen(string $val, int $max, string $field): string {
    $val = trim($val);
    if (mb_strlen($val) > $max) {
      Response::error("$field trop long (max $max)", 422);
    }
    return $val;
  }
}
