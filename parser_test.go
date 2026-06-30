package main

import (
	"os"
	"testing"
)

func TestInputParserScenarios(t *testing.T) {
	badInput := []byte(`invalid_ant_count
##start
room1 1 2
##end
room2 3 4
room1-room2`)

	err := os.WriteFile("test_bad.txt", badInput, 0644)
	if err != nil {
		t.Fatalf("Failed to establish isolated environment tracking conditions: %v", err)
	}
	defer os.Remove("test_bad.txt")

	_, _, err = ParseInput("test_bad.txt")
	if err == nil {
		t.Errorf("Expected configuration validation failure sequence, successfully bypassed check blocks instead")
	}
}