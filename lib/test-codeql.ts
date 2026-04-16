// Archivo de test para CodeQL - hardcoded secrets detection

const API_KEY = "sk_live_1234567890abcdef";

const PASSWORD = "my_super_secret_password_123";

const DATABASE_URL = "postgres://admin:secretpassword123@localhost:5432/mydb";

function getSecret() {
  return "token_abc123xyz_secret";
}

export function authenticate() {
  const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
  return token;
}