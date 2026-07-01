package simulator

import (
	"fmt"
	"strings"
	"lem-in/shared"
)

// CoordinateAntTraffic distributes ants optimally across the paths and outputs their steps.
func CoordinateAntTraffic(g *shared.Graph, paths [][]string) {
	if len(paths) == 0 {
		fmt.Println("ERROR: invalid data format, no path discovered between start and end vertices")
		return
	}

	// 1. Calculate greedy distribution schema allocations
	pathDistribution := make([]int, len(paths))
	for ant := 0; ant < g.AntCount; ant++ {
		bestPathIdx := 0
		bestScore := len(paths[0]) + pathDistribution[0]

		for i := 1; i < len(paths); i++ {
			score := len(paths[i]) + pathDistribution[i]
			if score < bestScore {
				bestScore = score
				bestPathIdx = i
			}
		}
		pathDistribution[bestPathIdx]++
	}

	// 2. Queue up operations across the execution matrix
	activeAnts := make([]*shared.AntState, 0)
	antCounter := 1

	for pathIdx, totalAntsForPath := range pathDistribution {
		for i := 0; i < totalAntsForPath; i++ {
			activeAnts = append(activeAnts, &shared.AntState{
				ID:       antCounter,
				Path:     paths[pathIdx],
				Position: 0,
			})
			antCounter++
		}
	}

	// 3. Execution loop simulation step tracker
	antsInMotion := make([]*shared.AntState, 0)
	deployedIndex := 0

	for deployedIndex < len(activeAnts) || len(antsInMotion) > 0 {
		// Deploy new waves depending on path occupancy safety margins
		occupiedRooms := make(map[string]bool)
		
		// Move active ants forward
		var outputTokens []string
		var nextInMotion []*shared.AntState

		for _, ant := range antsInMotion {
			ant.Position++
			targetRoom := ant.Path[ant.Position]
			
			outputTokens = append(outputTokens, fmt.Sprintf("L%d-%s", ant.ID, targetRoom))
			
			if targetRoom != g.End {
				occupiedRooms[targetRoom] = true
				nextInMotion = append(nextInMotion, ant)
			}
		}
		antsInMotion = nextInMotion

		// Check if we can launch additional waves from start
		for deployedIndex < len(activeAnts) {
			nextAnt := activeAnts[deployedIndex]
			firstStepRoom := nextAnt.Path[1]

			if !occupiedRooms[firstStepRoom] || firstStepRoom == g.End {
				nextAnt.Position = 1
				outputTokens = append(outputTokens, fmt.Sprintf("L%d-%s", nextAnt.ID, firstStepRoom))
				
				if firstStepRoom != g.End {
					occupiedRooms[firstStepRoom] = true
					antsInMotion = append(antsInMotion, nextAnt)
				}
				deployedIndex++
			} else {
				break
			}
		}

		if len(outputTokens) > 0 {
			fmt.Println(strings.Join(outputTokens, " "))
		}
	}
}
