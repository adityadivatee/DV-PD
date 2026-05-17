// Get Contexts
const cvsVirus = document.getElementById('virusCanvas');
const cvsVault = document.getElementById('vaultCanvas');
const cvsSpoof = document.getElementById('spoofCanvas');

if (cvsVirus && cvsVault && cvsSpoof) {
    const ctxVirus = cvsVirus.getContext('2d');
    const ctxVault = cvsVault.getContext('2d');
    const ctxSpoof = cvsSpoof.getContext('2d');

// Shared State
let globalTime = 0;
const logoImg = new Image();
logoImg.src = 'assets/logo.png';
let logoLoaded = false;
logoImg.onload = () => { logoLoaded = true; };

const width = 550;
const height = 350;

// Asset Definitions matching old code exactly
const colors = {
    bg: '#1a1c23',
    accent: '#6366f1',
    accentGlow: 'rgba(99, 102, 241, 0.4)',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    text: '#f3f4f6',
    desktopBg: '#0f172a'
};

const vCursor = { x: 50, y: 50, targetX: 50, targetY: 50, speed: 0.05, clickPulse: 0 };
const downloadBar = { progress: 0, speed: 0.005 };

const binaryRain = [];
for (let i = 0; i < 30; i++) {
    binaryRain.push({ x: Math.random() * width, y: Math.random() * -height, speed: 2 + Math.random() * 5, text: Math.random() > 0.5 ? '1' : '0', size: 10 + Math.random() * 10 });
}

const popups = [];
const virusParticles = [];
for (let i = 0; i < 15; i++) {
    virusParticles.push({
        x: 275, y: 175,
        vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
        size: 16 + Math.random() * 8
    });
}

// --- Exact Helper Functions from Pasted Code ---
function drawRoundedRect(ctx, x, y, w, h, r, fill = true, stroke = false) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

function drawCursor(ctx, cursorObj) {
    cursorObj.x += (cursorObj.targetX - cursorObj.x) * cursorObj.speed;
    cursorObj.y += (cursorObj.targetY - cursorObj.y) * cursorObj.speed;
    ctx.save();
    ctx.translate(cursorObj.x, cursorObj.y);
    if (cursorObj.clickPulse > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, (1 - cursorObj.clickPulse) * 30, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${cursorObj.clickPulse})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        cursorObj.clickPulse -= 0.05;
    }
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, 15); ctx.lineTo(4, 12); ctx.lineTo(8, 18);
    ctx.lineTo(10, 17); ctx.lineTo(6, 11); ctx.lineTo(12, 11); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
}

function drawWindow(ctx, x, y, w, h, title, active = true) {
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
    ctx.fillStyle = active ? '#1e293b' : '#334155';
    drawRoundedRect(ctx, x, y, w, h, 8);
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.shadowOffsetX = 0;
    ctx.fillStyle = active ? '#0f172a' : '#1e293b';
    drawRoundedRect(ctx, x, y, w, 30, 8);
    ctx.fillRect(x, y + 20, w, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px Outfit';
    ctx.fillText(title, x + 15, y + 20);
    const ccolors = ['#ef4444', '#f59e0b', '#10b981'];
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = ccolors[i];
        ctx.beginPath();
        ctx.arc(x + w - 50 + (i * 15), y + 15, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawIcon(ctx, x, y, label, emoji, highlight = false) {
    if (highlight) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        drawRoundedRect(ctx, x - 10, y - 10, 60, 70, 8);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
    }
    ctx.font = '30px Outfit';
    ctx.fillText(emoji, x, y + 30);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 11px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + 20, y + 50);
    ctx.textAlign = 'left';
}

function drawDesktop(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#0b1329');
    gradient.addColorStop(1, '#050a14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.beginPath();
    ctx.arc(width * 0.7, height * 0.3, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, height - 30, width, 30);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, height - 30, width, 1); 

    ctx.fillStyle = colors.accent;
    drawRoundedRect(ctx, 10, height - 25, 20, 20, 4);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Outfit';
    ctx.fillText("PC", 14, height - 12);

    drawIcon(ctx, 20, 20, "My PC", "💻");
    drawIcon(ctx, 20, 100, "Browser", "🌍", true);
    drawIcon(ctx, 20, 180, "Files", "📂");
}

function drawBrowser(ctx) {
    drawWindow(ctx, 80, 40, 420, 240, "Secure Browser - World Wide Web");
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(85, 75, 410, 200);
    
    ctx.fillStyle = '#0f172a';
    drawRoundedRect(ctx, 85, 50, 400, 20, 4);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Outfit';
    ctx.fillText("https://www.free-games-vault.com/download", 95, 64);
    
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 18px Outfit';
    ctx.fillText("FREE GAME DOWNLOAD!", 100, 110);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Outfit';
    ctx.fillText("Version 1.0.4 | Size: 1.2 GB | Trusted by 1M+ users", 100, 130);
    
    ctx.fillStyle = '#1e293b';
    drawRoundedRect(ctx, 100, 150, 120, 80, 6);
    ctx.fillStyle = '#475569';
    ctx.font = '10px Outfit';
    ctx.fillText("Game Screenshot", 120, 195);
    
    const btnX = 240, btnY = 160, btnW = 140, btnH = 35;
    ctx.fillStyle = '#6366f1';
    ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
    ctx.shadowBlur = 10;
    drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 6);
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Outfit';
    ctx.fillText("⚡ DOWNLOAD NOW", btnX + 15, btnY + 22);
    
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(105, 250, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Outfit';
    ctx.fillText("✓", 103, 252);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Outfit';
    ctx.fillText("Verified Safe by Antivirus", 115, 253);
}

function drawGlitch(ctx) {
    ctx.fillStyle = `rgba(239, 68, 68, ${Math.random() * 0.3})`;
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(0, Math.random() * height, width, Math.random() * 20);
    }
}

