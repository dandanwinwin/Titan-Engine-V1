import * as THREE from 'three';

// --- 1. BIOME PALETTE (Eye-Friendly Colors) ---
const BIOMES = {
    WATER: { color: 0x2980b9, shine: 0.8 }, // Deep Blue
    LAVA: { color: 0xc0392b, shine: 0.5 },  // Muted Red (Not bright orange)
    SAND: { color: 0xe67e22, shine: 0.0 },  // Darker Sand
    GRASS: { color: 0x27ae60, shine: 0.0 }, // Forest Green
    SNOW: { color: 0xbdc3c7, shine: 0.2 },  // Soft White
    STONE: { color: 0x7f8c8d, shine: 0.0 }  // Grey
};

// --- 2. THE GENERATOR ---
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const materials = {};

// Create materials once to save memory
for (const key in BIOMES) {
    materials[key] = new THREE.MeshLambertMaterial({ 
        color: BIOMES[key].color,
        emissive: (key === 'LAVA') ? 0x550000 : 0x000000 // Lava glows dimly
    });
}

// Simple Pseudo-Random Noise (Making hills)
function getNoise(x, z) {
    return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 4 + 
           Math.sin(x * 0.3) * Math.sin(z * 0.3) * 2;
}

// --- 3. PUBLIC FUNCTION TO BUILD CHUNKS ---
export function generateTerrain(scene, centerX, centerZ, size) {
    console.log("Generating Biome Chunk...");
    
    for (let x = centerX - size; x < centerX + size; x++) {
        for (let z = centerZ - size; z < centerZ + size; z++) {
            
            // Calculate Height
            let y = Math.floor(getNoise(x, z));
            
            // Determine Block Type based on Height (Y)
            let type = 'GRASS';
            if (y < -2) type = 'WATER';
            else if (y === -2) type = 'SAND'; // Beach
            else if (y > 4) type = 'SNOW';   // Mountain peaks
            
            // Random Lava Pools (Rare)
            if (y < -3 && Math.random() > 0.95) type = 'LAVA';

            // Place the block
            const mat = materials[type];
            const block = new THREE.Mesh(boxGeo, mat);
            
            // Fluid Logic: Water/Lava is lower than solid ground
            let yPos = y;
            if (type === 'WATER' || type === 'LAVA') yPos = -2.5; 
            
            block.position.set(x, yPos, z);
            scene.add(block);
            
            // Add Stone underneath
            if (y > -3) {
                const stone = new THREE.Mesh(boxGeo, materials['STONE']);
                stone.position.set(x, yPos - 1, z);
                scene.add(stone);
            }
        }
    }
}
