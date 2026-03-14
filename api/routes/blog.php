<?php
// routes/blog.php
require_once __DIR__ . '/../config.php';

function handleGetBlog() {
    global $pdo;
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $isAdmin = !empty($authHeader) && strpos($authHeader, 'Bearer ') === 0;

    try {
        if ($isAdmin) {
            $stmt = $pdo->query("SELECT * FROM blog_posts ORDER BY created_at DESC");
        } else {
            $stmt = $pdo->query("SELECT * FROM blog_posts WHERE is_published = 1 ORDER BY published_at DESC");
        }
        $posts = $stmt->fetchAll();
        foreach ($posts as &$post) {
            $post['is_published'] = (bool)$post['is_published'];
        }
        sendResponse($posts);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handleGetPostBySlug($slug) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE slug = ?");
        $stmt->execute([$slug]);
        $post = $stmt->fetch();
        if (!$post) sendResponse(['error' => 'Not found'], 404);
        
        $post['is_published'] = (bool)$post['is_published'];
        sendResponse($post);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handleCreatePost() {
    global $pdo;
    $input = getJsonInput();
    if (empty($input['title']) || empty($input['slug'])) {
        sendResponse(['error' => 'title and slug required'], 400);
    }

    $id = bin2hex(random_bytes(16));
    $published = !empty($input['is_published']) ? 1 : 0;
    $published_at = $published ? date('Y-m-d H:i:s') : null;

    try {
        $stmt = $pdo->prepare("
            INSERT INTO blog_posts (id, title, slug, content, excerpt, category, cover_image_url, is_published, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            $input['title'],
            $input['slug'],
            $input['content'] ?? "",
            $input['excerpt'] ?? null,
            $input['category'] ?? null,
            $input['cover_image_url'] ?? null,
            $published,
            $published_at
        ]);

        $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE id = ?");
        $stmt->execute([$id]);
        $post = $stmt->fetch();
        $post['is_published'] = (bool)$post['is_published'];
        sendResponse($post, 201);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function handleDeletePost($id) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("DELETE FROM blog_posts WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) sendResponse(['error' => 'Not found'], 404);
        sendResponse(['success' => true]);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}
?>
