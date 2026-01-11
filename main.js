import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// --- 1. GAME SETTINGS & INVENTORY ---
const GameState = {
    mode: 'CREATIVE',
    health: 20,
    inventory: ['MACE', 'BLOCK', 'KEY'],
    selectedSlot: 0,
    mobs: []
};

// --- 2. ENGINE SETUP (EYE-FRIENDLY DARK THEME) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020205); // Midnight Blue
scene.fog = new THREE.Fog(0x020205, 10, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(50, 60, 50);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 50, 0);

const light = new THREE.DirectionalLight(0x4444ff, 0.8);
light.position.set(10, 100, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x222222));

// --- 3. MATERIALS & TEXTURES ---
function createTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 16, 16);
    for(let i=0; i<30; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
        ctx.fillRect(Math.random()*16, Math.random()*16, 1, 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    return new THREE.MeshLambertMaterial({ map: tex });
}

const stoneMat = createTexture('#2c3e50');
const copperMat = createTexture('#d2691e');
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

// --- 4. BUILDER FUNCTIONS ---
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

function spawnMob(x, y, z) {
    const mobGeo = new THREE.OctahedronGeometry(0.7);
    const mobMat = new THREE.MeshBasicMaterial({ color: 0xadd8e6, wireframe: true });
    const mob = new THREE.Mesh(mobGeo, mobMat);
    mob.position.set(x, y, z);
    mob.userData = { velocity: new THREE.Vector3((Math.random()-0.5)*0.1, 0, (Math.random()-0.5)*0.1) };
    scene.add(mob);
    GameState.mobs.push(mob);
}

function createSmokePoof(pos) {
    const pGeo = new THREE.SphereGeometry(0.2, 4, 4);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x777777, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 8; i++) {
        const p = new THREE.Mesh(pGeo, pMat);
        p.position.copy(pos);
        scene.add(p);
        const dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5);
        let life = 0;
        const timer = setInterval(() => {
            p.position.add(dir.multiplyScalar(1.1));
            p.scale.multiplyScalar(0.9);
            if (++life > 20) { scene.remove(p); clearInterval(timer); }
        }, 30);
    }
}

// --- 5. INITIAL WORLD LOAD ---
spawnStructure(2, 3, 2, -1, 0, -1, stoneMat); // Base
spawnStructure(1, 100, 1, 0, 3, 0, stoneMat); // 100-Block Spine
spawnStructure(10, 1, 10, -5, -10, -5, copperMat); // Trial Floor
spawnMob(5, 2, 5);
spawnMob(-5, 2, -5);

// --- 6. TOUCH INTERACTION (ATTACK & BUILD) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('touchstart', (e) => {
    mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (GameState.selectedSlot === 0) { // MACE MODE
        const hits = raycaster.intersectObjects(GameState.mobs);
        if (hits.length > 0) {
            const mob = hits[0].object;
            createSmokePoof(mob.position);
            scene.remove(mob);
            GameState.mobs = GameState.mobs.filter(m => m !== mob);
        }
    } else if (GameState.selectedSlot === 1) { // BUILD MODE
        const hits = raycaster.intersectObjects(scene.children);
        if (hits.length > 0) {
            const hit = hits[0];
            const pos = hit.point.add(hit.face.normal.divideScalar(2));
            const b = new THREE.Mesh(boxGeo, stoneMat);
            b.position.set(Math.round(pos.x), Math.round(pos.y), Math.round(pos.z));
            scene.add(b);
        }
    }
});

// --- 7. HOTBAR LOGIC ---
document.querySelectorAll('.slot').forEach((slot, i) => {
    slot.addEventListener('touchstart', () => {
        document.querySelectorAll('.slot').forEach(s => s.style.borderColor = "#444");
        slot.style.borderColor = "#8e44ad";
        GameState.selectedSlot = i;
    });
});

// --- 8. ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    GameState.mobs.forEach(mob => {
        mob.position.add(mob.userData.velocity);
        mob.rotation.y += 0.05;
        if(Math.abs(mob.position.x) > 20) mob.userData.velocity.x *= -1;
    });

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
