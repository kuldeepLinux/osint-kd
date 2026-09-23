from flask import Flask, render_template, request, jsonify
import phonenumbers
from phonenumbers import carrier, geocoder, timezone
import requests
import whois

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/phone', methods=['POST'])
def phone_info():
    number = request.json.get('target')
    try:
        parsed = phonenumbers.parse(number)
        data = {
            "status": "success",
            "valid": phonenumbers.is_valid_number(parsed),
            "carrier": carrier.name_for_number(parsed, "en"),
            "region": geocoder.description_for_number(parsed, "en"),
            "timezone": str(timezone.time_zones_for_number(parsed)),
            "country_code": parsed.country_code,
            "national_number": parsed.national_number
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/ip', methods=['POST'])
def ip_info():
    ip = request.json.get('target')
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}")
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/api/username', methods=['POST'])
def username_search():
    username = request.json.get('target')
    sites = {
        "GitHub": f"https://github.com/{username}",
        "Instagram": f"https://instagram.com/{username}",
        "Twitter": f"https://twitter.com/{username}",
        "Reddit": f"https://reddit.com/user/{username}",
        "Facebook": f"https://facebook.com/{username}",
        "TikTok": f"https://tiktok.com/@{username}",
        "YouTube": f"https://youtube.com/@{username}",
        "Pinterest": f"https://pinterest.com/{username}",
        "Telegram": f"https://t.me/{username}",
        "Snapchat": f"https://snapchat.com/add/{username}"
    }
    results = {}
    headers = {"User-Agent": "Mozilla/5.0"}
    for site, url in sites.items():
        try:
            r = requests.get(url, headers=headers, timeout=5)
            results[site] = "FOUND" if r.status_code == 200 else "NOT FOUND"
        except:
            results[site] = "ERROR"
    return jsonify({"status": "success", "results": results})

@app.route('/api/whois', methods=['POST'])
def whois_lookup():
    domain = request.json.get('target')
    try:
        w = whois.whois(domain)
        return jsonify({
            "status": "success",
            "domain": str(w.domain_name),
            "registrar": str(w.registrar),
            "creation_date": str(w.creation_date),
            "expiration_date": str(w.expiration_date),
            "name_servers": str(w.name_servers)
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
