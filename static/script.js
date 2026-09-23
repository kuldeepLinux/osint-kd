// ===== Draggable Windows Logic =====
let activeWindow = null;
let offsetX = 0, offsetY = 0;

function startDrag(e, windowId) {
    activeWindow = document.getElementById(windowId);
    const rect = activeWindow.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

function drag(e) {
    if (!activeWindow) return;
    activeWindow.style.left = (e.clientX - offsetX) + 'px';
    activeWindow.style.top = (e.clientY - offsetY) + 'px';
}

function stopDrag() {
    activeWindow = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

function closeWindow(id) {
    document.getElementById(id).style.display = 'none';
}

// ===== Input & Tool Logic =====
function showInput(type) {
    const area = document.getElementById('inputArea');
    area.innerHTML = `
        <input type="text" id="targetInput" placeholder="Enter ${type}...">
        <button onclick="runTool('${type}')">RUN</button>
    `;
    // Make sure console window is visible
    document.getElementById('console-window').style.display = 'block';
}

async function runTool(type) {
    const target = document.getElementById('targetInput').value;
    const output = document.getElementById('output');
    if (!target) {
        output.innerText = "[!] Please enter a target!";
        return;
    }
    output.innerText = `[*] Running ${type} scan on: ${target}\n[+] Please wait...`;

    try {
        const response = await fetch(`/api/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: target })
        });
        const data = await response.json();
        output.innerText = formatOutput(type, data);
    } catch (err) {
        output.innerText = `[!] Error: ${err.message}`;
    }
}

function formatOutput(type, data) {
    let out = `[+] Scan Complete for ${type.toUpperCase()}\n`;
    out += `--------------------------------\n`;
    if (type === 'phone') {
        out += `[+] Valid: ${data.valid}\n`;
        out += `[+] Carrier: ${data.carrier}\n`;
        out += `[+] Region: ${data.region}\n`;
        out += `[+] Timezone: ${data.timezone}\n`;
    } else if (type === 'ip') {
        out += `[+] ISP: ${data.isp}\n`;
        out += `[+] Country: ${data.country}\n`;
        out += `[+] City: ${data.city}\n`;
        out += `[+] Coordinates: ${data.lat}, ${data.lon}\n`;
    } else if (type === 'username') {
        for (let site in data.results) {
            out += `[${data.results[site] === 'FOUND' ? '+' : '-'}] ${site}: ${data.results[site]}\n`;
        }
    } else if (type === 'whois') {
        out += `[+] Domain: ${data.domain}\n`;
        out += `[+] Registrar: ${data.registrar}\n`;
        out += `[+] Created: ${data.creation_date}\n`;
        out += `[+] Expires: ${data.expiration_date}\n`;
    }
    out += `--------------------------------\n[+] Done. OSINT-KD by Kuldeep`;
    return out;
}

// ===== Live Clock =====
setInterval(() => {
    const clock = document.getElementById('clock');
    if (clock) {
        const now = new Date();
        clock.innerText = now.toLocaleTimeString();
    }
}, 1000);
