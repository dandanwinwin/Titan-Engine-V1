import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// 1. --- ADVANCED GAME STATE ---
const GameState = {const GameState = {
    mode: 'CREATIVE',
    health: 20,
    inventory: ['MACE', 'BLOCK', 'KEY'],
    selectedSlot: 0, // This tracks which item is active
    mobs: []
};
    mode: 'CREATIVE', 
    health: 20,
    inventory: ['Mace', 'Copper Block', 'Trial Key'],
    selectedItem: 0,
    mobs: [],
    // Command Block Memory
    commandHistory: "/spawn_titan 100",
};

// 2. --- ENGINE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020205); 
scene.fog = new THREE.Fog(0x020205, 10, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(40, 60, 40);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 3. --- THE MOB DICTIONARY (All Mobs Logic) ---
const MobTypes = {
    BREEZE: { color: 0xadd8e6, size: 0.8, behavior: 'HOSTILE', shape: 'OCTA' },
    ARMADILLO: { color: 0x8b4513, size: 0.6, behavior: 'PASSIVE', shape: 'BOX' },
    TITAN_GUARD: { color: 0x2c3e50, size: 2.5, behavior: 'NEUTRAL', shape: 'BOX' },
    BOGGED: { color: 0x556b2f, size: 0.9, behavior: 'HOSTILE', shape: 'BOX' }
};

function spawnMob(typeKey, x, y, z) {
    const data = MobTypes[typeKey];
    let geo;
    if (data.shape === 'OCTA') geo = new THREE.OctahedronGeometry(data.size);
    else geo = new THREE.BoxGeometry(data.size, data.size, data.size);
    
    const mat = new THREE.MeshLambertMaterial({ color: data.color });
    const mob = new THREE.Mesh(geo, mat);
    mob.position.set(x, y, z);
    
    // AI Stats
    mob.userData = { 
        type: typeKey, 
        behavior: data.behavior, 
        hp: (data.behavior === 'HOSTILE') ? 20 : 10,
        velocity: new THREE.Vector3((Math.random()-0.5)*0.1, 0, (Math.random()-0.5)*0.1)
    };
    
    scene.add(mob);
    GameState.mobs.push(mob);
}

// 4. --- COMMAND BLOCK SYSTEM ---
function runCommand(cmd) {
    if (cmd.startsWith("/spawn")) {
        const parts = cmd.split(" ");
        const type = parts[1].toUpperCase();
        if (MobTypes[type]) {
            spawnMob(type, 0, 5, 0);
            return `Spawned ${type}`;
        }
    }
    if (cmd.startsWith("/gamemode")) {
        GameState.mode = cmd.split(" ")[1].toUpperCase();
        return `Mode changed to ${GameState.mode}`;
    }
    return "Unknown Command";
}

// 5. --- TRIAL CHAMBER GENERATOR ---
const copperMat = new THREE.MeshLambertMaterial({color: 0xd2691e});
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

function buildRoom(xO, yO, zO, size) {
    for(let x=0; x<size; x++) {
        for(let z=0; z<size; z++) {
            // Floor and Ceiling
            const floor = new THREE.Mesh(boxGeo, copperMat);
            floor.position.set(x+xO, yO, z+zO);
            scene.add(floor);
        }
    }
}

// 6. --- INITIALIZE WORLD ---
buildRoom(-10, -5, -10, 20); // Underground Trial Room
spawnMob('BREEZE', 5, -4, 5);
spawnMob('ARMADILLO', -5, 1, -5);

// Titan Base (2x3x2)
const stoneMat = new THREE.MeshLambertMaterial({color: 0x34495e});
for(let x=0; x<2; x++) for(let y=0; y<3; y++) for(let z=0; z<2; z++) {
    const b = new THREE.Mesh(boxGeo, stoneMat);
    b.position.set(x, y, z);
    scene.add(b);
}
// 100-Block Spine
for(let i=3; i<103; i++) {
    const b = new THREE.Mesh(boxGeo, stoneMat);
    b.position.set(0, i, 0);
    scene.add(b);
}

// 7. --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    
    // AI Movement Logic
    GameState.mobs.forEach(mob => {
        mob.position.add(mob.userData.velocity);
        if (mob.userData.behavior === 'HOSTILE') {
            mob.rotation.y += 0.1; // Hostile mobs spin (angry)
        }
        // Collision with invisible walls
        if (Math.abs(mob.position.x) > 20) mob.userData.velocity.x *= -1;
    });

    controls.update();
    renderer.render(scene, camera);
}
animate();
// --- 9. INTERACTION & BUILDING ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('touchstart', (event) => {
    // Calculate touch position for the raycaster
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const obj = intersects[0];
        
        // If Creative: Place a block on the face we touched
        if (GameState.mode === 'CREATIVE') {
            const pos = obj.point.add(obj.face.normal.divideScalar(2));
            const newBlock = new THREE.Mesh(boxGeo, stoneMat);
            newBlock.position.set(Math.round(pos.x), Math.round(pos.y), Math.round(pos.z));
            scene.add(newBlock);
        } 
        
        // If it's a Command Block (checking by position)
        if (obj.object.position.y < 0) {
            let cmd = prompt("Enter Command:", GameState.commandHistory);
            if (cmd) {
                const result = runCommand(cmd);
                alert(result);
                GameState.commandHistory = cmd;
            }
        }
    }
});

// --- 10. SIMPLE PHYSICS (Gravity) ---
let yVelocity = 0;
const gravity = -0.01;
const jumpStrength = 0.2;

function applyPhysics() {
    if (GameState.mode === 'SURVIVAL' || GameState.mode === 'HARDCORE') {
        yVelocity += gravity;
        camera.position.y += yVelocity;

        // Ground collision (Stay above the trial chamber floor)
        if (camera.position.y < 2) {
            camera.position.y = 2;
            yVelocity = 0;
        }
    }
}

// Update the animate loop one last time
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    applyPhysics(); // Apply gravity
    
    // Smoothly spin the Breeze mobs
    GameState.mobs.forEach(mob => {
        mob.rotation.y += 0.05;
    });
    
    renderer.render(scene, camera);
}
