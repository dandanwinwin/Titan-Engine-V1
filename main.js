import * as THREE from 'three';

// 1. Setup the Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020205); // Very dark blue for eye relief
scene.fog = new THREE.Fog(0x020205, 1, 50); // Fog hides the horizon to reduce eye strain

// 2. Setup Camera and Renderer
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 3. Add a "Moonlight" (Soft light that doesn't glare)
const light = new THREE.DirectionalLight(0x4444ff, 0.5);
light.position.set(10, 20, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x222222));

// 4. The Block Blueprint
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x334455 }); // Soft slate grey

// 5. Build a 100-Block "Titan Spine" automatically
for (let i = 0; i < 100; i++) {
    const block = new THREE.Mesh(geometry, material);
    block.position.set(0, i, -10); // Placed 10 blocks in front of you
    scene.add(block);
}

camera.position.z = 5;
camera.position.y = 2;

// 6. Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle tablet resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
