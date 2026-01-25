// Bubble animation logic (HTML bubbles)

// Find the name of the current page and remove it from the array of bubble labels.
const currentPageName = window.location.pathname.split('/').pop().replace('.html', '');
const bubbleLabels = ["contact", "info", "puzzles", "projects", "music", "opponent", "resume"];
bubbleLabels.splice(bubbleLabels.indexOf(currentPageName), 1);

const colors = ["rgba(0, 0, 0, 0.71)", "rgba(0, 0, 0, 0.71)", "rgba(0, 0, 0, 0.71)", "rgba(0, 0, 0, 0.71)", "rgba(0, 0, 0, 0.71)", "rgba(0, 0, 0, 0.71)"];
const bubbleContainer = document.getElementById('bubbleContainer');
const radius = 48;
let bubbles = [];
let dpr = window.devicePixelRatio || 1;

function createBubble(label, color, x, y) {
    const div = document.createElement('div');
    div.className = 'bubble';
    div.textContent = label;

    Object.assign(div.style, {
        position: 'absolute',
        left: (x - radius) + 'px',
        top: (y - radius) + 'px',
        width: (2 * radius) + 'px',
        height: (2 * radius) + 'px',
        borderRadius: '50%',
        zIndex: 11,
        cursor: 'pointer',
        pointerEvents: 'auto',
        userSelect: 'none',

        /* ===== 等价 ctx.globalAlpha = 0.85 ===== */
        opacity: '0.85',

        /* ===== 1. 等价 createRadialGradient ===== */
        background: `
        radial-gradient(
            circle at ${radius * 0.7}px ${radius * 0.7}px,
            rgba(255,255,255,0.55) 40%,
            rgba(255,255,255,0.18) 80%,
            rgba(255,255,255,0.08) 100%
        )
        `,

        /* ===== 玻璃折射（canvas 没有，但视觉必须有） ===== */
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',

        /* ===== 等价 shadowColor + shadowBlur ===== */
        boxShadow: `0 0 24px ${color}`,

        /* ===== 等价 ctx.stroke ===== */
        border: '1.2px solid rgba(255,255,255,0.35)',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        font: 'bold 1.2rem -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif',
        color: 'hsla(0, 100%, 1%, 0.95)',
    });

    /* ===== 3. 高光反射（等价 arc 高光） ===== */
    const highlight = document.createElement('div');
    Object.assign(highlight.style, {
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        pointerEvents: 'none',
        background: `
        conic-gradient(
            from 207deg at 35% 35%,
            rgba(255,255,255,0.45) 0deg,
            rgba(255,255,255,0.45) 30deg,
            transparent 55deg
        )
        `,
        maskImage: 'radial-gradient(circle, black 60%, transparent 61%)',
        WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 61%)'
    });

    div.appendChild(highlight);

    div.addEventListener('click', (e) => {
        window.location.href = label + '.html';
        e.stopPropagation();
    });

    bubbleContainer.appendChild(div);

    return {
        label,
        color,
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: -2 - Math.random() * 2,
        div,
        stopped: false
    };
    }



function nonOverlappingPosition(existing, radius) {
    let tries = 0;
    while (tries < 1000) {
    const x = Math.random() * (window.innerWidth - 2 * radius) + radius;
    const y = window.innerHeight - radius - Math.random() * 40;
    if (existing.every(b => Math.hypot(b.x - x, b.y - y) >= 2 * radius)) {
        return { x, y };
    }
    tries++;
    }
    return { x: radius + tries * 2, y: window.innerHeight - radius };
}

function initBubbles() {
    bubbleContainer.innerHTML = '';
    bubbles = [];
    for (let i = 0; i < bubbleLabels.length; i++) {
    const {x, y} = nonOverlappingPosition(bubbles, radius);
    bubbles.push(createBubble(bubbleLabels[i], colors[i % colors.length], x, y));
    }
}
initBubbles();

function updateBubbles() {
    for (let i = 0; i < bubbles.length; i++) {
    let b = bubbles[i];
    if (b.stopped) continue;
    b.x += b.vx;
    b.y += b.vy;
    // Bounce off left/right
    if (b.x - radius < 0) { b.x = radius; b.vx *= -1; }
    if (b.x + radius > window.innerWidth) { b.x = window.innerWidth - radius; b.vx *= -1; }
    // Bounce off other bubbles
    for (let j = 0; j < bubbles.length; j++) {
        if (i === j) continue;
        let b2 = bubbles[j];
        let dx = b2.x - b.x, dy = b2.y - b.y, dist = Math.hypot(dx, dy);
        if (dist < 2 * radius) {
        const overlap = 2 * radius - dist;
        const angle = Math.atan2(dy, dx);
        b.x -= Math.cos(angle) * overlap / 2;
        b.y -= Math.sin(angle) * overlap / 2;
        b2.x += Math.cos(angle) * overlap / 2;
        b2.y += Math.sin(angle) * overlap / 2;
        b.vx *= -1; b.vy *= -1;
        b2.vx *= -1; b2.vy *= -1;
        }
    }
    // Bounce off bottom
    if (b.y + radius > window.innerHeight) { b.y = window.innerHeight - radius; b.vy *= -1; }
    // Stop at top
    if (b.y - radius <= 0) { b.y = radius; b.vx = 0; b.vy = 0; b.stopped = true; }
    // Update position
    b.div.style.left = (b.x - radius) + 'px';
    b.div.style.top = (b.y - radius) + 'px';
    }
}

function animateBubbles() {
    updateBubbles();
    requestAnimationFrame(animateBubbles);
}
animateBubbles();

window.addEventListener('resize', () => {
    initBubbles();
});