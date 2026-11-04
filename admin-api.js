const ADMIN_TOKEN_KEY = "admin-session";

function getAdminToken() {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

function saveAdminToken(token) {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch (error) {
    // The login form reports this when it can't read the token back.
  }
}

function clearAdminToken() {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch (error) {
    // Nothing was stored, so there's nothing to clear.
  }
}
