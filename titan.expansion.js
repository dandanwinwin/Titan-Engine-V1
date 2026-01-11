import * as THREE from 'three';

export function initExpansion(scene, camera) {
    console.log("💎 Titan Expansion: Textures & Skins Active");

    // 1. REAL MINECRAFT TEXTURE LOADER
    const loader = new THREE.TextureLoader();
    // Using high-quality pixel art placeholders for grass, water, and lava
    const grassTex = loader.load('https://vazgriz.com/wp-content/uploads/2018/11/grass_top.png');
    const waterTex = loader.load('https://vazgriz.com/wp-content/uploads/2018/11/water_still.png');
    const lavaTex = loader.load('https://vazgriz.com/wp-content/uploads/2018/11/lava_still.png');

    // 2. FLOWING LIQUIDS SETUP
    const waterMat = new THREE.MeshStandardMaterial({ 
        map: waterTex, 
        transparent: true, 
        opacity: 0.7 
    });
    
    const lavaMat = new THREE.MeshStandardMaterial({ 
        map: lavaTex, 
        emissive: 0xff4500, 
        emissiveIntensity: 0.5 
    });

    // 3. CUSTOMIZABLE PLAYER SKIN
    // You can change the 'color' to change your skin!
    const playerGroup = new THREE.Group();
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.3), new THREE.MeshStandardMaterial({ color: 0x3498db })); // Shirt color
    
    head.position.y = 0.6;
    playerGroup.add(head, body);
    scene.add(playerGroup);

    // 4. THE ENDER DRAGON
    const dragon = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 4), 
        new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    scene.add(dragon);

    // --- RETURN THE UPDATE LOOP ---
    return {
        update: () => {
            const time = Date.now() * 0.001;

            // Flowing Logic: Moves the texture coordinates to simulate flow
            waterTex.offset.y += 0.001;
            lavaTex.offset.y += 0.0005;

            // Player Follow Logic
            playerGroup.position.copy(camera.position);
            playerGroup.position.y -= 1.2;
            playerGroup.rotation.y = camera.rotation.y;

            // Dragon AI
            dragon.position.set(
                Math.sin(time) * 20 + 16,
                25 + Math.sin(time * 0.5) * 5,
                Math.cos(time) * 20 + 16
            );
            dragon.lookAt(16, 25, 16);
        }
    };
}
