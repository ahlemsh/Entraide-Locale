<?php
class Request {
    public array $body;
    public array $query;
    public string $method;
    public string $path;

    public function __construct() {
        $this->body = json_decode(file_get_contents('php://input'), true) ?? [];
        $this->query = $_GET;
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    }
}
