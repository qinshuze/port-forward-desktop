import React, {createContext, useContext, useReducer} from "react";


export interface IpAddress {
    ip: string
    port: number
    proto: "ipv4" | "ipv6"
}

export interface PortForward {
    id: string,
    source: IpAddress,
    target: IpAddress
}

type PortForwardsAction =
    { type: "added", payload: PortForward[] }
    | { type: "changed", payload: PortForward[] }
    | { type: "deleted", payload: string[] }
    | { type: "init", payload: PortForward[] }
    | { type: "clear" }

const PortForwardContext = createContext<PortForward[]>([])
const PortForwardsDispatchContext = createContext<React.Dispatch<PortForwardsAction>>(() => {});

export function portForwardsReducer(state: PortForward[], action: PortForwardsAction): PortForward[] {
    switch (action.type) {
        case 'clear': return []
        case 'init': return [...action.payload]
        case 'added': return [...state, ...action.payload]
        case 'deleted': return state.filter(item => !action.payload.includes(item.id));
        case 'changed':
            const myMap = new Map(action.payload.map(item => [item.id, item]));
            return state.map(item => (myMap.has(item.id) ? myMap.get(item.id) : item)!)
        default:
            return state;
    }
}

export function usePortForwards() {
    return useContext(PortForwardContext)
}

export function usePortForwardsDispatch() {
    return useContext(PortForwardsDispatchContext);
}

export function PortForwardsProvider(props: { children?: React.ReactNode }) {
    const [portForwards, dispatch] = useReducer(
      portForwardsReducer,
      []
    );

    return <PortForwardContext.Provider value={portForwards}>
        <PortForwardsDispatchContext.Provider value={dispatch}>
            {props.children}
        </PortForwardsDispatchContext.Provider>
    </PortForwardContext.Provider>
}