function drawSkull(ctx, x, y, size) {
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x, y, size, Math.PI * 0.8, Math.PI * 0.2, false);
    ctx.lineTo(x + size * 0.6, y + size * 1.2);
    ctx.lineTo(x - size * 0.6, y + size * 1.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x - size * 0.4, y + size * 1.2, size * 0.2, size * 0.3);
    ctx.fillRect(x - size * 0.1, y + size * 1.2, size * 0.2, size * 0.3);
    ctx.fillRect(x + size * 0.2, y + size * 1.2, size * 0.2, size * 0.3);
    ctx.fillStyle = '#0b0f19';
    ctx.beginPath();
    ctx.arc(x - size * 0.4, y + size * 0.2, size * 0.25, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y + size * 0.2, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.5); ctx.lineTo(x - size * 0.1, y + size * 0.7); ctx.lineTo(x + size * 0.1, y + size * 0.7); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
}

// ==========================================
// LOOP 1: VIRUS SEQUENCE
// ==========================================
let vState = 'DESKTOP';
let vTimer = 0;

function loopVirus() {
    vTimer++;
    ctxVirus.clearRect(0, 0, width, height);

    if (vState === 'DESKTOP') {
        drawDesktop(ctxVirus);
        drawCursor(ctxVirus, vCursor);
        if (vTimer === 20) { vCursor.targetX = 40; vCursor.targetY = 120; }
        if (vTimer === 70) { vCursor.clickPulse = 1; vState = 'BROWSER'; vTimer = 0; }
    }
    else if (vState === 'BROWSER') {
        drawDesktop(ctxVirus);
        drawBrowser(ctxVirus);
        drawCursor(ctxVirus, vCursor);
        if (vTimer === 10) { vCursor.targetX = 260; vCursor.targetY = 180; }
        if (vTimer === 60) { vCursor.clickPulse = 1; vState = 'DOWNLOADING'; vTimer = 0; downloadBar.progress = 0; }
    }
    else if (vState === 'DOWNLOADING') {
        drawDesktop(ctxVirus);
        drawBrowser(ctxVirus);
        
        ctxVirus.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctxVirus.fillRect(85, 75, 410, 200);
        
        const mX = 140, mY = 110, mW = 300, mH = 100;
        drawWindow(ctxVirus, mX, mY, mW, mH, "Downloading...", true);
        ctxVirus.fillStyle = '#f3f4f6'; ctxVirus.font = '14px Outfit';
        ctxVirus.fillText("🎮", mX + 15, mY + 45);
        ctxVirus.font = '500 12px Outfit';
        ctxVirus.fillText("Downloading: hyper-cyber-extreme.exe", mX + 35, mY + 42);
        
        ctxVirus.fillStyle = '#334155';
        drawRoundedRect(ctxVirus, mX + 15, mY + 60, mW - 30, 15, 4);
        ctxVirus.fillStyle = colors.accent;
        drawRoundedRect(ctxVirus, mX + 15, mY + 60, (mW - 30) * downloadBar.progress, 15, 4);
        
        downloadBar.progress += downloadBar.speed;
        if (downloadBar.progress >= 1 && vTimer > 40) { vState = 'EXECUTE'; vTimer = 0; }
        
        drawCursor(ctxVirus, vCursor);
    }
    else if (vState === 'EXECUTE') {
        drawDesktop(ctxVirus);
        drawIcon(ctxVirus, 100, 150, "hyper-cyber.exe", "🎮", true);
        drawCursor(ctxVirus, vCursor);
        if (vTimer === 10) { vCursor.targetX = 120; vCursor.targetY = 170; }
        if (vTimer === 50) { vCursor.clickPulse = 1; }
        if (vTimer === 60) { vCursor.clickPulse = 1; }
        if (vTimer === 90) { vState = 'VIRUS'; vTimer = 0; popups.length = 0; }
    }
    else if (vState === 'VIRUS') {
        ctxVirus.fillStyle = '#0b0f19'; ctxVirus.fillRect(0, 0, width, height);
        
        ctxVirus.fillStyle = 'rgba(239, 68, 68, 0.4)'; ctxVirus.font = '10px monospace';
        binaryRain.forEach(drop => {
            ctxVirus.fillText(drop.text, drop.x, drop.y);
            drop.y += drop.speed;
            if (drop.y > height) { drop.y = -10; drop.x = Math.random() * width; }
        });

        if (Math.random() > 0.7) drawGlitch(ctxVirus);
        drawSkull(ctxVirus, width / 2, height / 2 - 30, 50);

        ctxVirus.textAlign = 'center';
        ctxVirus.fillStyle = '#ef4444'; ctxVirus.font = 'bold 32px Outfit';
        ctxVirus.fillText("SYSTEM COMPROMISED", width / 2, height / 2 + 70);
        ctxVirus.fillStyle = '#fef08a'; ctxVirus.font = '500 14px Outfit';
        ctxVirus.fillText("All your files have been encrypted.", width / 2, height / 2 + 100);
        ctxVirus.fillText("Pay 1.5 BTC to unlock.", width / 2, height / 2 + 120);
        ctxVirus.textAlign = 'left';

        if (vTimer % 30 === 0 && popups.length < 5) {
            popups.push({ x: Math.random() * (width - 200), y: Math.random() * (height - 100), w: 200, h: 80, title: "CRITICAL ERROR" });
        }
        popups.forEach(popup => {
            drawWindow(ctxVirus, popup.x, popup.y, popup.w, popup.h, popup.title, true);
            ctxVirus.fillStyle = '#ef4444'; ctxVirus.font = 'bold 12px Outfit';
            ctxVirus.fillText("VIRUS DETECTED!", popup.x + popup.w / 2 - 50, popup.y + popup.h / 2);
        });

        if (vTimer > 250) { vState = 'DESKTOP'; vTimer = 0; vCursor.x = 50; vCursor.y = 50; }
    }
}

