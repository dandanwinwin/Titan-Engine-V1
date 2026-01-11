import { initExpansion } from './titan_expansion.js';
import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// --- 1. WORLD GENERATION LOGIC (Formerly worldGen.js) ---
const MATERIALS = {
    GRASS: new THREE.MeshLambertMaterial({ color: 0x27ae60 }),
    STONE: new THREE.MeshLambertMaterial({ color: 0x7f8c8d }),
    WATER: new THREE.MeshLambertMaterial({ color: 0x3498db, transparent: true, opacity: 0.6 }),
    SAND: new THREE.MeshLambertMaterial({ color: 0xf1c40f })
};
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

function generateChunk(scene, startX, startZ) {
    for (let x = startX; x < startX + 16; x++) {
        for (let z = startZ; z < startZ + 16; z++) {
            let height = Math.floor((Math.sin(x * 0.15) + Math.cos(z * 0.15)) * 3);
            let type = 'GRASS';
            if (height < -1) type = 'WATER';
            else if (height === -1) type = 'SAND';

            const mesh = new THREE.Mesh(boxGeo, MATERIALS[type]);
            mesh.position.set(x, type === 'WATER' ? -1.5 : height, z);
            scene.add(mesh);
            
            if (height > -5 && type !== 'WATER') {
                const stone = new THREE.Mesh(boxGeo, MATERIALS.STONE);
                stone.position.set(x, mesh.position.y - 1, z);
                scene.add(stone);
            }
        }
    }
}

// --- 2. COMMAND LOGIC (Formerly commands.js) ---
function processCommand(text, gameState, scene, camera) {
    const history = document.getElementById('chat-history');
    const line = document.createElement('div');
    line.innerText = `[Player] ${text}`;
    history.appendChild(line);

    if (!text.startsWith('/')) return;
    const parts = text.split(' ');
    const cmd = parts[0].toLowerCase();

    if (cmd === '/time') {
        const val = parts[2];
        const color = val === 'day' ? 0x87CEEB : 0x050510;
        scene.background.setHex(color);
        scene.fog.color.setHex(color);
    } else if (cmd === '/tp') {
        camera.position.set(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
    }
}

// --- 3. MAIN ENGINE ---
const GameState = { mode: 'CREATIVE', slot: 0 };
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 20, 80);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 150);
camera.position.set(16, 15, 16);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(16, 0, 16);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0x404040));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(50, 100, 50);
scene.add(sun);

// Generate World
for(let x=0; x<32; x+=16) for(let z=0; z<32; z+=16) generateChunk(scene, x, z);

// Interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('touchstart', (e) => {
    if(e.touches.length > 1) return;
    mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(scene.children);
    if (hits.length > 0) {
        const hit = hits[0];
        if (GameState.slot === 0) {
            scene.remove(hit.object);
        } else {
            const p = hit.point.add(hit.face.normal.divideScalar(2));
            const color = GameState.slot === 2 ? 0x3498db : (GameState.slot === 3 ? 0xff7f00 : 0x8e44ad);
            const b = new THREE.Mesh(boxGeo, new THREE.MeshLambertMaterial({color, transparent: GameState.slot===2, opacity: 0.6}));
            b.position.set(Math.round(p.x), Math.round(p.y), Math.round(p.z));
            scene.add(b);
        }
    }
});

window.updateSlot = (i) => { GameState.slot = i; };
window.sendChat = (txt) => { processCommand(txt, GameState, scene, camera); };

function animate() {if (window.runExpansion) window.runExpansion();
    requestAnimationFrame(animate);
    controls.update();
    const debug = document.getElementById('debug-coords');
    if(debug) debug.innerText = `XYZ: ${Math.round(camera.position.x)} / ${Math.round(camera.position.y)} / ${Math.round(camera.position.z)}`;
    renderer.render(scene, camera);
}
animate();
// --- THE MOD LOADER ---
async function loadExternalMods() {
    try {
        const modModule = await import('./mods.js');
        if (modModule.init) {
            modModule.init(scene, GameState, processCommand);
            console.log("✅ Mod Loaded Successfully!");
        }
    } catch (e) {
        console.log("No mods found or error in mod file. Skipping.");
    }
}

// Run the loader
loadExternalMods();
