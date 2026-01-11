import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// --- 1. CORE ENGINE STATE ---
const GameState = {
    mode: 'CREATIVE',
    dimension: 'OVERWORLD',
    health: 20,
    inventory: ['MACE', 'BLOCK', 'KEY'],
    selectedSlot: 0,
    mobs: [],
    worldBlocks: [], // Blocks placed by you
    isFading: false
};

// --- 2. THE MULTIVERSE DICTIONARY ---
const Dimensions = {
    OVERWORLD: { sky: 0x020205, fog: 0x020205, ground: '#2ecc71', accent: '#155d27' },
    NETHER: { sky: 0x1a0505, fog: 0x330000, ground: '#720916', accent: '#3d040b' },
    END: { sky: 0x050008, fog: 0x110015, ground: '#f0e68c', accent: '#c5b358' }
};

// --- 3. SCENE & LIGHTING SETUP ---
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

const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0x222222));

// --- 4. SMART BUILDING & TEXTURES ---
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
function getMat(color, emissive = 0x000000) {
    return new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity: 0.2 });
}

function placeBlock(x, y, z, color, persistent = false) {
    const b = new THREE.Mesh(boxGeo, getMat(color));
    b.position.set(Math.round(x), Math.round(y), Math.round(z));
    scene.add(b);
    if (persistent) {
        GameState.worldBlocks.push({ x, y, z, color });
        localStorage.setItem('titanWorld', JSON.stringify(GameState.worldBlocks));
    }
    return b;
}

// --- 5. STRUCTURE GENERATOR (FORTRESSES & TITAN) ---
function buildDimension(dimKey) {
    // Clear old world (except your personal blocks)
    while(scene.children.length > 3) scene.remove(scene.children[scene.children.length-1]);
    
    const d = Dimensions[dimKey];
    scene.background = new THREE.Color(d.sky);
    scene.fog = new THREE.Fog(d.sky, 10, 200);

    // Generate Biome Floor
    for(let x=-25; x<25; x+=2) {
        for(let z=-25; z<25; z+=2) {
            placeBlock(x, -1, z, d.ground);
        }
    }

    // Spawn Dimension-Specific Structure
    if(dimKey === 'NETHER') {
        for(let i=0; i<20; i++) placeBlock(i-10, 5, 0, d.accent); // Fortress Bridge
    } else if(dimKey === 'OVERWORLD') {
        for(let i=0; i<100; i++) placeBlock(0, i, 0, '#2c3e50'); // 100-Block Titan
    }
}

// --- 6. MACE SHOCKWAVE & PARTICLES ---
function maceSmash(pos) {
    const ringGeo = new THREE.TorusGeometry(2, 0.1, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    let scale = 1;
    const interval = setInterval(() => {
        scale += 0.2;
        ring.scale.set(scale, scale, 1);
        ring.material.opacity -= 0.05;
        if (ring.material.opacity <= 0) {
            scene.remove(ring);
            clearInterval(interval);
        }
    }, 30);
}

// --- 7. TOUCH INPUT & DIMENSION FADE ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 3) { // 3 Fingers = Warp
        const dims = Object.keys(Dimensions);
        let next = dims[(dims.indexOf(GameState.dimension) + 1) % dims.length];
        buildDimension(next);
        GameState.dimension = next;
        return;
    }

    mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        const obj = intersects[0];
        if (GameState.selectedSlot === 0) { // MACE
            maceSmash(obj.point);
        } else if (GameState.selectedSlot === 1) { // BUILD
            const p = obj.point.add(obj.face.normal.divideScalar(2));
            placeBlock(p.x, p.y, p.z, '#ffffff', true);
        }
    }
});

// --- 8. INITIALIZE & ANIMATE ---
buildDimension('OVERWORLD');

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Void Death Check
    if (camera.position.y < -30) {
        alert("Fell out of world!");
        camera.position.set(50,60,50);
    }
    
    renderer.render(scene, camera);
}
animate();
// This connects the HTML buttons to the JavaScript engine
window.updateGameSlot = (index) => {
    GameState.selectedSlot = index;
    console.log("Holding: " + GameState.inventory[index]);
};
