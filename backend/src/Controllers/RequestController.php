<?php
class RequestController {

  /* LISTE DES CATEGORIES */
  public static function categories(PDO $pdo): void {
    $rows = $pdo->query("SELECT id, name FROM categories ORDER BY name")->fetchAll();
    Response::json(['ok'=>true, 'categories'=>$rows]);
  }

  /* LISTE DES DEMANDES (avec filtres + pagination) */
  public static function list(PDO $pdo, Request $r): void {
    $page = max(1, (int)($r->query['page'] ?? 1));
    $limit = 10;
    $offset = ($page - 1) * $limit;

    $params = [];
    $where = [];

    if (!empty($r->query['status'])) {
      $where[] = "r.status = ?";
      $params[] = $r->query['status'];
    }
    if (!empty($r->query['quartier'])) {
      $where[] = "r.quartier = ?";
      $params[] = $r->query['quartier'];
    }
    if (!empty($r->query['category_id'])) {
      $where[] = "r.category_id = ?";
      $params[] = (int)$r->query['category_id'];
    }
    if (!empty($r->query['q'])) {
      $where[] = "(r.title LIKE ? OR r.description LIKE ?)";
      $params[] = "%{$r->query['q']}%";
      $params[] = "%{$r->query['q']}%";
    }

    $sqlWhere = $where ? "WHERE ".implode(" AND ", $where) : "";

    $stmt = $pdo->prepare("
      SELECT r.*, u.full_name AS auteur, c.name AS categorie
      FROM requests r
      JOIN users u ON u.id = r.user_id
      JOIN categories c ON c.id = r.category_id
      $sqlWhere
      ORDER BY r.created_at DESC
      LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);

    Response::json([
      'ok'=>true,
      'page'=>$page,
      'requests'=>$stmt->fetchAll()
    ]);
  }

  /* DETAILS D’UNE DEMANDE */
  public static function show(PDO $pdo, Request $r): void {
    $id = (int)($r->query['id'] ?? 0);
    if ($id <= 0) Response::error("ID invalide", 422);

    $stmt = $pdo->prepare("
      SELECT r.*, u.full_name AS auteur, u.email, c.name AS categorie
      FROM requests r
      JOIN users u ON u.id = r.user_id
      JOIN categories c ON c.id = r.category_id
      WHERE r.id=?
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    if (!$row) Response::error("Demande introuvable", 404);
    Response::json(['ok'=>true, 'request'=>$row]);
  }

  /* CREER UNE DEMANDE */
  public static function create(PDO $pdo, Request $r): void {
    $uid = Auth::require();

    Validator::requireFields($r->body, [
      'title','description','quartier','category_id'
    ]);

    $stmt = $pdo->prepare("
      INSERT INTO requests (user_id, category_id, title, quartier, description)
      VALUES (?,?,?,?,?)
    ");
    $stmt->execute([
      $uid,
      (int)$r->body['category_id'],
      Validator::maxLen($r->body['title'],160,'Titre'),
      Validator::maxLen($r->body['quartier'],120,'Quartier'),
      trim($r->body['description'])
    ]);

    Response::json(['ok'=>true, 'id'=>$pdo->lastInsertId()], 201);
  }

  /* CHANGER LE STATUT */
  public static function updateStatus(PDO $pdo, Request $r): void {
    $uid = Auth::require();
    Validator::requireFields($r->body, ['id','status']);

    $allowed = ['active','pending','completed','cancelled'];
    if (!in_array($r->body['status'],$allowed,true)) {
      Response::error("Statut invalide",422);
    }

    $stmt = $pdo->prepare("SELECT user_id FROM requests WHERE id=?");
    $stmt->execute([(int)$r->body['id']]);
    $row = $stmt->fetch();
    if (!$row) Response::error("Demande introuvable",404);

    if ((int)$row['user_id'] !== $uid) {
      Admin::require($pdo);
    }

    $upd = $pdo->prepare("UPDATE requests SET status=?, updated_at=NOW() WHERE id=?");
    $upd->execute([$r->body['status'], (int)$r->body['id']]);

    Response::json(['ok'=>true]);
  }

  /* SUPPRIMER */
  public static function delete(PDO $pdo, Request $r): void {
    $uid = Auth::require();
    $id = (int)($r->query['id'] ?? 0);
    if ($id <= 0) Response::error("ID invalide",422);

    $stmt = $pdo->prepare("SELECT user_id FROM requests WHERE id=?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) Response::error("Demande introuvable",404);

    if ((int)$row['user_id'] !== $uid) {
      Admin::require($pdo);
    }

    $pdo->prepare("DELETE FROM requests WHERE id=?")->execute([$id]);
    Response::json(['ok'=>true]);
  }
}
