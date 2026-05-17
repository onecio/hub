// Executado antes de cada suite de testes (vitest setupFiles)
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.PORT = '3001';
process.env.HOST = '127.0.0.1';
process.env.LOG_LEVEL = 'silent';
process.env.LOG_PRETTY = 'false';
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-chars-long!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-chars!!';
process.env.SESSION_SECRET = 'test-session-secret-minimum-32-chars!';
process.env.CSRF_SECRET = 'test-csrf-secret-minimum-32-chars!!';
process.env.ENCRYPTION_KEY = 'test-encryption-key-minimum-32-chars!';
process.env.DOMAIN = 'localhost';
process.env.ADMIN_EMAIL = 'test@example.com';
