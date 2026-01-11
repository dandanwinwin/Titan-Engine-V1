import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// IMPORTANT: We use a 'try' block to catch errors so the screen doesn't stay black
try {
    const { generateChunk } = await import('./worldGen.js');
    const { processCommand } = await import('./commands.js');

    // --- GAME STATE ---
    const GameState = {
        mode: 'CREATIVE',
        slot: 0,
        time: 0.5 
    };

    // --- SETUP SCENE ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); 
    scene.fog = new THREE.Fog(0x87CEEB, 20, 80);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 150);
    camera.position.set(16, 15, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(16, 0, 16);
    controls.enableDamping = true;

    // --- LIGHTING ---
    scene.add(new THREE.AmbientLight(0x404040));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(50, 100, 50);
    scene.add(sun);

    // --- WORLD GENERATION ---
    generateChunk(scene, 0, 0);
    generateChunk(scene, 16, 0);
    generateChunk(scene, 0, 16);
    generateChunk(scene, 16, 16);

    // --- INPUT ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('touchstart', (e) => {
        if(e.touches.length > 1) return;
        mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            const hit = intersects[0];
            const obj = hit.object;

            if (obj.userData.isCommandBlock) {
                processCommand(obj.userData.command, GameState, scene, camera);
                return;
            }

            if (GameState.slot === 0) {
                 scene.remove(obj);
            } else {
                const p = hit.point.add(hit.face.normal.divideScalar(2));
                const geo = new THREE.BoxGeometry(1,1,1);
                let color = 0x8e44ad;
                let isCmd = false;

                if (GameState.slot === 2) color = 0x3498db; 
                if (GameState.slot === 3) { color = 0xff7f00; isCmd = true; } 

                const mat = new THREE.MeshLambertMaterial({ 
                    color: color, 
                    transparent: (GameState.slot===2), 
                    opacity: (GameState.slot===2?0.6:1) 
                });
                const b = new THREE.Mesh(geo, mat);
                b.position.set(Math.round(p.x), Math.round(p.y), Math.round(p.z));
                
                if (isCmd) {
                    b.userData = { isCommandBlock: true, command: "/time set night" };
                }
                scene.add(b);
            }
        }
    });

    window.updateSlot = (i) => { GameState.slot = i; };
    window.sendChat = (txt) => { processCommand(txt, GameState, scene, camera); };

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        const debug = document.getElementById('debug-coords');
        if(debug) {
            debug.innerText = `XYZ: ${Math.round(camera.position.x)} / ${Math.round(camera.position.y)} / ${Math.round(camera.position.z)}`;
        }
        renderer.render(scene, camera);
    }
    animate();

} catch (error) {
    console.error("Game Load Error:", error);
    // This displays the error on your tablet screen so you can see it!
    document.body.innerHTML = `<div style="color:white; padding:20px;"><h1>Game Error</h1><p>${error.message}</p></div>`;
}
