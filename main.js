import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// 1. SCENE SETUP (Midnight Theme for Eye Relief)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020205); 
scene.fog = new THREE.Fog(0x020205, 10, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 2. CAMERA SETUP (The "Titan View")
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(40, 60, 80); // Positioned to see the whole 100-block height

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 50, 0); // Focuses the camera on the middle of the Titan

// 3. SOFT LIGHTING
const light = new THREE.DirectionalLight(0x4444ff, 0.8);
light.position.set(10, 100, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x222222));

// 4. TITAN MATERIAL (Pixelated Stone Texture)
function createStoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2c3e50'; // Dark Slate
    ctx.fillRect(0, 0, 16, 16);
    for(let i=0; i<40; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
        ctx.fillRect(Math.random()*16, Math.random()*16, 1, 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    return new THREE.MeshLambertMaterial({ map: tex });
}
const stoneMat = createStoneTexture();
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

// 5. THE TITAN BUILDER FUNCTION
function spawnStructure(w, h, d, xO, yO, zO) {
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            for (let z = 0; z < d; z++) {
                const block = new THREE.Mesh(boxGeo, stoneMat);
                block.position.set(x + xO, y + yO, z + zO);
                scene.add(block);
            }
        }
    }
}

// Build 2x3x2 Base
spawnStructure(2, 3, 2, -1, 0, -1);
// Build 100-Block Spine
spawnStructure(1, 100, 1, 0, 3, 0);

// 6. STAR FIELD (Low brightness stars)
const starGeo = new THREE.BufferGeometry();
const starCoords = [];
for(let i=0; i<3000; i++) {
    starCoords.push((Math.random()-0.5)*800, (Math.random()-0.5)*800, (Math.random()-0.5)*800);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0x555555, size: 0.5})));

// 7. ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle Tablet Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
