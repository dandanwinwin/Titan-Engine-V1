import * as THREE from 'three';

// --- 1. MOB SYSTEM ---
export class Mob {
    constructor(scene, x, y, z, type = 'BREEZE') {
        this.type = type;
        const geo = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
        const mat = new THREE.MeshLambertMaterial({ 
            color: type === 'BREEZE' ? 0xadd8e6 : 0x556b2f,
            transparent: true,
            opacity: 0.8
        });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.set(x, y, z);
        scene.add(this.mesh);
        this.velocity = new THREE.Vector3(0, 0, 0);
    }

    update() {
        // Simple "Wander" AI
        this.mesh.position.x += Math.sin(Date.now() * 0.001) * 0.02;
        this.mesh.position.z += Math.cos(Date.now() * 0.001) * 0.02;
    }
}

// --- 2. PHYSICS ENGINE (Gravity) ---
export function applyPhysics(player, worldBlocks) {
    const gravity = -0.01;
    player.velocity.y += gravity;
    player.position.y += player.velocity.y;

    // Simple Ground Collision
    if (player.position.y < 2) {
        player.position.y = 2;
        player.velocity.y = 0;
    }
}

// --- 3. INVENTORY DEFINITIONS ---
export const ITEMS = {
    0: { name: 'Mace', icon: '⚔️', action: 'break' },
    1: { name: 'Dirt', icon: '🧱', action: 'place', color: 0x795548 },
    2: { name: 'Water', icon: '💧', action: 'place', color: 0x3498db, alpha: 0.6 },
    3: { name: 'CmdBlock', icon: '🟧', action: 'command', color: 0xff7f00 }
};
