// --- 1. THE BRIDGE CONNECTORS ---
import { launchPrismarine } from './prismarine_bridge.js';
import { initExpansion } from './titan_expansion.js';

// This launches the professional engine immediately
launchPrismarine();

import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

/**
 * TITAN ENGINE v1.22
 * This core stays active to handle your Custom UI and Mods
 */

const GameState = { slot: 0 };
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Alpha allows overlay

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. INITIALIZE EXPANSION ---
// This handles your Ender Dragon and custom player body
const expansion = initExpansion(scene, camera);

// --- 3. CUSTOM COMMANDS ---
window.sendChat = (msg) => {
    const cmd = msg.toLowerCase();
    console.log("Titan Command Received:", cmd);
    
    // You can add your Robot Cat craft logic here
    if (cmd === 'craft robot cat') {
        notify("Attempting to craft Robot Cat in Titan layer...");
        // Logic to spawn cat in scene
    }
};

function notify(text) {
    const h = document.getElementById('chat-history');
    if(h) h.innerHTML += `<div style="color:#55FF55">[TITAN] ${text}</div>`;
}

// --- 4. ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    
    // Run Dragon/Expansion logic if it exists
    if (expansion && expansion.update) {
        expansion.update();
    }

    renderer.render(scene, camera);
}

// Start the Titan layer
animate();

// Sync UI Slots
window.updateSlot = (i) => {
    GameState.slot = i;
    console.log("Selected Slot:", i);
};
