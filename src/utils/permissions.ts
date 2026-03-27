export const getCurrentUser = () => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } };
export const hasRole = (role: string) => getCurrentUser()?.role === role;
