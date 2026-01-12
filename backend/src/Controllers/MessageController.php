<?php
class MessageController {

  private static function ensureTables(PDO $pdo): void {
    // Conversations: on stocke toujours (user1_id = min, user2_id = max)
    $pdo->exec("
      CREATE TABLE IF NOT EXISTS conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user1_id INT NOT NULL,
        user2_id INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_pair (user1_id, user2_id),
        CONSTRAINT fk_conv_u1 FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_conv_u2 FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $pdo->exec("
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conv_id INT NOT NULL,
        sender_id INT NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX (conv_id),
        INDEX (sender_id),
        CONSTRAINT fk_msg_conv FOREIGN KEY (conv_id) REFERENCES conversations(id) ON DELETE CASCADE,
        CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
  }

  private static function getOrCreateConversation(PDO $pdo, int $a, int $b): int {
    self::ensureTables($pdo);
    $u1 = min($a,$b); $u2 = max($a,$b);

    $st = $pdo->prepare("SELECT id FROM conversations WHERE user1_id=? AND user2_id=?");
    $st->execute([$u1,$u2]);
    $row = $st->fetch();
    if ($row) return (int)$row['id'];

    $pdo->prepare("INSERT INTO conversations(user1_id,user2_id) VALUES(?,?)")->execute([$u1,$u2]);
    return (int)$pdo->lastInsertId();
  }

  private static function requireMember(PDO $pdo, int $convId, int $uid): array {
    self::ensureTables($pdo);
    $st = $pdo->prepare("SELECT * FROM conversations WHERE id=?");
    $st->execute([$convId]);
    $c = $st->fetch();
    if (!$c) Response::error("Conversation introuvable",404);

    $ok = ((int)$c['user1_id'] === $uid) || ((int)$c['user2_id'] === $uid);
    if (!$ok) Response::error("Accès refusé",403);

    return $c;
  }

  public static function listConversations(PDO $pdo): void {
    $uid = Auth::require();
    self::ensureTables($pdo);

    $stmt = $pdo->prepare("
      SELECT c.id,
        CASE WHEN c.user1_id=? THEN c.user2_id ELSE c.user1_id END AS other_user_id,
        u.full_name AS other_name,
        (SELECT m.text FROM messages m WHERE m.conv_id=c.id ORDER BY m.created_at DESC LIMIT 1) AS last_text,
        (SELECT m.created_at FROM messages m WHERE m.conv_id=c.id ORDER BY m.created_at DESC LIMIT 1) AS last_at
      FROM conversations c
      JOIN users u ON u.id = (CASE WHEN c.user1_id=? THEN c.user2_id ELSE c.user1_id END)
      WHERE c.user1_id=? OR c.user2_id=?
      ORDER BY COALESCE(last_at, c.created_at) DESC
    ");
    $stmt->execute([$uid,$uid,$uid,$uid]);

    Response::json(['ok'=>true,'conversations'=>$stmt->fetchAll()]);
  }

  public static function listMessages(PDO $pdo, Request $r): void {
    $uid = Auth::require();
    $convId = (int)($r->query['convId'] ?? 0);
    if ($convId<=0) Response::error("convId invalide",422);

    self::requireMember($pdo, $convId, $uid);

    $stmt = $pdo->prepare("
      SELECT m.id, m.conv_id, m.sender_id, m.text, m.created_at,
             u.full_name AS sender_name
      FROM messages m
      JOIN users u ON u.id=m.sender_id
      WHERE m.conv_id=?
      ORDER BY m.created_at ASC
      LIMIT 500
    ");
    $stmt->execute([$convId]);

    Response::json(['ok'=>true,'messages'=>$stmt->fetchAll()]);
  }

  public static function send(PDO $pdo, Request $r): void {
    $uid = Auth::require();
    Validator::requireFields($r->body, ['text']);
    $text = trim((string)$r->body['text']);
    if ($text==='') Response::error("Message vide",422);

    self::ensureTables($pdo);

    $convId = (int)($r->body['convId'] ?? 0);
    $receiverId = (int)($r->body['receiverId'] ?? 0);

    if ($convId<=0) {
      if ($receiverId<=0) Response::error("receiverId requis si convId absent",422);
      $convId = self::getOrCreateConversation($pdo, $uid, $receiverId);
    }

    self::requireMember($pdo, $convId, $uid);

    $pdo->prepare("INSERT INTO messages(conv_id,sender_id,text) VALUES(?,?,?)")
        ->execute([$convId,$uid,$text]);

    Response::json(['ok'=>true,'convId'=>$convId], 201);
  }
}
