console.log(import.meta.env)
export const HTTP_URL = import.meta.env.VITE_APP_HTTP_URL || "http://localhost:3000";
export const WS_URL = import.meta.env.VITE_APP_WS_URL || "ws://localhost:3001";