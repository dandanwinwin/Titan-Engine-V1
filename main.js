import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// --- 1. THE CONNECTORS (Importing your Expansion) ---
import { initExpansion } from './titan_expansion.js';

const GameState = {
    slot: 0,
    time: 0.5,
    worldBlocks: []
};

// --- 2. CORE SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(16, 20, 16);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 3. THE EXPANSION BRIDGE ---
// This sends the scene and camera to your other file
const expansionTools = initExpansion(scene, camera);

// --- 4. WORLD GENERATION ---
const blockGeo = new THREE.BoxGeometry(1, 1, 1);
const grassMat = new THREE.MeshLambertMaterial({ color: 0x2ecc71 });
const stoneMat = new THREE.MeshLambertMaterial({ color: 0x95a5a6 });

function generateWorld() {
    for (let x = 0; x < 32; x++) {
        for (let z = 0; z < 32; z++) {
            const h = Math.floor(Math.sin(x * 0.1) * 2 + Math.cos(z * 0.1) * 2);
            const block = new THREE.Mesh(blockGeo, h > 0 ? grassMat : stoneMat);
            block.position.set(x, h, z);
            scene.add(block);
        }
    }
}
generateWorld();

// --- 5. COMMANDS & CHAT ---
window.sendChat = (msg) => {
    const cmd = msg.toLowerCase();
    // Forwarding to expansion if needed
    if (cmd.startsWith('/time')) {
        const isNight = cmd.includes('night');
        scene.background.set(isNight ? 0x050510 : 0x87CEEB);
        scene.fog.color.set(isNight ? 0x050510 : 0x87CEEB);
    }
    // Logic for your Robot Cats can go here or in mods.js
};

// --- 6. LIGHTING ---
scene.add(new THREE.AmbientLight(0x606060));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(50, 100, 50);
scene.add(sun);

// --- 7. THE ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    
    // RUN THE EXPANSION LOGIC (Dragon flight, Player movement)
    if (expansionTools && expansionTools.update) {
        expansionTools.update();
    }

    controls.update();
    renderer.render(scene, camera);
}

window.updateSlot = (i) => GameState.slot = i;
animate();
import { launchPrismarine } from './prismarine_bridge.js';

// Launch the professional client
launchPrismarine();
