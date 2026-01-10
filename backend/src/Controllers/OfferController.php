<?php
class OfferController {

  public static function list(PDO $pdo, Request $r): void {
    $stmt = $pdo->query("
      SELECT o.*, u.full_name AS auteur, c.name AS categorie
      FROM offers o
      JOIN users u ON u.id=o.user_id
      JOIN categories c ON c.id=o.category_id
      ORDER BY o.created_at DESC
      LIMIT 50
    ");
    Response::json(['ok'=>true,'offers'=>$stmt->fetchAll()]);
  }

  public static function show(PDO $pdo, Request $r): void {
    $id = (int)($r->query['id'] ?? 0);
    if ($id<=0) Response::error("ID invalide",422);

    $stmt = $pdo->prepare("
      SELECT o.*, u.full_name AS auteur, u.email, c.name AS categorie
      FROM offers o
      JOIN users u ON u.id=o.user_id
      JOIN categories c ON c.id=o.category_id
      WHERE o.id=?
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) Response::error("Offre introuvable",404);

    Response::json(['ok'=>true,'offer'=>$row]);
  }

  public static function create(PDO $pdo, Request $r): void {
    $uid = Auth::require();
    Validator::requireFields($r->body, [
      'title','description','quartier','category_id'
    ]);

    $stmt = $pdo->prepare("
      INSERT INTO offers (user_id,category_id,title,quartier,description)
      VALUES (?,?,?,?,?)
    ");
    $stmt->execute([
      $uid,
      (int)$r->body['category_id'],
      Validator::maxLen($r->body['title'],160,'Titre'),
      Validator::maxLen($r->body['quartier'],120,'Quartier'),
      trim($r->body['description'])
    ]);

    Response::json(['ok'=>true,'id'=>$pdo->lastInsertId()],201);
  }

  public static function updateStatus(PDO $pdo, Request $r): void {
    $uid = Auth::require();
    Validator::requireFields($r->body,['id','status']);

    $stmt = $pdo->prepare("SELECT user_id FROM offers WHERE id=?");
    $stmt->execute([(int)$r->body['id']]);
    $row = $stmt->fetch();
    if (!$row) Response::error("Offre introuvable",404);

    if ((int)$row['user_id'] !== $uid) {
      Admin::require($pdo);
    }

    $pdo->prepare("
      UPDATE offers SET status=?, updated_at=NOW() WHERE id=?
    ")->execute([$r->body['status'],(int)$r->body['id']]);

    Response::json(['ok'=>true]);
  }

  public static function delete(PDO $pdo, Request $r): void {
    $uid = Auth::require();
    $id = (int)($r->query['id'] ?? 0);
    if ($id<=0) Response::error("ID invalide",422);

    $stmt = $pdo->prepare("SELECT user_id FROM offers WHERE id=?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) Response::error("Offre introuvable",404);

    if ((int)$row['user_id'] !== $uid) {
      Admin::require($pdo);
    }

    $pdo->prepare("DELETE FROM offers WHERE id=?")->execute([$id]);
    Response::json(['ok'=>true]);
  }
}
