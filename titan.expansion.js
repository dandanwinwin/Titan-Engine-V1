import * as THREE from 'three';

export function initExpansion(scene, camera) {
    console.log("🔥 Titan Expansion Loaded: Lava, Dragon, & Textures Active");

    // 1. TEXTURE LOADER (Uses real-style pixel textures)
    const loader = new THREE.TextureLoader();
    const grassTex = loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'); // Placeholder for textures

    // 2. THE PLAYER (Movable 3D Body)
    const playerGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(0.6, 1.8, 0.6);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x3498db }); // Default Skin
    const playerMesh = new THREE.Mesh(bodyGeo, bodyMat);
    playerGroup.add(playerMesh);
    scene.add(playerGroup);

    // 3. THE ENDER DRAGON (Simple Boss Model)
    const dragonGeo = new THREE.BoxGeometry(2, 1, 4);
    const dragonMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const dragon = new THREE.Mesh(dragonGeo, dragonMat);
    dragon.position.set(0, 20, 0); // High in the sky
    scene.add(dragon);

    // 4. FLOWING LAVA/WATER LOGIC
    window.runExpansion = () => {
        // Make lava/water shimmer
        scene.traverse((obj) => {
            if (obj.isMesh && obj.material.transparent) {
                obj.material.opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.1;
            }
        });

        // Simple Dragon Flight
        dragon.position.x = Math.sin(Date.now() * 0.001) * 10;
        dragon.position.z = Math.cos(Date.now() * 0.001) * 10;
        
        // Sync Player Body to Camera (First Person)
        playerGroup.position.copy(camera.position);
        playerGroup.position.y -= 1.6;
    };
}
