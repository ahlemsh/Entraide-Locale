<?php
class RequestController {
    public static function categories(PDO $pdo): void {
        // Liste statique des catégories pour simplifier (ou à récupérer en BDD si la table existe)
        $categories = [
            ['id' => 1, 'name' => 'Courses'],
            ['id' => 2, 'name' => 'Déménagement'],
            ['id' => 3, 'name' => 'Garde'],
            ['id' => 4, 'name' => 'Informatique'],
            ['id' => 5, 'name' => 'Ménage'],
            ['id' => 6, 'name' => 'Réparation'],
            ['id' => 7, 'name' => 'Autre']
        ];
        Response::json(['ok' => true, 'categories' => $categories]);
    }

    public static function list(PDO $pdo, Request $r): void {
        $page = max(1, (int)($r->query['page'] ?? 1));
        $limit = 10;
        $offset = ($page - 1) * $limit;
        
        $where = [];
        $params = [];
        
        if (!empty($r->query['user_id'])) {
            $where[] = "r.user_id = ?";
            $params[] = $r->query['user_id'];
        }
        if (!empty($r->query['category_id'])) {
            $where[] = "r.category_id = ?";
            $params[] = $r->query['category_id'];
        }
        if (!empty($r->query['quartier'])) {
            $where[] = "r.quartier = ?";
            $params[] = $r->query['quartier'];
        }
        if (!empty($r->query['status'])) {
            $where[] = "r.status = ?";
            $params[] = $r->query['status'];
        }
        if (!empty($r->query['q'])) {
            $where[] = "(r.title LIKE ? OR r.description LIKE ?)";
            $term = "%" . $r->query['q'] . "%";
            $params[] = $term;
            $params[] = $term;
        }

        $sqlWhere = $where ? "WHERE " . implode(" AND ", $where) : "";
        
        $stmt = $pdo->prepare("
            SELECT r.*, u.full_name as auteur 
            FROM requests r 
            JOIN users u ON r.user_id = u.id 
            $sqlWhere 
            ORDER BY r.created_at DESC 
            LIMIT $limit OFFSET $offset
        ");
        $stmt->execute($params);
        $requests = $stmt->fetchAll();

        // Mapping ID catégorie vers Nom pour l'affichage frontend
        $categoriesMap = [
            1 => 'Courses', 2 => 'Déménagement', 3 => 'Garde', 4 => 'Informatique', 
            5 => 'Ménage', 6 => 'Réparation', 7 => 'Autre'
        ];
        
        foreach ($requests as &$req) {
            $cid = $req['category_id'] ?? 0;
            $req['category'] = $categoriesMap[$cid] ?? 'Autre';
        }

        Response::json(['ok' => true, 'requests' => $requests]);
    }

    public static function show(PDO $pdo, Request $r): void {
        $id = (int)($r->query['id'] ?? 0);
        $stmt = $pdo->prepare("
            SELECT r.*, u.full_name as auteur 
            FROM requests r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.id = ?
        ");
        $stmt->execute([$id]);
        $request = $stmt->fetch();
        
        if (!$request) Response::error("Demande introuvable", 404);

        $categoriesMap = [
            1 => 'Courses', 2 => 'Déménagement', 3 => 'Garde', 4 => 'Informatique', 
            5 => 'Ménage', 6 => 'Réparation', 7 => 'Autre'
        ];
        $cid = $request['category_id'] ?? 0;
        $request['categorie'] = $categoriesMap[$cid] ?? 'Autre';

        Response::json(['ok' => true, 'request' => $request]);
    }

    public static function create(PDO $pdo, Request $r): void {
        $uid = Auth::require();
        Validator::requireFields($r->body, ['title', 'description', 'quartier', 'category_id']);
        
        $stmt = $pdo->prepare("INSERT INTO requests (user_id, category_id, title, description, quartier, status) VALUES (?, ?, ?, ?, ?, 'pending')");
        $stmt->execute([
            $uid, 
            (int)$r->body['category_id'],
            Security::sanitize($r->body['title']),
            Security::sanitize($r->body['description']),
            Security::sanitize($r->body['quartier'])
        ]);
        
        Response::json(['ok' => true, 'id' => $pdo->lastInsertId()], 201);
    }

    public static function updateStatus(PDO $pdo, Request $r): void {
        $uid = Auth::require();
        $id = (int)($r->body['id'] ?? 0);
        $status = $r->body['status'] ?? '';
        
        if (!in_array($status, ['open', 'closed', 'pending'])) {
            Response::error("Statut invalide", 400);
        }

        // Vérification des droits (Admin pour valider, Owner/Admin pour fermer)
        $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$uid]);
        $user = $stmt->fetch();
        $isAdmin = ($user && $user['role'] === 'admin');

        if ($status === 'open' && !$isAdmin) Response::error("Action réservée aux administrateurs", 403);

        $upd = $pdo->prepare("UPDATE requests SET status = ? WHERE id = ?");
        $upd->execute([$status, $id]);
        
        Response::json(['ok' => true]);
    }

    public static function delete(PDO $pdo, Request $r): void {
        $uid = Auth::require();
        $id = (int)($r->query['id'] ?? 0);
        
        $stmt = $pdo->prepare("SELECT user_id FROM requests WHERE id = ?");
        $stmt->execute([$id]);
        $req = $stmt->fetch();
        
        if (!$req) Response::error("Demande introuvable", 404);
        if ($req['user_id'] !== $uid) Admin::require($pdo); // Admin ou propriétaire
        
        $pdo->prepare("DELETE FROM requests WHERE id = ?")->execute([$id]);
        Response::json(['ok' => true]);
    }
}