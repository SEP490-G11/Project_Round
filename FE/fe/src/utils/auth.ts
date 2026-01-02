export function getCurrentUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn() {
    return !!localStorage.getItem("accessToken");
}

export function logoutLocal() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
}
