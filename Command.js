/**
 * commands.js
 * Handles the Chat Logic, Commands, and System Messages
 */

export function processCommand(text, gameState, scene, camera) {
    const history = document.getElementById('chat-history');
    
    // 1. Add the User's text to the chat history
    const userLine = document.createElement('div');
    userLine.innerText = `[Player] ${text}`;
    history.appendChild(userLine);
    
    // Auto-scroll the chat to the bottom
    history.scrollTop = history.scrollHeight;

    // 2. If it doesn't start with '/', it's just a regular chat message
    if (!text.startsWith('/')) return;

    // 3. Parse the Command
    const parts = text.split(' ');
    const cmd = parts[0].toLowerCase();

    // --- COMMAND: /gamemode [c/s] ---
    if (cmd === '/gamemode') {
        const mode = parts[1];
        if (mode === 'c' || mode === '1') {
            gameState.mode = 'CREATIVE';
            sysMsg("Set own game mode to Creative Mode");
        } else {
            gameState.mode = 'SURVIVAL';
            sysMsg("Set own game mode to Survival Mode");
        }
    }
    
    // --- COMMAND: /time set [day/night] ---
    else if (cmd === '/time') {
        const action = parts[1]; // 'set'
        const value = parts[2];  // 'day' or 'night'
        
        if (action === 'set') {
            if (value === 'day') {
                scene.background.setHex(0x87CEEB); // Sky Blue
                scene.fog.color.setHex(0x87CEEB);
                sysMsg("Set the time to Day");
            } else if (value === 'night') {
                scene.background.setHex(0x050510); // Midnight Blue
                scene.fog.color.setHex(0x050510);
                sysMsg("Set the time to Night");
            }
        }
    }

    // --- COMMAND: /tp [x] [y] [z] ---
    else if (cmd === '/tp') {
        if (parts.length >= 4) {
            const x = parseFloat(parts[1]);
            const y = parseFloat(parts[2]);
            const z = parseFloat(parts[3]);
            camera.position.set(x, y, z);
            sysMsg(`Teleported to ${x}, ${y}, ${z}`);
        } else {
            sysMsg("Usage: /tp x y z");
        }
    }

    // --- COMMAND: /help ---
    else if (cmd === '/help') {
        sysMsg("Available: /gamemode, /time set, /tp, /kill");
    }

    // --- COMMAND: /kill ---
    else if (cmd === '/kill') {
        camera.position.set(16, 15, 16); //
