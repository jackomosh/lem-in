# Lem-in 🐜

Lem-in is an optimized, high-throughput digital ant-farm simulation engine written in Go. The goal of the project is to read an ant farm structural map from a text file, find the mathematically optimal combination of non-overlapping paths, and route thousands of ants from `##start` to `##end` in the minimum possible number of turns.

---

## 🚀 Key Features

* **Network Flow Optimization:** Utilizes the Edmonds-Karp Maximum Flow algorithm to discover the absolute optimal routing graph infrastructure.
* **Explicit Node Splitting:** Eliminates node collisions by splitting internal rooms into unique `_in` and `_out` residual vertex configurations to guarantee strict vertex-disjoint constraints.
* **Deterministic Turn Prediction:** Employs precise integer-based analytical routing math to determine execution overhead without running heavy simulation loops.
* **Zero-Friction Architecture:** Crafted with completely isolated engineering domains (`parser`, `solver`, `simulator`) to enable rapid feature additions without Git merge conflicts.

---

## 🧠 Core Algorithm Specs (`solver`)

Our updated routing engine executes an exact network flow pipeline to identify the absolute global minimum turn count:

### 1. Node-Splitting Graph Transformation (`solver.go`)
To find vertex-disjoint paths (where internal rooms hold a maximum of one ant per turn), the engine transforms the input graph. Each intermediate room is split into an internal link pairing: `[Room_in] -> [Room_out]` with a directed structural capacity of `1`.

### 2. Residual Augmenting Path Discovery (`bfs.go`)
The algorithm repeatedly executes a Breadth-First Search (BFS) over the transformed residual graph network (`findAugmentingPath`). It looks for available forward edge capacity (`Capacity > 0`) from `graph.Start` to `graph.End`, keeping precise track of parent transitions to back-propagate residual values.

### 3. Edmonds-Karp Path Extraction (`solver.go`)
Once max-flow is established across the network, the engine untangles the active flow values to reconstruct the final path sets. It tracks the structural edge decrements, strips away internal `_in` and `_out` engineering token suffixes, and reconstructs clean, consumer-ready path slices sorted in strict **ascending length order**.

### 4. Mathematical Turn Balancing (`solver.go`)
Instead of slowly running brute-force structural trials, the engine calculates the precise turn ceiling \(T\) required to move \(N\) ants through \(K\) active network paths using an \(O(1)\) integer formula block:

\[T = \max \left( \max(L_i), \left\lfloor \frac{N + \sum L_i - 1}{K} \right\rfloor \right)\]

If no viable network paths are generated from the structural map array, the solver gracefully defaults to an error-boundary limit (`999999`) to prevent downstream crashes.

---

## 🛠️ Getting Started

### Prerequisites
* Go 1.18 or higher installed on your system.

### Build & Run Pipeline
Automated routines are provided inside the `Makefile` for fast execution.

```bash
# 1. Format the codebase
make fmt

# 2. Run the full test suite
make test

# 3. Build the core orchestration binary
make build

# 4. Run lem-in with an ant-farm data file
make run FILE=lem-in-examples/example00.txt
```

### Visualizer Pipeline (Bonus Module)
To compile and stream our ant-farm coordinates directly into a graphical simulation frame, invoke the piped runner:
```bash
make run-vis FILE=lem-in-examples/example00.txt
```

---

## 📋 Input & Output Formats

### Input Map File Specification
The program consumes file structures tracking standard node positions and edge attachments:

```text
4          # Total number of ants
##start    # Command marker for start position
small 0 1  # Room name, X coord, Y coord
##end      # Command marker for end position
big 3 5
mid 2 3
# This is a comment link section
small-mid
mid-big
```

### Output Stream Tokenization
The system outputs the raw input map first, followed by sequential turn movements using token strings structured as `L[ant_id]-[room_name]`:

```text
[Raw Input Map Content Printed First]

L1-mid
L1-big L2-mid
L2-big L3-mid
L3-big L4-mid
L4-big
```

---

## 🔀 Project Architecture & Flow Control

Our execution entry point lives inside `main.go`, which serves as a dependency injector. Data flows through a single linear highway, meaning components never interact sideways:

```text
[Input File] ──> parser.Parse() ──> [shared.Graph] ──> solver.Solve() ──> [Paths] ──> simulator.Simulate() ──> [Terminal]
```

### File Hierarchy Map
```text
lem-in/
├── main.go                  # Central Orchestrator (Wires modules together)
├── shared/                  # System Structs (Types and Interface Contracts)
├── parser/                  # Input Processing & Map Format Validation
├── solver/                  # Pathfinding (Edmonds-Karp, Node-Splitting, Path Extraction)
├── simulator/               # Output Stream Structuring & Turn Engine
├── utils/                   # Shared Error Formats and String Helpers
└── visualizer/              # Graphical Simulation Binary
```

For complete contribution rules, branch naming workflows, and the sequential remote pull request guidelines, please refer directly to [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📜 License
This project is open-source and licensed under the terms of the [MIT License](LICENSE).