// ==========================================
// LOOP 2: VAULT (JAIL)
// ==========================================
function loopVault() {
    ctxVault.clearRect(0, 0, width, height);
    drawDesktop(ctxVault);

    ctxVault.fillStyle = '#10b981'; ctxVault.font = 'bold 12px Outfit';
    ctxVault.fillText("✓ Safe", 60, 30);
    ctxVault.fillText("✓ Safe", 60, 110);
    ctxVault.fillText("✓ Safe", 60, 190);

    const jailX = 140, jailY = 50, jailW = 350, jailH = 250;

    // Outer Thick Wall
    ctxVault.fillStyle = '#1e293b';
    drawRoundedRect(ctxVault, jailX - 10, jailY - 10, jailW + 20, jailH + 20, 12);
    // Inner area
    ctxVault.fillStyle = '#0f172a';
    drawRoundedRect(ctxVault, jailX, jailY, jailW, jailH, 8);
    // Glowing border
    ctxVault.strokeStyle = '#10b981'; ctxVault.lineWidth = 4;
    drawRoundedRect(ctxVault, jailX, jailY, jailW, jailH, 8, false, true);

    // Bouncing virus bugs exact match
    virusParticles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x - p.size < jailX || p.x + p.size > jailX + jailW) { p.vx = -p.vx; p.x = Math.max(jailX + p.size, Math.min(jailX + jailW - p.size, p.x)); }
        if (p.y - p.size < jailY || p.y + p.size > jailY + jailH) { p.vy = -p.vy; p.y = Math.max(jailY + p.size, Math.min(jailY + jailH - p.size, p.y)); }
        
        ctxVault.fillStyle = '#ef4444';
        let scale = p.size / 20;
        ctxVault.save();
        ctxVault.translate(p.x, p.y);
        let bounce = Math.sin(globalTime / 5 + p.size) * 0.1 + 1;
        ctxVault.scale(bounce, bounce);
        ctxVault.rotate(Math.sin(globalTime / 10 + p.size) * 0.2);
        
        ctxVault.fillRect(-8 * scale, -6 * scale, 16 * scale, 12 * scale);
        ctxVault.fillStyle = '#fff';
        ctxVault.fillRect(-4 * scale, -3 * scale, 3 * scale, 3 * scale);
        ctxVault.fillRect(1 * scale, -3 * scale, 3 * scale, 3 * scale);
        ctxVault.fillStyle = '#000';
        ctxVault.fillRect(-3 * scale, -2 * scale, 1 * scale, 1 * scale);
        ctxVault.fillRect(2 * scale, -2 * scale, 1 * scale, 1 * scale);
        ctxVault.fillStyle = '#ef4444';
        ctxVault.fillRect(-7 * scale, 6 * scale, 3 * scale, 5 * scale);
        ctxVault.fillRect(4 * scale, 6 * scale, 3 * scale, 5 * scale);
        ctxVault.fillRect(-2 * scale, 6 * scale, 1 * scale, 3 * scale);
        ctxVault.fillRect(1 * scale, 6 * scale, 1 * scale, 3 * scale);
        ctxVault.fillRect(-6 * scale, -10 * scale, 2 * scale, 4 * scale);
        ctxVault.fillRect(4 * scale, -10 * scale, 2 * scale, 4 * scale);
        ctxVault.restore();
    });

    // Exact Pixel Game from old code
    let pxX = jailX + jailW / 2 - 80, pxY = jailY + jailH / 2 - 60, pxW = 160, pxH = 120;
    ctxVault.fillStyle = '#334155'; ctxVault.fillRect(pxX - 4, pxY - 4, pxW + 8, pxH + 8);
    ctxVault.fillStyle = '#020617'; ctxVault.fillRect(pxX, pxY, pxW, pxH);
    ctxVault.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 10; i++) {
        let sx = pxX + (Math.sin(i * 123 + globalTime * 0.01) + 1) / 2 * pxW;
        let sy = pxY + (Math.cos(i * 456 + globalTime * 0.005) + 1) / 2 * pxH;
        ctxVault.fillRect(sx, sy, 2, 2);
    }
    ctxVault.fillStyle = '#10b981';
    let plyX = pxX + pxW / 2 - 8, plyY = pxY + pxH - 15;
    ctxVault.fillRect(plyX, plyY, 16, 6); ctxVault.fillRect(plyX + 6, plyY - 3, 4, 3);
    ctxVault.fillStyle = '#ec4899';
    let invOffset = Math.sin(globalTime / 20) * 10;
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
            let ix = pxX + 20 + col * 35 + invOffset;
            let iy = pxY + 15 + row * 12;
            ctxVault.fillRect(ix, iy, 10, 6);
            if ((globalTime + col * 5) % 20 < 10) {
                ctxVault.fillRect(ix, iy + 6, 2, 2); ctxVault.fillRect(ix + 8, iy + 6, 2, 2);
            } else {
                ctxVault.fillRect(ix + 2, iy + 6, 2, 2); ctxVault.fillRect(ix + 6, iy + 6, 2, 2);
            }
        }
    }
    ctxVault.fillStyle = '#38bdf8';
    let bx = pxX + pxW / 2; let by = pxY + pxH - 20 - ((globalTime * 2) % (pxH - 30));
    ctxVault.fillRect(bx, by, 2, 5);
    ctxVault.fillStyle = '#f8fafc'; ctxVault.font = 'bold 8px monospace';
    ctxVault.fillText("SCORE: 01340", pxX + 5, pxY + 10);
}

