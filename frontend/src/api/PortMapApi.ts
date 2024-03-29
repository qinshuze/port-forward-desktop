import { main } from "wailsjs/go/models";
import { getUUID } from "../functions";
import { PortMap } from "../hook/PortMapsContext";
import * as GoPortMaperApi from "wailsjs/go/main/PortMaperApi";

export function Get(): Promise<PortMap[]> {
    return new Promise<PortMap[]>((resolve, reject) => {
        GoPortMaperApi.Get().then(data => {
            resolve(data.map<PortMap>(item => {
                return {
                    id: getUUID(),
                    source: { ...item.source },
                    target: { ...item.target }
                } as PortMap
            }))
        }).catch(reason => {
            reject(reason)
        })
    })
}

export function Delete(pm: PortMap): Promise<void> {
    return new Promise((resolve, reject) => {
        GoPortMaperApi.Delete(<main.PortMap>{
            source: { ...pm.source },
            target: { ...pm.target },
        }).then(() => resolve())
            .catch((reason) => reject(reason))
    })
}

export function BatchDelete(pms: PortMap[]): Promise<void> {
    return new Promise((resolve, reject) => {
        GoPortMaperApi.BatchDelete(pms.map<main.PortMap>(item => {
            return {
                source: { ...item.source },
                target: { ...item.target },
            } as main.PortMap
        })).then(() => resolve())
            .catch((reason) => reject(reason))
    })
}

export function Add(pm: PortMap): Promise<void> {
    return new Promise((resolve, reject) => {
        GoPortMaperApi.Add(<main.PortMap>{
            source: { ...pm.source },
            target: { ...pm.target },
        }).then(() => resolve())
            .catch((reason) => reject(reason))
    })
}

export function BatchAdd(pms: PortMap[]): Promise<void> {
    return new Promise((resolve, reject) => {
        GoPortMaperApi.BatchAdd(pms.map<main.PortMap>(item => {
            return {
                source: { ...item.source },
                target: { ...item.target },
            } as main.PortMap
        })).then(() => resolve())
            .catch((reason) => reject(reason))
    })
}