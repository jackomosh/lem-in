package main

import (
	"os"
	"testing"
)

func TestAuditComprehensiveSuite(t *testing.T) {
	tests := []struct {
		name        string
		fileData    string
		expectError bool
	}{
		{
			name: "Standard Audit Example00 Simulation Configuration",
			fileData: `4
##start
0 0 3
2 2 5
3 4 0
##end
1 8 3
0-2
2-3
3-1`,
			expectError: false,
		},
		{
			name: "Missing Start Node Validation Failure",
			fileData: `5
roomA 1 2
##end
roomB 3 4
roomA-roomB`,
			expectError: true,
		},
		{
			name: "Overlapping Coordinates Error Matching",
			fileData: `3
##start
start 0 0
##end
end 0 0
start-end`,
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tmpFile := "audit_test_tmp.txt"
			err := os.WriteFile(tmpFile, []byte(tt.fileData), 0644)
			if err != nil {
				t.Fatalf("Failed setup: %v", err)
			}
			defer os.Remove(tmpFile)

			g, _, err := ParseInput(tmpFile)
			if (err != nil) != tt.expectError {
				t.Errorf("Test Case '%s' failed. Expected error presence: %v, got: %v", tt.name, tt.expectError, err)
			}

			if err == nil {
				paths := g.FindNodeDisjointPaths()
				if len(paths) == 0 {
					t.Errorf("Valid graph topology failed path matrix generation checks")
				}
			}
		})
	}
}