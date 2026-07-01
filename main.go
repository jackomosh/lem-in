package main

import (
	"embed"
	"fmt"
	"html/template"
	"net/http"
	"os"
)

//go:embed templates/* static/*
var embeddedFileSystem embed.FS

func main() {
	// If standard project file arguments are missing, check if user wants to serve the UI visualizer route
	if len(os.Args) != 2 {
		fmt.Println("Launching local UI web server context instead... visit http://localhost:8080/visualizer")
		
		mux := http.NewServeMux()
		mux.Handle("/static/", http.FileServer(http.FS(embeddedFileSystem)))
		
		mux.HandleFunc("/visualizer", func(w http.ResponseWriter, r *http.Request) {
			tmpl := template.Must(template.ParseFS(embeddedFileSystem, "templates/visualizer.html"))
			_ = tmpl.Execute(w, nil)
		})

		if err := http.ListenAndServe(":8080", mux); err != nil {
			fmt.Printf("Web server stopped: %v\n", err)
		}
		return
	}

	// Normal CLI execution path continues as usual
	g, rawInputLines, err := ParseInput(os.Args[1])
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}

	for _, line := range rawInputLines {
		fmt.Println(line)
	}
	fmt.Println()

	paths := g.FindNodeDisjointPaths()
	CoordinateAntTraffic(g, paths)
}