package main

import "testing"

func TestDisjointPathExtraction(t *testing.T) {
	g := NewGraph()
	g.Start = "A"
	g.End = "D"
	g.AntCount = 4

	g.Rooms["A"] = &Room{Name: "A"}
	g.Rooms["B"] = &Room{Name: "B"}
	g.Rooms["C"] = &Room{Name: "C"}
	g.Rooms["D"] = &Room{Name: "D"}

	// Path 1: A -> B -> D
	g.AdjList["A"] = append(g.AdjList["A"], "B")
	g.AdjList["B"] = append(g.AdjList["B"], "A", "D")
	g.AdjList["D"] = append(g.AdjList["D"], "B")

	// Path 2: A -> C -> D
	g.AdjList["A"] = append(g.AdjList["A"], "C")
	g.AdjList["C"] = append(g.AdjList["C"], "A", "D")
	g.AdjList["D"] = append(g.AdjList["D"], "C")

	paths := g.FindNodeDisjointPaths()
	if len(paths) != 2 {
		t.Errorf("Expected 2 distinct node-disjoint paths, extracted %d instead", len(paths))
	}
}