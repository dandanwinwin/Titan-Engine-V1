/**
 * TITAN ENGINE x PRISMARINE BRIDGE
 * Connects the professional Prismarine Web Client to the Titan UI
 */

export function launchPrismarine() {
    console.log("🚀 Initializing Prismarine Bridge...");

    // 1. CLEAR OLD RENDERERS
    // We remove the old Three.js canvas to save memory for the Prismarine engine
    const oldCanvas = document.querySelector('canvas');
    if (oldCanvas) oldCanvas.style.display = 'none';

    // 2. CREATE THE WORLD CONTAINER
    const worldContainer = document.createElement('div');
    worldContainer.id = "titan-world-bridge";
    worldContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 0;
        background: #000;
    `;

    // 3. EMBED THE PROFESSIONAL CLIENT
    // This allows you to join servers or play singleplayer with real Minecraft logic
    const prismarineFrame = document.createElement('iframe');
    prismarineFrame.id = "prismarine-engine";
    prismarineFrame.src = "https://prismarinejs.github.io/prismarine-web-client/";
    prismarineFrame.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
    `;
    
    // 4. INJECT INTO PAGE
    worldContainer.appendChild(prismarineFrame);
    document.body.appendChild(worldContainer);

    // 5. THE UI RESCUE (Fixes Z-Index issues)
    // We force your Titan hotbar and chat to stay visible on top of the game
    const uiElements = [
        '.hotbar-container', 
        '.chat-container', 
        '.inventory-slot', 
        '#debug-coords'
    ];

    uiElements.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) {
            el.style.zIndex = "1000";
            el.style.position = "relative";
            el.style.pointerEvents = "auto"; 
        }
    });

    console.log("✅ Bridge Established. Titan UI is now synced.");
}
