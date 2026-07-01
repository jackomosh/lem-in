const canvas = document.getElementById('farmCanvas');
const ctx = canvas.getContext('2d');
const canvasWrapper = document.querySelector('.canvas-wrapper');

let rooms = {};
let links = [];
let turns = [];
let antRegistry = {};

let startRoomName = "";
let endRoomName = "";

// Preload the Anthill image asset for the end room node
const anthillImage = new Image();
anthillImage.src = '/static/anthill2.png';
anthillImage.onload = () => { if(Object.keys(rooms).length > 0) renderStaticNetwork(); };

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

    // Clear any existing active ants on rebuild
    document.querySelectorAll('.gif-ant').forEach(el => el.remove());

    let nextIsStart = false;
    let nextIsEnd = false;
    const telemetryBox = document.getElementById('statusTelemetry');

    for (let line of lines) {
        if (line === "##start") { nextIsStart = true; continue; }
        if (line === "##end") { nextIsEnd = true; continue; }
        if (line.startsWith('#')) continue; 

        if (line.startsWith('L') || line.includes(' L')) {
            turns.push(line);
            continue;
        }

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
        telemetryBox.innerText = "ERROR: Map parsed successfully, but no tracking movement details were found.";
    }
}

function scaleGraphCoordinates() {
    const roomList = Object.values(rooms);
    if (roomList.length === 0) return;

    let minX = Math.min(...roomList.map(r => r.x));
    let maxX = Math.max(...roomList.map(r => r.x));
    let minY = Math.min(...roomList.map(r => r.y));
    let maxY = Math.max(...roomList.map(r => r.y));

    const margin = 110; 
    const xScale = (canvas.width - margin * 2) / (maxX - minX || 1);
    const yScale = (canvas.height - margin * 2) / (maxY - minY || 1);

    for (let key in rooms) {
        rooms[key].screenX = margin + (rooms[key].x - minX) * xScale;
        rooms[key].screenY = margin + (rooms[key].y - minY) * yScale;
    }
}

function renderStaticNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Draw Earthy/Sand Brown Tunnel Tracks
    ctx.strokeStyle = '#a16207'; 
    ctx.lineWidth = 20;
    for (let edge of links) {
        const n1 = rooms[edge.from]; const n2 = rooms[edge.to];
        if (n1 && n2) { ctx.beginPath(); ctx.moveTo(n1.screenX, n1.screenY); ctx.lineTo(n2.screenX, n2.screenY); ctx.stroke(); }
    }

    ctx.strokeStyle = '#d97706'; 
    ctx.lineWidth = 14;
    for (let edge of links) {
        const n1 = rooms[edge.from]; const n2 = rooms[edge.to];
        if (n1 && n2) { ctx.beginPath(); ctx.moveTo(n1.screenX, n1.screenY); ctx.lineTo(n2.screenX, n2.screenY); ctx.stroke(); }
    }

    // Draw Enlarged Ant Chambers (Upgraded to 34px radius)
    for (let key in rooms) {
        const room = rooms[key];
        
        ctx.save();
        ctx.shadowColor = 'rgba(67, 43, 15, 0.4)';
        ctx.shadowBlur = 8;

        if (key === startRoomName) { ctx.fillStyle = '#b45309'; ctx.strokeStyle = '#78350f'; } 
        else if (key === endRoomName) { ctx.fillStyle = '#7c2d12'; ctx.strokeStyle = '#451a03'; } 
        else { ctx.fillStyle = '#ca8a04'; ctx.strokeStyle = '#854d0e'; }

        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(room.screenX, room.screenY, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Slice and present the custom Anthill artwork cleanly within the bounds of the destination room hole
        if (key === endRoomName) {
            ctx.save();
            ctx.beginPath();
            // 1. INCREASE RADIUS HERE (e.g., changed from 34 to 50)
            ctx.arc(room.screenX, room.screenY, 70, 0, Math.PI * 2);
            ctx.clip();
            if (anthillImage.complete) {
                // 2. INCREASE IMAGE DRAW SIZE TO MATCH (e.g., changed from 100x100 to 140x140)
                // Formula: offset should be -size/2, and dimensions should be size to center it perfectly.
                ctx.drawImage(anthillImage, room.screenX - 70, room.screenY - 70, 140, 140);
            }
            ctx.restore();
            
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 3;
            ctx.beginPath();
            // 3. INCREASE OUTER RING RADIUS TO MATCH THE NEW CLIP RADIUS (changed from 34 to 50)
            ctx.arc(room.screenX, room.screenY, 70, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.name, room.screenX, room.screenY);
    }
}

async function runSimulationEngine() {
    document.getElementById('btnPlay').disabled = true;
    antRegistry = {}; 
    document.querySelectorAll('.gif-ant').forEach(el => el.remove());

    const startNode = rooms[startRoomName];
    const telemetryBox = document.getElementById('statusTelemetry');

    for (let idx = 0; idx < turns.length; idx++) {
        telemetryBox.innerText = `Colony Moving: Step ${idx + 1} / ${turns.length}`;
        
        const actions = turns[idx].split(/\s+/).filter(a => a.startsWith('L'));
        let stepAnimations = [];
        let roomsOccupiedThisTurn = {}; 

        for (let action of actions) {
            const details = action.substring(1).split('-');
            const antId = details[0];
            const targetNodeName = details[1];
            const targetNode = rooms[targetNodeName];

            if (!targetNode) return;

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
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    telemetryBox.innerText = "Simulation complete! All ants arrived safely inside the anthill.";
    document.getElementById('btnPlay').disabled = false;
}

function executeFrameLerp(animations) {
    return new Promise((resolve) => {
        let currentFrame = 0;
        const totalFrames = 80; 

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
                angle += Math.PI; 

                let antEl = document.getElementById(`dom-ant-${item.id}`);
                if (!antEl) {
                    antEl = document.createElement('div');
                    antEl.id = `dom-ant-${item.id}`;
                    antEl.className = 'gif-ant';
                    antEl.innerHTML = `
                        <img src="/static/ant.gif" />
                        <span class="gif-ant-id">A${item.id}</span>
                    `;
                    canvasWrapper.appendChild(antEl);
                }

                // MATHEMATICAL RESPONSIVE COUPLING
                // Translate internal canvas pixels directly into absolute layout percentages
                const percentageX = (liveX / canvas.width) * 100;
                const percentageY = (liveY / canvas.height) * 100;

                // Center position the 48x48px moving element cleanly via CSS vectors
                antEl.style.left = `calc(${percentageX}% - 24px)`;
                antEl.style.top = `calc(${percentageY}% - 24px)`;
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