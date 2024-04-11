package main

import "fmt"

type Protocol string

const (
	IPV4 Protocol = "ipv4"
	IPV6 Protocol = "ipv6"
)

func (p Protocol) String() string {
	switch p {
	case IPV4:
		return "ipv4"
	case IPV6:
		return "ipv6"
	default:
		return ""
	}
}

func NewProtocol(value string) (Protocol, error) {
	switch value {
	case IPV4.String(), IPV6.String():
		return Protocol(value), nil
	default:
		return "", fmt.Errorf("invalid Protocol value: %s", value)
	}
}

type IpAddress struct {
	Ip    string   `json:"ip"`
	Port  int16    `json:"port"`
	Proto Protocol `json:"proto"`
}

type PortForward struct {
	Source IpAddress `json:"source"`
	Target IpAddress `json:"target"`
}

type PortForwarder interface {
	Get() ([]PortForward, error)
	Add(pf PortForward) error
	BatchAdd(pfs []PortForward) error
	Delete(pf PortForward) error
	BatchDelete(pfs []PortForward) error
}
