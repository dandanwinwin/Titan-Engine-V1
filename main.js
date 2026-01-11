import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// --- 1. GAME SETTINGS & SAVE DATA ---
const GameState = {
    mode: 'CREATIVE',
    inventory: ['MACE', 'BLOCK', 'KEY'],
    selectedSlot: 0,
    mobs: [],
    worldBlocks: [] // To store saved blocks
};

// --- 2. ENGINE SETUP ---
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(50, 60, 50);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 50, 0);

// --- 3. DYNAMIC SKY (DAY/NIGHT) & LIGHTING ---
const ambientLight = new THREE.AmbientLight(0x222222);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(sunLight);

function updateEnvironment(time) {
    const cycle = (Math.sin(time * 0.0001) + 1) / 2; // Slow cycle
    // Interpolate colors between Midnight and Sunset for eye relief
    const skyColor = new THREE.Color().lerpColors(
        new THREE.Color(0x020205), // Night
        new THREE.Color(0x2c1a05), // Warm Sunset
        cycle
    );
    scene.background = skyColor;
    scene.fog = new THREE.Fog(skyColor, 20, 200);
    sunLight.intensity = cycle;
}

// --- 4. MATERIALS & SAVING LOGIC ---
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const stoneMat = createTexture('#2c3e50');

function createTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 16, 16);
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    return new THREE.MeshLambertMaterial({ map: tex });
}

// SAVE SYSTEM: Stores the 100-block Titan in your tablet's memory
function saveWorld() {
    const data = GameState.worldBlocks.map(b => ({ x: b.x, y: b.y, z: b.z }));
    localStorage.setItem('titanWorld', JSON.stringify(data));
}

function loadWorld() {
    const saved = localStorage.getItem('titanWorld');
    if (saved) {
        const blocks = JSON.parse(saved);
        blocks.forEach(pos => placeBlock(pos.x, pos.y, pos.z, false));
    }
}

function placeBlock(x, y, z, shouldSave = true) {
    const b = new THREE.Mesh(boxGeo, stoneMat);
    b.position.set(x, y, z);
    scene.add(b);
    if (shouldSave) {
        GameState.worldBlocks.push({ x, y, z });
        saveWorld();
    }
}

// --- 5. INITIAL GENERATION ---
// Titan Base (2x3x2)
for(let x=-1; x<1; x++) for(let y=0; y<3; y++) for(let z=-1; z<1; z++) placeBlock(x,y,z, false);
// 100-Block Spine
for(let i=3; i<103; i++) placeBlock(0, i, 0, false);

loadWorld(); // Load any extra blocks you've built

// --- 6. TOUCH & COMBAT ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('touchstart', (e) => {
    mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(scene.children);
    if (hits.length > 0) {
        const hit = hits[0];
        if (GameState.selectedSlot === 0) { // MACE: Smash
            // Mob removal logic here (from previous code)
        } else if (GameState.selectedSlot === 1) { // BLOCK: Build
            const pos = hit.point.add(hit.face.normal.divideScalar(2));
            placeBlock(Math.round(pos.x), Math.round(pos.y), Math.round(pos.z));
        }
    }
});

// --- 7. ANIMATION LOOP ---
function animate(time) {
    requestAnimationFrame(animate);
    updateEnvironment(time); // Slowly changes sky color
    controls.update();
    renderer.render(scene, camera);
}

// --- 8. UI SYNC ---
document.querySelectorAll('.slot').forEach((slot, i) => {
    slot.addEventListener('touchstart', () => {
        document.querySelectorAll('.slot').forEach(s => s.style.borderColor = "#444");
        slot.style.borderColor = "#8e44ad";
        GameState.selectedSlot = i;
    });
});

animate();
