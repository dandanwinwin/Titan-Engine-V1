import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { generateChunk } from './worldGen.js';
import { processCommand } from './commands.js';

// --- GAME STATE ---
const GameState = {
    mode: 'CREATIVE',
    slot: 0,
    time: 0.5 // 0 to 1 (Day/Night cycle)
};

// --- SETUP SCENE ---
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

// --- LIGHTING ---
const ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(50, 100, 50);
scene.add(sun);

// --- WORLD GENERATION ---
// Generate a 2x2 chunk area (32x32 blocks)
generateChunk(scene, 0, 0);
generateChunk(scene, 16, 0);
generateChunk(scene, 0, 16);
generateChunk(scene, 16, 16);

// --- INPUT & INTERACTION ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('touchstart', (e) => {
    if(e.touches.length > 1) return; // Prevent accidental placement on zoom

    mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        const hit = intersects[0];
        const obj = hit.object;

        // Command Block Activation
        if (obj.userData.isCommandBlock) {
            processCommand(obj.userData.command, GameState, scene, camera);
            return;
        }

        // Place or Break
        if (GameState.slot === 0) { // Sword/Hand -> Break
             scene.remove(obj);
        } else { // Place
            const p = hit.point.add(hit.face.normal.divideScalar(2));
            const geo = new THREE.BoxGeometry(1,1,1);
            let color = 0x8e44ad; // Default
            let isCmd = false;

            if (GameState.slot === 2) color = 0x3498db; // Water
            if (GameState.slot === 3) { color = 0xff7f00; isCmd = true; } // Command Block

            const mat = new THREE.MeshLambertMaterial({ color: color, transparent: (GameState.slot===2), opacity: (GameState.slot===2?0.6:1) });
            const b = new THREE.Mesh(geo, mat);
            b.position.set(Math.round(p.x), Math.round(p.y), Math.round(p.z));
            
            if (isCmd) {
                b.userData = { isCommandBlock: true, command: "/time set night" }; // Default command
                alert("Placed Command Block! (Defaults to Night toggle)");
            }

            scene.add(b);
        }
    }
});

// --- UI BRIDGES ---
window.updateSlot = (i) => { GameState.slot = i; };
window.sendChat = (txt) => { processCommand(txt, GameState, scene, camera); };

// --- LOOP ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Debug Info
    const x = Math.round(camera.position.x);
    const z = Math.round(camera.position.z);
    document.getElementById('debug-coords').innerText = `XYZ: ${x} / ${Math.round(camera.position.y)} / ${z}`;

    renderer.render(scene, camera);
}
animate();
