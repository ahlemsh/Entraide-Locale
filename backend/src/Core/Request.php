<?php
class Request {
  public string $method;
  public string $path;
  public array $query;
  public array $body;

  public function __construct() {
    $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    $this->path = parse_url($uri, PHP_URL_PATH) ?? '/';
    $this->query = $_GET ?? [];
    $raw = file_get_contents('php://input');
    $json = $raw ? json_decode($raw, true) : null;
    $this->body = is_array($json) ? $json : ($_POST ?? []);
  }
}
