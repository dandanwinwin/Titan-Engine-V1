// prismarine_bridge.js
export function launchPrismarine() {
    console.log("🚀 Launching Prismarine Bridge...");

    // 1. Create the Game Container
    const container = document.createElement('div');
    container.id = "prismarine-container";
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1; 
    `;

    // 2. Create the IFrame (The Real Game)
    const iframe = document.createElement('iframe');
    iframe.src = "https://prismarinejs.github.io/prismarine-web-client/";
    iframe.style.cssText = "width: 100%; height: 100%; border: none;";
    
    container.appendChild(iframe);
    document.body.appendChild(container);

    // 3. Move your Titan UI to the front
    const hotbar = document.querySelector('.hotbar-container');
    if (hotbar) hotbar.style.zIndex = "100";
    
    const chat = document.querySelector('.chat-container');
    if (chat) chat.style.zIndex = "100";

    console.log("✅ Prismarine is now running under Titan UI");
}
