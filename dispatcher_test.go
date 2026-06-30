package main

import "testing"

func TestTrafficDispatcherNoCrash(t *testing.T) {
	g := NewGraph()
	g.Start = "Start"
	g.End = "End"
	g.AntCount = 2

	paths := [][]string{{"Start", "End"}}
	
	// Ensure that direct routes complete validation tracking tasks cleanly
	CoordinateAntTraffic(g, paths)
}