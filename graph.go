package main

// Room represents a node inside the ant farm matrix.
type Room struct {
	Name string
	X, Y int
}

// Graph maps out structural elements and adjacent link paths.
type Graph struct {
	Rooms    map[string]*Room
	AdjList  map[string][]string
	Start    string
	End      string
	AntCount int
}

func NewGraph() *Graph {
	return &Graph{
		Rooms:   make(map[string]*Room),
		AdjList: make(map[string][]string),
	}
}

// FindNodeDisjointPaths extracts multiple valid paths that don't share intermediate nodes or edges.
func (g *Graph) FindNodeDisjointPaths() [][]string {
	var paths [][]string
	usedRooms := make(map[string]bool)
	usedFirstSteps := make(map[string]bool) // Tracks first steps to prevent infinite loop on direct paths

	for {
		path := g.bfsShortestPath(usedRooms, usedFirstSteps)
		if len(path) == 0 {
			break
		}
		paths = append(paths, path)
		
		// Block the first step out of start so this path choice cannot be duplicated
		if len(path) > 1 {
			usedFirstSteps[path[1]] = true
		}

		// Block intermediate rooms for true node-disjoint selection
		if len(path) > 2 {
			for i := 1; i < len(path)-1; i++ {
				usedRooms[path[i]] = true
			}
		}
	}
	return paths
}

func (g *Graph) bfsShortestPath(usedRooms map[string]bool, usedFirstSteps map[string]bool) []string {
	queue := [][]string{{g.Start}}
	visited := map[string]bool{g.Start: true}

	for len(queue) > 0 {
		currPath := queue[0]
		queue = queue[1:]

		currNode := currPath[len(currPath)-1]
		if currNode == g.End {
			return currPath
		}

		for _, neighbor := range g.AdjList[currNode] {
			// If we are at the start room, don't reuse a first step that was already taken by a previous path
			if currNode == g.Start && usedFirstSteps[neighbor] {
				continue
			}

			if neighbor == g.End {
				nextPath := append([]string{}, currPath...)
				return append(nextPath, neighbor)
			}

			if !visited[neighbor] && !usedRooms[neighbor] {
				visited[neighbor] = true
				nextPath := append([]string{}, currPath...)
				queue = append(queue, append(nextPath, neighbor))
			}
		}
	}
	return nil
}