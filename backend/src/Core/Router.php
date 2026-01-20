<?php
class Router {
    private array $routes = [];

    public function add(string $method, string $path, callable $handler): void {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }

    public function dispatch(Request $req): void {
        foreach ($this->routes as $route) {
            if ($route['method'] === $req->method && $route['path'] === $req->path) {
                call_user_func($route['handler'], $req);
                return;
            }
        }
        Response::error("Route introuvable: " . $req->method . " " . $req->path, 404);
    }
}
