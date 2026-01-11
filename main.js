import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// 1. --- GAME STATE & MODES ---
const GameState = {
    mode: 'CREATIVE', // Options: 'SURVIVAL', 'CREATIVE', 'HARDCORE'
    health: 20,
    maxHealth: 20,
    commandBlockText: "/spawn breeze",
    mobs: []
};

// 2. --- SCENE & RENDERER SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020205); // Midnight Blue
scene.fog = new THREE.Fog(0x020205, 20, 150); // Softens the horizon

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimizes for tablet battery
document.body.appendChild(renderer.domElement);

// 3. --- CAMERA & TOUCH CONTROLS ---
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(50, 60, 50);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.05;
controls.target.set(0, 50, 0); // Focus on the middle of the 100-block Titan

// 4. --- LIGHTING ---
const sunLight = new THREE.DirectionalLight(0x4444ff, 0.7);
sunLight.position.set(10, 100, 10);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0x111111));

// 5. --- TEXTURE & MATERIAL CREATOR ---
function createPixelTexture(hexColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, 16, 16);
    for(let i=0; i<32; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
        ctx.fillRect(Math.random()*16, Math.random()*16, 1, 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter; // Classic pixel look
    return new THREE.MeshLambertMaterial({ map: tex });
}

const stoneMat = createPixelTexture('#2c3e50'); // Titan Stone
const copperMat = createPixelTexture('#d2691e'); // Trial Chamber Copper
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

// 6. --- BUILDER FUNCTIONS ---

// Titan Builder
function spawnStructure(w, h, d, xO, yO, zO, mat) {
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            for (let z = 0; z < d; z++) {
                const block = new THREE.Mesh(boxGeo, mat);
                block.position.set(x + xO, y + yO, z + zO);
                scene.add(block);
            }
        }
    }
}

// Trial Chamber Generator (1.21 Style)
function spawnTrialChamber(xO, yO, zO) {
    spawnStructure(10, 1, 10, xO, yO, zO, copperMat); // Floor
    spawnStructure(10, 5, 1, xO, yO, zO, copperMat); // Wall
    // Add a "Trial Spawner" block
    const spawner = new THREE.Mesh(boxGeo, createPixelTexture('#34495e'));
    spawner.position.set(xO+5, yO+1, zO+5);
    scene.add(spawner);
}

// Mob Spawner (Breeze/Monsters)
function spawnMob(x, y, z) {
    const mobGeo = new THREE.OctahedronGeometry(0.7);
    const mobMat = new THREE.MeshBasicMaterial({ color: 0xadd8e6, wireframe: true });
    const mob = new THREE.Mesh(mobGeo, mobMat);
    mob.position.set(x, y, z);
    mob.velocity = new THREE.Vector3((Math.random()-0.5)*0.05, 0, (Math.random()-0.5)*0.05);
    scene.add(mob);
    GameState.mobs.push(mob);
}

// 7. --- INITIAL WORLD GENERATION ---
// Build Titan Base (2x3x2)
spawnStructure(2, 3, 2, -1, 0, -1, stoneMat);
// Build 100-Block Spine
spawnStructure(1, 100, 1, 0, 3, 0, stoneMat);
// Build Trial Chamber underground
spawnTrialChamber(-5, -10, -5);
// Spawn Initial Mobs
spawnMob(5, 2, 5);
spawnMob(-5, 2, -5);

// 8. --- ANIMATION & PHYSICS LOOP ---
function animate() {
    requestAnimationFrame(animate);

    // Update Mobs AI
    GameState.mobs.forEach(mob => {
        mob.position.add(mob.velocity);
        mob.rotation.y += 0.02; // Breeze spinning effect
        if(Math.abs(mob.position.x) > 20) mob.velocity.x *= -1;
        if(Math.abs(mob.position.z) > 20) mob.velocity.z *= -1;
    });

    controls.update();
    renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
console.log("Titan Engine 1.21 Loaded. Mode: " + GameState.mode);
