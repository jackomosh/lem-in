package main

import (
	"fmt"
	"os"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Println("Usage: go run . <colony_file.txt>")
		os.Exit(1)
	}

	g, rawInputLines, err := ParseInput(os.Args[1])
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}

	// Step 1: Echo back the exact configuration data payload
	for _, line := range rawInputLines {
		fmt.Println(line)
	}
	fmt.Println()

	// Step 2: Extract distinct paths and run the simulation engine
	paths := g.FindNodeDisjointPaths()
	CoordinateAntTraffic(g, paths)
}