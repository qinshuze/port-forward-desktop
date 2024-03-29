package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/build
var assets embed.FS

func main() {

	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:     "Port Forward",
		Width:     900,
		MinWidth:  850,
		Height:    600,
		MinHeight: 450,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			NewPortMaperApi(),
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}