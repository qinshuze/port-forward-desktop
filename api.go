package main

type ApiPortForwarder struct {
	portForwarder PortForwarder
}

func NewPlatformPortMapper() PortForwarder {
	return &WindowsPortForwarder{}
	// switch runtime.GOOS {
	// case "windows":
	// 	return &WindowsPortMaper{}
	// default:
	// 	log.Fatalf("Unsupported platform: %s\n", runtime.GOOS)
	// 	return nil
	// }
}

func NewApiPortForwarder() *ApiPortForwarder {
	return &ApiPortForwarder{portForwarder: NewPlatformPortMapper()}
}

func (ws *ApiPortForwarder) Get() ([]PortForward, error) {
	return ws.portForwarder.Get()
}

func (ws *ApiPortForwarder) Add(pf PortForward) error {
	return ws.portForwarder.Add(pf)
}

func (ws *ApiPortForwarder) BatchAdd(pfs []PortForward) error {
	return ws.portForwarder.BatchAdd(pfs)
}

func (ws *ApiPortForwarder) Delete(pf PortForward) error {
	return ws.portForwarder.Delete(pf)
}

func (ws *ApiPortForwarder) BatchDelete(pfs []PortForward) error {
	return ws.portForwarder.BatchDelete(pfs)
}
