# Lem-in: Digital Ant Colony Optimizer & Visualizer

A highly modular, production-ready Go application designed to simulate and optimize traffic through a digital ant farm network. The engine reads structural map configurations, extracts maximum node-disjoint paths using a tailored Breadth-First Search (BFS) graph layout, schedules collision-free asset distribution, and renders real-time movements via an embedded canvas HTML5 web UI interface.

---

## 📐 Project Architecture & Module Silos

To maintain operational integrity and guarantee individual code tracking, this repository is strictly segregated into structural domains. No teammate writes overlapping logic, ensuring clean Git histories and zero merge conflicts.

```text
lem-in/
├── shared/            # Frozen Domain definitions shared across modules (Types & Data Structs)
│   └── types.go       # Struct blueprints: Graph, Room, Link, AntState
├── parser/            # WORKSPACE: Map parsing, line scanning, and validation engines
│   ├── parser.go      # Primary input scanning logic
│   └── parser_test.go # Validation edge-case suites
├── solver/            # WORKSPACE: Matrix graphs, BFS, and disjoint path logic
│   ├── graph.go       # Shortest path network configurations
│   └── solver_test.go # Matrix validation assertions
├── simulator/         # WORKSPACE: Turn dispatchers, output formulation, and step schedulers
│   ├── dispatcher.go  # Step-by-step turn generation (producing 'L' moves text)
│   └── simulator_test.go # Collision safety validation tests
├── templates/         # UI layout templates
│   └── visualizer.html# Frontend canvas layout HTML
└── static/            # Asset engine styling
    ├── app.js         # Client-side canvas animation script
    └── style.css      # User interface custom styling

---

👥 Work Distribution Matrix
Work has been divided equally into 3 completely isolated processing segments to guarantee everyone gets clean, individual commits in the Git log:

👤 Member A: Input Data & Parsing Core (parser/)
Responsibility: Reading files/buffers, stripping comments, managing ##start/##end room anchors, coordinate tracking, and syntax validation.

Key Files: Everything inside the parser/ folder.

Commit Goal: Ensuring valid inputs convert seamlessly into a structured shared.Graph model while throwing precise errors for malformed text layouts.

👤 Member B: Graph Logic & Core Pathfinder (solver/)
Responsibility: Reading the room adjacency matrix, implementing node-disjoint Breadth-First Search (BFS), avoiding cycles, and selecting the optimal combination of paths.

Key Files: Everything inside the solver/ folder (including graph.go).

Commit Goal: Returning multi-lane, non-overlapping path arrays ([][]string) optimized for maximum throughput.

👤 Member C: Turn Simulation & UI Visualizer (simulator/ + Frontend)
Responsibility: Managing the turn scheduler logic (dispatcher.go) to print coordinates safely (e.g., L1-2 L2-3), preventing traffic collisions, embedding project visualizer layout files, and serving the canvas web engine.

Key Files: The simulator/ folder, templates/, and static/.

Commit Goal: Orchestrating error-free step timing and turning abstract matrix paths into smooth client-side frontend animations.

🛠️ Local Environment Execution & CLI Modes
This project supports dual-context runtimes: traditional command-line automation modes, standard data piping, or an embedded interactive local web interface.

1. Test Verification & Audits
Run the complete testing suite across all modular packages to ensure your code matches the expected output:

Bash
go clean -testcache
go test -v ./...
2. Standard CLI Argument Mode
Pass a valid configuration mapping file parameter directly to the compiler:

Bash
go run . examples/example_complex.txt
3. Linux Data Piping / Redirection Mode (CLI)
You can pipe maps directly into the executable terminal block or feed standard files via redirection:

Bash
cat examples/example_fork.txt | go run .
4. Interactive Web UI Mode (Visualizer Context)
Launch the embedded assets file server by triggering the executable without input file arguments:

Bash
go run .
Once initialized, navigate your local browser to:
👉 http://localhost:8080/visualizer

🌲 Git Branch & Workflow Strategy
To ensure every contributor receives unambiguous commit signatures and safe branch merges, follow this exact pipeline:

Checkout Feature Branch: Never work directly on main. Create your local silo workspace:

Bash
git checkout -b feature-parser       # Member A
git checkout -b feature-solver       # Member B
git checkout -b feature-simulator    # Member C
Commit Incremental Progress: Keep your changes highly localized to your assigned folder structure.

Sequential Local Rebase and Merge Loop: Once features pass local validation tests, synchronize upstream changes smoothly into production:

Bash
git checkout main
git pull origin main
git checkout feature-yourname
git rebase main
# Fix any project configurations if necessary, then merge securely
git checkout main
git merge feature-yourname
📝 Input File Layout Syntax Specification
Input files require exact data layout tokens containing ant volume counts, coordinates, and clear linking structures:

Plaintext
10                 # Total volume of ants to dispatch
##start            # Start position flag indicator
startNode 1 5      # RoomName CoordinateX CoordinateY
##end              # Destination flag indicator
anthillDest 12 5   # RoomName CoordinateX CoordinateY
roomAlpha 4 2      # Intermediate structural node space
roomBeta 8 2       
# ---------------- Matrix Linking Array
startNode-roomAlpha
roomAlpha-roomBeta
roomBeta-anthillDest