// ==========================================
// LOOP 3: SPOOFING
// ==========================================
function loopSpoof() {
    ctxSpoof.clearRect(0, 0, width, height);

    ctxSpoof.fillStyle = '#0f172a';
    ctxSpoof.fillRect(0, 0, width, height);

    ctxSpoof.fillStyle = '#fff'; ctxSpoof.font = 'bold 20px Outfit'; ctxSpoof.textAlign = 'center';
    ctxSpoof.fillText("Identity Protection Verification", width / 2, 30);
    ctxSpoof.fillStyle = '#94a3b8'; ctxSpoof.font = '12px Outfit';
    ctxSpoof.fillText("Divte Jailer hides your real hardware and network info.", width / 2, 50);

    const boxW = 160, boxH = 180, boxY = 100, leftX = 40, rightX = 350;

    // Left Box
    ctxSpoof.fillStyle = 'rgba(255, 255, 255, 0.05)';
    drawRoundedRect(ctxSpoof, leftX, boxY, boxW, boxH, 10);
    ctxSpoof.strokeStyle = '#10b981'; ctxSpoof.lineWidth = 2;
    drawRoundedRect(ctxSpoof, leftX, boxY, boxW, boxH, 10, false, true);

    ctxSpoof.fillStyle = '#10b981'; ctxSpoof.font = 'bold 14px Outfit';
    ctxSpoof.fillText("Your Real Identity", leftX + boxW / 2, boxY + 30);
    ctxSpoof.fillStyle = '#fff'; ctxSpoof.font = '12px Outfit';
    ctxSpoof.fillText("IP: 192.168.1.45", leftX + boxW / 2, boxY + 70);
    ctxSpoof.fillText("HWID: PC-PRO-X99", leftX + boxW / 2, boxY + 100);
    ctxSpoof.fillStyle = '#94a3b8';
    ctxSpoof.fillText("✓ Safe & Hidden", leftX + boxW / 2, boxY + 140);

    // Right Box
    ctxSpoof.fillStyle = 'rgba(255, 255, 255, 0.05)';
    drawRoundedRect(ctxSpoof, rightX, boxY, boxW, boxH, 10);
    ctxSpoof.strokeStyle = '#ef4444'; ctxSpoof.lineWidth = 2;
    drawRoundedRect(ctxSpoof, rightX, boxY, boxW, boxH, 10, false, true);

    ctxSpoof.fillStyle = '#ef4444'; ctxSpoof.font = 'bold 14px Outfit';
    ctxSpoof.fillText("What Game & Virus Sees", rightX + boxW / 2, boxY + 30);
    ctxSpoof.fillStyle = '#fff'; ctxSpoof.font = '12px Outfit';
    ctxSpoof.fillText("IP: 333.234.38.2254", rightX + boxW / 2, boxY + 70);
    ctxSpoof.fillText("HWID: DV-JAIL-9X7", rightX + boxW / 2, boxY + 100);
    ctxSpoof.fillStyle = '#94a3b8';
    ctxSpoof.fillText("✓ Tricked with Fake Data", rightX + boxW / 2, boxY + 140);

    const centerX = width / 2, centerY = boxY + boxH / 2, logoSize = 60;
    const startX = leftX + boxW, endX = rightX;

    let progress = (globalTime % 180) / 180;
    let currentX = startX + (endX - startX) * progress;
    let currentLogoSize = logoSize;
    if (currentX >= centerX - 30 && currentX <= centerX + 30) {
        currentLogoSize = logoSize + Math.sin(globalTime * 0.2) * 10;
    }

    if (logoLoaded) {
        ctxSpoof.drawImage(logoImg, centerX - currentLogoSize/2, centerY - currentLogoSize/2, currentLogoSize, currentLogoSize);
    } else {
        ctxSpoof.fillStyle = '#6366f1'; ctxSpoof.beginPath(); ctxSpoof.arc(centerX, centerY, currentLogoSize/2, 0, Math.PI*2); ctxSpoof.fill();
    }

    ctxSpoof.beginPath(); ctxSpoof.setLineDash([5, 5]); ctxSpoof.moveTo(startX, centerY); ctxSpoof.lineTo(endX, centerY);
    ctxSpoof.strokeStyle = '#38bdf8'; ctxSpoof.lineWidth = 2; ctxSpoof.stroke(); ctxSpoof.setLineDash([]);

    let displayText = "IP: 192.168.1.45", textColor = '#10b981';
    if (currentX < centerX - 30) { displayText = "IP: 192.168.1.45"; textColor = '#10b981'; }
    else if (currentX >= centerX - 30 && currentX <= centerX + 30) {
        const chars = "XxYUeTTdA$#@!&*"; displayText = "";
        for (let i=0; i<10; i++) displayText += chars.charAt(Math.floor(Math.random() * chars.length));
        textColor = '#eab308';
    } else { displayText = "IP: 333.234.38.2254"; textColor = '#ef4444'; }

    ctxSpoof.fillStyle = textColor; ctxSpoof.font = 'bold 10px monospace';
    ctxSpoof.fillText(displayText, currentX, centerY - 15);
    ctxSpoof.beginPath(); ctxSpoof.moveTo(currentX - 5, centerY - 5); ctxSpoof.lineTo(currentX, centerY); ctxSpoof.lineTo(currentX - 5, centerY + 5); ctxSpoof.fill();
    ctxSpoof.textAlign = 'left';
}


// --- Master Loop ---
function masterLoop() {
    globalTime++;
    loopVirus();
    loopVault();
    loopSpoof();
    requestAnimationFrame(masterLoop);
}

// Start
masterLoop();

} // End of null check
