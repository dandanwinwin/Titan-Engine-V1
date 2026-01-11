export function launchPrismarine() {
    // 1. Create a "Loading Shield" to protect eyes from flickering
    const shield = document.createElement('div');
    shield.id = "loading-shield";
    shield.innerHTML = "⛏️ LOADING TITAN WORLD...";
    shield.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: #111; color: white; display: flex; align-items: center;
        justify-content: center; font-family: sans-serif; z-index: 2000;
        transition: opacity 1s;
    `;
    document.body.appendChild(shield);

    // 2. The Engine Frame
    const container = document.createElement('div');
    container.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1;";
    
    const iframe = document.createElement('iframe');
    iframe.src = "https://prismarinejs.github.io/prismarine-web-client/";
    iframe.style.cssText = "width: 100%; height: 100%; border: none;";
    
    // 3. Remove shield when game loads
    iframe.onload = () => {
        shield.style.opacity = "0";
        setTimeout(() => shield.remove(), 1000);
        console.log("💎 TITAN SYNC COMPLETE");
    };

    container.appendChild(iframe);
    document.body.appendChild(container);

    // 4. Final UI "Punch-Through"
    // This makes sure your Titan HUD is always visible
    const titanHUD = document.querySelector('.hotbar-container');
    if (titanHUD) {
        titanHUD.style.zIndex = "3000";
        titanHUD.style.pointerEvents = "auto";
    }
}
