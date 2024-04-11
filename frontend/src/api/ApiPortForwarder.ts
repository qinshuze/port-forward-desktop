import { main } from "../wailsjs/go/models";
import { getUUID } from "../functions";
import { PortForward } from "../hook/PortForwardContext";
import * as GoApiPortForwarder from "../wailsjs/go/main/ApiPortForwarder";

export function Get(): Promise<PortForward[]> {
    return new Promise<PortForward[]>((resolve, reject) => {
        GoApiPortForwarder.Get().then(data => {
            resolve(data.map<PortForward>(item => {
                return {
                    id: getUUID(),
                    source: { ...item.source },
                    target: { ...item.target }
                } as PortForward
            }))
        }).catch(reason => {
            reject(reason)
        })
    })
}

export function Delete(pm: PortForward): Promise<void> {
    return new Promise((resolve, reject) => {
        GoApiPortForwarder.Delete(<main.PortForward>{
            source: { ...pm.source },
            target: { ...pm.target },
        }).then(() => resolve())
          .catch((reason) => reject(reason))
    })
}

export function BatchDelete(pms: PortForward[]): Promise<void> {
    return new Promise((resolve, reject) => {
        GoApiPortForwarder.BatchDelete(pms.map<main.PortForward>(item => {
            return {
                source: { ...item.source },
                target: { ...item.target },
            } as main.PortForward
        })).then(() => resolve())
          .catch((reason) => reject(reason))
    })
}

export function Add(pm: PortForward): Promise<void> {
    return new Promise((resolve, reject) => {
        GoApiPortForwarder.Add(<main.PortForward>{
            source: { ...pm.source },
            target: { ...pm.target },
        }).then(() => resolve())
          .catch((reason) => reject(reason))
    })
}

export function BatchAdd(pms: PortForward[]): Promise<void> {
    return new Promise((resolve, reject) => {
        GoApiPortForwarder.BatchAdd(pms.map<main.PortForward>(item => {
            return {
                source: { ...item.source },
                target: { ...item.target },
            } as main.PortForward
        })).then(() => resolve())
          .catch((reason) => reject(reason))
    })
}