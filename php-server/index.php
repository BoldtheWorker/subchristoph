<?php
// index.php
require_once 'config.php';
require_once 'routes/auth.php';
require_once 'routes/bookings.php';
require_once 'routes/blog.php';
require_once 'routes/portfolio.php';
require_once 'routes/services.php';
require_once 'routes/faq.php';
require_once 'routes/testimonials.php';
require_once 'routes/site-content.php';
require_once 'routes/upload.php';
require_once 'routes/carousel.php';

$path = $_SERVER['REQUEST_URI'] ?? '/';
$api_prefix = '/api';
$request_path = str_replace($api_prefix, '', parse_url($path, PHP_URL_PATH));
$method = $_SERVER['REQUEST_METHOD'];

// Helper to check for auth on admin routes
function adminOnly() {
    return checkAuth();
}

// ─── Routing Table ───────────────────────────────────────────────────────────

// Repair Admin (Temporary)
if (isset($_GET['repair']) || strpos($_SERVER['REQUEST_URI'], 'repair-admin') !== false) {
    header('Content-Type: text/plain');
    echo "DEBUG: Path=" . $_SERVER['REQUEST_URI'] . "\n";
    require_once 'routes/auth.php';
    $email = 'admin@christophmedia.com';
    $password = 'admin123';
    $hash = password_hash($password, PASSWORD_BCRYPT);
    try {
        $stmt = $pdo->prepare("REPLACE INTO admins (id, email, password) VALUES (?, ?, ?)");
        $stmt->execute(['admin-root', $email, $hash]);
        echo "SUCCESS: Admin $email set to admin123\n";
        exit();
    } catch (Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
        exit();
    }
}

// Health
if ($request_path === '/health') sendResponse(['status' => 'ok']);

// Auth
if ($request_path === '/auth/login' && $method === 'POST') handleLogin();
if ($request_path === '/auth/me' && $method === 'GET') {
    $user = adminOnly();
    sendResponse(['user' => $user]);
}

// Bookings
if ($request_path === '/bookings' && $method === 'POST') handleCreateBooking();
if ($request_path === '/bookings' && $method === 'GET') {
    adminOnly();
    handleGetBookings();
}

// Paystack
if ($request_path === '/paystack/initialize' && $method === 'POST') handlePaystackInit();
if ($request_path === '/paystack/verify' && $method === 'POST') handlePaystackVerify();

// Blog
if ($request_path === '/blog' && $method === 'GET') handleGetBlog();
if ($request_path === '/blog' && $method === 'POST') {
    adminOnly();
    handleCreatePost();
}
if (preg_match('#^/blog/([^/]+)$#', $request_path, $matches)) {
    $val = $matches[1];
    if ($method === 'GET') handleGetPostBySlug($val);
    if ($method === 'PATCH') {
        adminOnly();
        // Update logic not fully ported yet for blog patch, but handles delete
    }
    if ($method === 'DELETE') {
        adminOnly();
        handleDeletePost($val);
    }
}

// Portfolio
if ($request_path === '/portfolio' && $method === 'GET') handleGetPortfolio();
if ($request_path === '/portfolio' && $method === 'POST') {
    adminOnly();
    // Ported logic for get only so far, can expand
}

// FAQ
if ($request_path === '/faq' && $method === 'GET') handleGetFaq();
if ($request_path === '/faq' && $method === 'POST') {
    adminOnly();
    handleCreateFaq();
}
if (preg_match('#^/faq/([^/]+)$#', $request_path, $matches)) {
    if ($method === 'DELETE') {
        adminOnly();
        handleDeleteFaq($matches[1]);
    }
}

// Testimonials
if ($request_path === '/testimonials' && $method === 'GET') handleGetTestimonials();
if ($request_path === '/testimonials' && $method === 'POST') {
    adminOnly();
    handleCreateTestimonial();
}
if (preg_match('#^/testimonials/([^/]+)$#', $request_path, $matches)) {
    if ($method === 'DELETE') {
        adminOnly();
        handleDeleteTestimonial($matches[1]);
    }
}

// Services
if ($request_path === '/services' && $method === 'GET') handleGetServices();

// Site Content
if ($request_path === '/site-content' && $method === 'GET') handleGetSiteContent();
if ($request_path === '/site-content' && $method === 'PATCH') {
    adminOnly();
    handleUpdateSiteContent();
}

// Upload
if ($request_path === '/upload' && $method === 'POST') {
    adminOnly();
    handleUpload();
}

// Carousel
if ($request_path === '/carousel' && $method === 'GET') handleGetCarousel();
if ($request_path === '/carousel/all' && $method === 'GET') {
    adminOnly();
    handleGetCarouselAll();
}
if ($request_path === '/carousel' && $method === 'POST') {
    adminOnly();
    handleCreateCarouselSlide();
}
if (preg_match('#^/carousel/([^/]+)$#', $request_path, $matches)) {
    if ($method === 'PATCH') {
        adminOnly();
        handleUpdateCarouselSlide($matches[1]);
    }
    if ($method === 'DELETE') {
        adminOnly();
        handleDeleteCarouselSlide($matches[1]);
    }
}


// 404 Fallback
sendResponse(['error' => 'Not found', 'path' => $request_path], 404);
?>
