const TOKEN_KEY = "student-session";

function getStudentToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

function saveStudentToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    // The login page reports this when it can't read the token back.
  }
}

function clearStudentToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    // Nothing was stored, so there's nothing to clear.
  }
}

async function callBackend(params) {
  const response = await fetch(BACKEND_URL, { method: "POST", body: new URLSearchParams(params) });
  return response.json();
}
