package main

import (
	"fmt"
)

type Protoctl string

const (
	IPV4 Protoctl = "ipv4"
	IPV6 Protoctl = "ipv6"
)

func (p Protoctl) String() string {
	switch p {
	case IPV4:
		return "ipv4"
	case IPV6:
		return "ipv6"
	default:
		return ""
	}
}

func NewProtoctl(value string) (Protoctl, error) {
	switch value {
	case IPV4.String(), IPV6.String():
		return Protoctl(value), nil
	default:
		return "", fmt.Errorf("invalid Protoctl value: %s", value)
	}
}

type IpAddress struct {
	Ip    string   `json:"ip"`
	Port  int16    `json:"port"`
	Proto Protoctl `json:"proto"`
}

type PortMap struct {
	Source IpAddress `json:"source"`
	Target IpAddress `json:"target"`
}

type PortMaper interface {
	Get() ([]PortMap, error)
	Add(pm PortMap) error
	BatchAdd(pms []PortMap) error
	Delete(pm PortMap) error
	BatchDelete(pms []PortMap) error
}

type PortMaperApi struct {
	portMaper PortMaper
}

func NewPlatformPortMaper() PortMaper {
	return &WindowsPortMaper{}
	// switch runtime.GOOS {
	// case "windows":
	// 	return &WindowsPortMaper{}
	// default:
	// 	log.Fatalf("Unsupported platform: %s\n", runtime.GOOS)
	// 	return nil
	// }
}

func NewPortMaperApi() *PortMaperApi {
	return &PortMaperApi{portMaper: NewPlatformPortMaper()}
}

func (ws *PortMaperApi) Get() ([]PortMap, error) {
	return ws.portMaper.Get()
}

func (ws *PortMaperApi) Add(pm PortMap) error {
	return ws.portMaper.Add(pm)
}

func (ws *PortMaperApi) BatchAdd(pms []PortMap) error {
	return ws.portMaper.BatchAdd(pms)
}

func (ws *PortMaperApi) Delete(pm PortMap) error {
	return ws.portMaper.Delete(pm)
}

func (ws *PortMaperApi) BatchDelete(pms []PortMap) error {
	return ws.portMaper.BatchDelete(pms)
}
