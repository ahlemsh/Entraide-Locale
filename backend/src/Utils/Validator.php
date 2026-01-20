<?php
class Validator {
    public static function requireFields(array $data, array $fields): void {
        foreach ($fields as $field) {
            if (empty($data[$field])) {
                Response::error("Champ manquant: $field", 422);
            }
        }
    }

    public static function maxLen(string $str, int $len, string $fieldName): string {
        if (mb_strlen($str) > $len) {
            Response::error("$fieldName trop long (max $len caractères)", 422);
        }
        return $str;
    }
    
    public static function email(string $email): string {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error("Email invalide", 422);
        }
        return $email;
    }
}
