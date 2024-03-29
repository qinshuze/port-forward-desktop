export enum ActionType {
    ADDED,
    CHANGED,
    DELETED
}

export type HookAction<T> = {
    type: string
    payload: T
}