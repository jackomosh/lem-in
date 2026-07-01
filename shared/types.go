package shared

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

type AntState struct {
	ID       int
	Path     []string
	Position int
}