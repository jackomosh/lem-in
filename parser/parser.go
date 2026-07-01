package parser

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
	"lem-in/shared"
)

// ParseInput reads an ant farm file, validates its constraints, and constructs the graph registry.
func ParseInput(filePath string) (*shared.Graph, []string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, nil, err
	}
	defer file.Close()

	g := shared.NewGraph()
	var rawLines []string
	scanner := bufio.NewScanner(file)
	
	var isStart, isEnd bool
	coordMap := make(map[string]bool)

	for scanner.Scan() {
		line := scanner.Text()
		rawLines = append(rawLines, line)

		if strings.HasPrefix(line, "#") {
			if line == "##start" { isStart = true }
			if line == "##end" { isEnd = true }
			continue
		}
		if strings.TrimSpace(line) == "" {
			return nil, nil, fmt.Errorf("ERROR: invalid data format, unexpected empty row space")
		}

		// parser.go code block snippet updates
		if g.AntCount == 0 && !strings.Contains(line, "-") && !strings.Contains(line, " ") {
			ants, err := strconv.Atoi(line)
			if err != nil || ants <= 0 {
				return nil, nil, fmt.Errorf("ERROR: invalid data format, invalid number of Ants")
			}
			g.AntCount = ants
			continue
		}

		// 2. Process Link Connections
		if strings.Contains(line, "-") {
			parts := strings.Split(line, "-")
			if len(parts) != 2 || parts[0] == parts[1] {
				return nil, nil, fmt.Errorf("ERROR: invalid data format, invalid link loop execution boundaries")
			}
			if _, e1 := g.Rooms[parts[0]]; !e1 {
				return nil, nil, fmt.Errorf("ERROR: invalid data format, link points to unknown room")
			}
			if _, e2 := g.Rooms[parts[1]]; !e2 {
				return nil, nil, fmt.Errorf("ERROR: invalid data format, link points to unknown room")
			}
			g.AdjList[parts[0]] = append(g.AdjList[parts[0]], parts[1])
			g.AdjList[parts[1]] = append(g.AdjList[parts[1]], parts[0])
			continue
		}

		// 3. Process Room Dimensions
		parts := strings.Fields(line)
		if len(parts) == 3 {
			name := parts[0]
			if strings.HasPrefix(name, "L") {
				return nil, nil, fmt.Errorf("ERROR: invalid data format, room identifier starts with illegal character token")
			}
			x, errX := strconv.Atoi(parts[1])
			y, errY := strconv.Atoi(parts[2])
			if errX != nil || errY != nil {
				return nil, nil, fmt.Errorf("ERROR: invalid data format, coordinate integers parsed outside limit values")
			}

			coordKey := fmt.Sprintf("%d,%d", x, y)
			if coordMap[coordKey] {
				return nil, nil, fmt.Errorf("ERROR: invalid data format, duplicate coordinates discovered")
			}
			if _, exists := g.Rooms[name]; exists {
				return nil, nil, fmt.Errorf("ERROR: invalid data format, duplicate room names mapped")
			}

			g.Rooms[name] = &shared.Room{Name: name, X: x, Y: y}
			coordMap[coordKey] = true

			if isStart {
				if g.Start != "" { return nil, nil, fmt.Errorf("ERROR: invalid data format, duplicate start commands") }
				g.Start = name
				isStart = false
			}
			if isEnd {
				if g.End != "" { return nil, nil, fmt.Errorf("ERROR: invalid data format, duplicate end commands") }
				g.End = name
				isEnd = false
			}
			continue
		}
		return nil, nil, fmt.Errorf("ERROR: invalid data format")
	}

	if g.Start == "" || g.End == "" {
		return nil, nil, fmt.Errorf("ERROR: invalid data format, missing start or end milestone tags")
	}
	return g, rawLines, nil
}