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

function showInput(type) {
    const area = document.getElementById('inputArea');
    area.innerHTML = `
        <input type="text" id="targetInput" placeholder="Enter ${type.toUpperCase()}...">
        <button onclick="runTool('${type}')">RUN</button>
    `;
    document.getElementById('console-window').style.display = 'block';
}

async function runTool(type) {
    const target = document.getElementById('targetInput').value;
    const output = document.getElementById('output');
    if (!target) {
        output.innerText = "[!] Please enter a target!";
        return;
    }
    output.innerText = `[*] Running ${type.toUpperCase()} scan on: ${target}\n[+] Please wait...`;

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

// 🔹 UPGRADED Format Output
function formatOutput(type, data) {
    let out = ``;
    const line = `────────────────────────────────\n`;

    if (type === 'phone') {
        if (data.status === 'error') {
            return `[!] ${data.message}`;
        }
        out += `╔══════════════════════════════╗\n`;
        out += `║   📱 PHONE NUMBER INFO       ║\n`;
        out += `╚══════════════════════════════╝\n\n`;
        out += `[+] Input:          ${data.input}\n`;
        out += line;
        out += `[+] Valid:          ${data.valid ? '✅ YES' : '❌ NO'}\n`;
        out += `[+] Possible:       ${data.possible ? '✅ YES' : '❌ NO'}\n`;
        out += `[+] Number Type:    ${data.number_type}\n`;
        out += line;
        out += `[+] Country:        ${data.country}\n`;
        out += `[+] Country Code:   +${data.country_code}\n`;
        out += `[+] National No:    ${data.national_number}\n`;
        out += line;
        out += `[+] Carrier:        ${data.carrier}\n`;
        out += `[+] Region:         ${data.region}\n`;
        out += `[+] Timezone:       ${data.timezone}\n`;
        out += line;
        out += `[+] E.164 Format:   ${data.e164}\n`;
        out += `[+] International:  ${data.international}\n`;
        out += `[+] National:       ${data.national}\n`;
        out += `[+] RFC3966:        ${data.rfc3966}\n`;
        out += line;
        out += `[+] Extension:      ${data.extension}\n`;
        out += `[+] Raw Input:      ${data.raw_input}\n`;
        out += line;
        out += `[+] Scan Complete. OSINT-KD by Kuldeep\n`;

    } else if (type === 'ip') {
        if (data.status === 'error') {
            return `[!] ${data.message}`;
        }
        out += `╔══════════════════════════════╗\n`;
        out += `║   🌐 IP ADDRESS INFO         ║\n`;
        out += `╚══════════════════════════════╝\n\n`;
        out += `[+] Target IP:      ${data.query}\n`;
        out += line;
        out += `[+] Continent:      ${data.continent}\n`;
        out += `[+] Country:        ${data.country} (${data.countryCode})\n`;
        out += `[+] Region:         ${data.regionName}\n`;
        out += `[+] City:           ${data.city}\n`;
        out += `[+] District:       ${data.district || 'N/A'}\n`;
        out += `[+] Zip Code:       ${data.zip || 'N/A'}\n`;
        out += line;
        out += `[+] Latitude:       ${data.lat}\n`;
        out += `[+] Longitude:      ${data.lon}\n`;
        out += `[+] Timezone:       ${data.timezone}\n`;
        out += `[+] Currency:       ${data.currency}\n`;
        out += line;
        out += `[+] ISP:            ${data.isp}\n`;
        out += `[+] Organization:   ${data.org}\n`;
        out += `[+] ASN:            ${data.as}\n`;
        out += `[+] AS Name:        ${data.asname}\n`;
        out += `[+] Reverse DNS:    ${data.reverse || 'N/A'}\n`;
        out += line;
        out += `[+] Proxy/VPN:      ${data.is_proxy}\n`;
        out += `[+] Hosting/DC:     ${data.is_hosting}\n`;
        out += `[+] Mobile:         ${data.is_mobile}\n`;
        out += line;
        out += `[+] Google Maps:    ${data.maps || 'N/A'}\n`;
        out += line;
        out += `[+] Scan Complete. OSINT-KD by Kuldeep\n`;

    } else if (type === 'username') {
        out += `╔══════════════════════════════╗\n`;
        out += `║   🔍 USERNAME SEARCH         ║\n`;
        out += `╚══════════════════════════════╝\n\n`;
        let foundCount = 0;
        for (let site in data.results) {
            const status = data.results[site];
            const icon = status === 'FOUND' ? '✅' : status === 'NOT FOUND' ? '❌' : '⚠️';
            out += `[${icon}] ${site.padEnd(12)} : ${status}\n`;
            if (status === 'FOUND') foundCount++;
        }
        out += line;
        out += `[+] Total Found:    ${foundCount} platforms\n`;
        out += `[+] Scan Complete. OSINT-KD by Kuldeep\n`;

    } else if (type === 'whois') {
        if (data.status === 'error') {
            return `[!] ${data.message}`;
        }
        out += `╔══════════════════════════════╗\n`;
        out += `║   📡 DOMAIN WHOIS INFO       ║\n`;
        out += `╚══════════════════════════════╝\n\n`;
        out += `[+] Domain:         ${data.domain}\n`;
        out += `[+] Registrar:      ${data.registrar}\n`;
        out += `[+] Created:        ${data.creation_date}\n`;
        out += `[+] Expires:        ${data.expiration_date}\n`;
        out += `[+] Name Servers:   ${data.name_servers}\n`;
        out += line;
        out += `[+] Scan Complete. OSINT-KD by Kuldeep\n`;
    }
    return out;
}

setInterval(() => {
    const clock = document.getElementById('clock');
    if (clock) {
        const now = new Date();
        clock.innerText = now.toLocaleTimeString();
    }
}, 1000);
