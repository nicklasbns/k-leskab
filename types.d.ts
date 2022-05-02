import { Socket } from "socket.io"

export type userSocket1 <T> = partial<T> & {
    user: {
        id: string,
        name: string,
        isAdmin: boolean
    }
}

export interface userSocket extends Socket {
    user?: {
        loggedIn: boolean,
        id?: string,
        name?: string,
        isAdmin?: boolean,
        session?: string
    };
}

export interface item {
    item: string,
    size?: string,
    image?: string,
    date: date
}