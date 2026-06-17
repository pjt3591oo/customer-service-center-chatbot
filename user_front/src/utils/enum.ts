export const ChatFrom = { 
    USER: "USER",
    ADMIN: "ADMIN",
    SYSTEM: "SYSTEM",
    BOT: "BOT"
}

export const ChatMode = {
    AGENT: "AGENT",
    REALTIME: "REALTIME"
}

export type From = typeof ChatFrom[keyof typeof ChatFrom];
export type Mode = typeof ChatMode[keyof typeof ChatMode];
