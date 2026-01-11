// mods.js - Titan Companions & Robotics
export function init(scene, GameState, processCommand) {
    console.log("🤖 Robotics Mod Active!");

    // 1. THE COMPANION CREATOR
    function spawnCompanion(type, color) {
        let geometry;
        if (type === 'RobotCat') {
            geometry = new THREE.BoxGeometry(0.5, 0.4, 0.8); // Small cat body
        } else {
            geometry = new THREE.CapsuleGeometry(0.4, 1, 4, 8); // Human friend
        }

        const material = new THREE.MeshLambertMaterial({ color: color });
        const companion = new THREE.Mesh(geometry, material);
        
        // Spawn slightly in front of the camera
        companion.position.set(16, 2, 16); 
        scene.add(companion);

        // Add a "follow" behavior tag
        companion.userData = { isCompanion: true, type: type };
        
        // Visual notification
        const line = document.createElement('div');
        line.innerText = `>> [MOD] Crafted a ${type}!`;
        line.style.color = "#55FF55"; // Bright Green
        document.getElementById('chat-history').appendChild(line);
    }

    // 2. THE RECIPE ENGINE
    // This looks at what you type and "Crafts" the item
    const originalSendChat = window.sendChat;
    window.sendChat = (text) => {
        const input = text.toLowerCase();

        // RECIPE: Robot Cat (Iron + Lapis)
        if (input === "craft robot cat") {
            spawnCompanion('RobotCat', 0xbdc3c7); // Silver/Iron color
        } 
        
        // RECIPE: Friend (Gold + Apple)
        else if (input === "craft friend") {
            spawnCompanion('HumanFriend', 0xffdbac); // Skin tone
        }

        // RECIPE: Security Bot (Redstone + Iron)
        else if (input === "craft security bot") {
            spawnCompanion('RobotCat', 0xe74c3c); // Red
        }

        // Still run the original commands (/time, etc)
        if (originalSendChat) originalSendChat(text);
    };
}
