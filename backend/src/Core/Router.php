<?php
class Router {
  private array $routes = [];

  public function add(string $method, string $path, callable $handler): void {
    $this->routes[] = [$method, $path, $handler];
  }

  public function dispatch(Request $req): void {
    foreach ($this->routes as [$m, $p, $h]) {
      if ($req->method === $m && $req->path === $p) {
        $h($req);
        return;
      }
    }
    Response::error("Route introuvable", 404, ['path' => $req->path]);
  }
}
