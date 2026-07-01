const canvas = document.getElementById('farmCanvas');
const ctx = canvas.getContext('2d');

let rooms = {};
let links = [];
let turns = [];
let antRegistry = {};

let startRoomName = "";
let endRoomName = "";

// Wire up events cleanly
document.getElementById('btnLoad').addEventListener('click', compileTelemetryPayload);
document.getElementById('btnPlay').addEventListener('click', runSimulationEngine);

function compileTelemetryPayload() {
    const rawInput = document.getElementById('outputLog').value;
    const lines = rawInput.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");

    rooms = {};
    links = [];
    turns = [];
    antRegistry = {};
    startRoomName = "";
    endRoomName = "";

    // Clear out any stale DOM ant items lingering from previous simulation iterations
    document.querySelectorAll('.gif-ant').forEach(el => el.remove());

    let nextIsStart = false;
    let nextIsEnd = false;
    const telemetryBox = document.getElementById('statusTelemetry');

    for (let line of lines) {
        if (line === "##start") { nextIsStart = true; continue; }
        if (line === "##end") { nextIsEnd = true; continue; }
        if (line.startsWith('#')) continue; 

        // 1. Parse Ant Moves (Lines starting with 'L')
        if (line.startsWith('L') || line.includes(' L')) {
            turns.push(line);
            continue;
        }

        // 2. Parse Links/Tunnels (Contains '-')
        if (line.includes('-')) {
            const parts = line.split('-');
            if (parts.length !== 2) {
                telemetryBox.innerText = "ERROR: A tunnel must connect exactly two rooms.";
                return;
            }
            const from = parts[0].trim();
            const to = parts[1].trim();

            const duplicate = links.find(l => (l.from === from && l.to === to) || (l.from === to && l.to === from));
            if (duplicate) {
                telemetryBox.innerText = `ERROR: Multiple tunnels detected between '${from}' and '${to}'.`;
                return;
            }

            links.push({ from, to });
            continue;
        }

        // 3. Parse Rooms (Space-separated: name X Y)
        const parts = line.split(/\s+/);
        if (parts.length === 3) {
            const name = parts[0].trim();
            
            if (name.startsWith('L') || name.startsWith('#')) {
                telemetryBox.innerText = `ERROR: Room name '${name}' is invalid (cannot start with L or #).`;
                return;
            }

            const x = parseInt(parts[1]);
            const y = parseInt(parts[2]);
            
            if (isNaN(x) || isNaN(y)) {
                telemetryBox.innerText = `ERROR: Room '${name}' has invalid non-integer coordinates.`;
                return;
            }

            rooms[name] = { name, x, y, screenX: 0, screenY: 0 };

            if (nextIsStart) { startRoomName = name; nextIsStart = false; }
            if (nextIsEnd) { endRoomName = name; nextIsEnd = false; }
        }
    }

    if (!startRoomName || !endRoomName) {
        telemetryBox.innerText = "ERROR: Map is missing a valid ##start or ##end room designation.";
        return;
    }

    scaleGraphCoordinates();
    renderStaticNetwork();

    const btnPlay = document.getElementById('btnPlay');
    if (turns.length > 0) {
        btnPlay.disabled = false;
        telemetryBox.innerText = `Graph Loaded! ${Object.keys(rooms).length} rooms, ${links.length} tunnels, and ${turns.length} transit rounds ready to animate!`;
    } else {
        btnPlay.disabled = true;
        telemetryBox.innerText = "ERROR: Map parsed successfully, but no tracking movement tokens (L lines) were found.";
    }
}

function scaleGraphCoordinates() {
    const roomList = Object.values(rooms);
    if (roomList.length === 0) return;

    let minX = Math.min(...roomList.map(r => r.x));
    let maxX = Math.max(...roomList.map(r => r.x));
    let minY = Math.min(...roomList.map(r => r.y));
    let maxY = Math.max(...roomList.map(r => r.y));

    const margin = 70;
    const xScale = (canvas.width - margin * 2) / (maxX - minX || 1);
    const yScale = (canvas.height - margin * 2) / (maxY - minY || 1);

    for (let key in rooms) {
        rooms[key].screenX = margin + (rooms[key].x - minX) * xScale;
        rooms[key].screenY = margin + (rooms[key].y - minY) * yScale;
    }
}

function renderStaticNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Tunnels
    ctx.strokeStyle = '#cbd5e1'; 
    ctx.lineWidth = 3;
    for (let edge of links) {
        const node1 = rooms[edge.from];
        const node2 = rooms[edge.to];
        if (node1 && node2) {
            ctx.beginPath();
            ctx.moveTo(node1.screenX, node1.screenY);
            ctx.lineTo(node2.screenX, node2.screenY);
            ctx.stroke();
        }
    }

    // Draw Rooms
    for (let key in rooms) {
        const room = rooms[key];
        if (key === startRoomName) { ctx.fillStyle = '#dcfce7'; ctx.strokeStyle = '#16a34a'; } 
        else if (key === endRoomName) { ctx.fillStyle = '#fee2e2'; ctx.strokeStyle = '#dc2626'; } 
        else { ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#0284c7'; }

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(room.screenX, room.screenY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(room.name, room.screenX, room.screenY - 24);
    }
}

async function runSimulationEngine() {
    document.getElementById('btnPlay').disabled = true;
    antRegistry = {}; 

    const startNode = rooms[startRoomName];
    const telemetryBox = document.getElementById('statusTelemetry');

    for (let idx = 0; idx < turns.length; idx++) {
        telemetryBox.innerText = `Processing Round: ${idx + 1} / ${turns.length}`;
        
        const actions = turns[idx].split(/\s+/).filter(a => a.startsWith('L'));
        let stepAnimations = [];
        let roomsOccupiedThisTurn = {}; 

        for (let action of actions) {
            const details = action.substring(1).split('-');
            const antId = details[0];
            const targetNodeName = details[1];
            const targetNode = rooms[targetNodeName];

            if (!targetNode) {
                telemetryBox.innerText = `Simulation Error: Ant A${antId} moved to an unknown room '${targetNodeName}'.`;
                return;
            }

            if (targetNodeName !== startRoomName && targetNodeName !== endRoomName) {
                if (roomsOccupiedThisTurn[targetNodeName]) {
                    telemetryBox.innerText = `RULE VIOLATION: Traffic collision! Multiple ants entered room '${targetNodeName}' during turn ${idx + 1}.`;
                    document.getElementById('btnPlay').disabled = false;
                    return;
                }
                roomsOccupiedThisTurn[targetNodeName] = antId;
            }

            let initialX = startNode ? startNode.screenX : canvas.width / 2;
            let initialY = startNode ? startNode.screenY : canvas.height / 2;

            if (antRegistry[antId]) {
                initialX = antRegistry[antId].x;
                initialY = antRegistry[antId].y;
            }

            stepAnimations.push({
                id: antId,
                fromX: initialX,
                fromY: initialY,
                toX: targetNode.screenX,
                toY: targetNode.screenY
            });
        }

        if (stepAnimations.length > 0) {
            await executeFrameLerp(stepAnimations);
        }
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    telemetryBox.innerText = "Simulation complete! All ants arrived cleanly without violating farm rules.";
    document.getElementById('btnPlay').disabled = false;
}

function executeFrameLerp(animations) {
    return new Promise((resolve) => {
        let currentFrame = 0;
        const totalFrames = 120; 
        const displayPanel = document.querySelector('.display-panel');

        function process() {
            currentFrame++;
            const progression = currentFrame / totalFrames;

            renderStaticNetwork();

            for (let item of animations) {
                const liveX = item.fromX + (item.toX - item.fromX) * progression;
                const liveY = item.fromY + (item.toY - item.fromY) * progression;

                antRegistry[item.id] = { x: liveX, y: liveY };

                const dx = item.toX - item.fromX;
                const dy = item.toY - item.fromY;
                let angle = Math.atan2(dy, dx);

                // 1. Keep the forward rotation direction pointer
                angle += Math.PI; 

                let antEl = document.getElementById(`dom-ant-${item.id}`);
                if (!antEl) {
                    antEl = document.createElement('div');
                    antEl.id = `dom-ant-${item.id}`;
                    antEl.className = 'gif-ant';
                    antEl.innerHTML = `
                        <img src="/static/ant.gif" style="width:100%; height:100%;" />
                        <span class="gif-ant-id">A${item.id}</span>
                    `;
                    displayPanel.appendChild(antEl);
                }

                const canvasLeft = canvas.offsetLeft;
                const canvasTop = canvas.offsetTop;
                antEl.style.left = `${canvasLeft + liveX - 24}px`;
                antEl.style.top = `${canvasTop + liveY - 24}px`;
                
                // 2. CRITICAL FIX: Add scaleY(-1) to flip the legs vertically back to their right alignment!
                antEl.style.transform = `rotate(${angle}rad) scaleY(-1)`;
            }

            if (currentFrame < totalFrames) {
                requestAnimationFrame(process);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(process);
    });
}