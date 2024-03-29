import React, {createContext, useContext, useReducer} from "react";


export interface IpAddress {
    ip: string
    port: number
    proto: "ipv4" | "ipv6"
}

export interface PortMap {
    id: string,
    source: IpAddress,
    target: IpAddress
}

type PortMapsAction =
    { type: "added", payload: PortMap[] }
    | { type: "changed", payload: PortMap[] }
    | { type: "deleted", payload: string[] }
    | { type: "init", payload: PortMap[] }
    | { type: "clear" }

const PortMapsContext = createContext<PortMap[]>([])
const PortMapsDispatchContext = createContext<React.Dispatch<PortMapsAction>>(() => {});

export function portMapsReducer(state: PortMap[], action: PortMapsAction): PortMap[] {
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

export function usePortMaps() {
    return useContext(PortMapsContext)
}

export function usePortMapsDispatch() {
    return useContext(PortMapsDispatchContext);
}

export function PortMapsProvider(props: { children?: React.ReactNode }) {
    const [portMaps, dispatch] = useReducer(
      portMapsReducer,
      []
    );

    return <PortMapsContext.Provider value={portMaps}>
        <PortMapsDispatchContext.Provider value={dispatch}>
            {props.children}
        </PortMapsDispatchContext.Provider>
    </PortMapsContext.Provider>
}