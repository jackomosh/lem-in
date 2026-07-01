package simulator

import (
	"testing"
	"lem-in/shared"
)

func TestTrafficDispatcherNoCrash(t *testing.T) {
	g := shared.NewGraph()
	g.Start = "Start"
	g.End = "End"
	g.AntCount = 2

	paths := [][]string{{"Start", "End"}}
	
	// Ensure that direct routes complete validation tracking tasks cleanly
	CoordinateAntTraffic(g, paths)
}