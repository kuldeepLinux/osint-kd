from flask import Flask, render_template, request, jsonify
import phonenumbers
from phonenumbers import carrier, geocoder, timezone, number_type, PhoneNumberType
import requests
import whois

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

# 🔹 UPGRADED Phone Info
@app.route('/api/phone', methods=['POST'])
def phone_info():
    number = request.json.get('target')
    try:
        # Parse number (auto-detect country code)
        parsed = phonenumbers.parse(number, None)
        
        # Get number type
        n_type = number_type(parsed)
        type_map = {
            PhoneNumberType.MOBILE: "Mobile",
            PhoneNumberType.FIXED_LINE: "Landline",
            PhoneNumberType.FIXED_LINE_OR_MOBILE: "Fixed Line / Mobile",
            PhoneNumberType.TOLL_FREE: "Toll Free",
            PhoneNumberType.PREMIUM_RATE: "Premium Rate",
            PhoneNumberType.SHARED_COST: "Shared Cost",
            PhoneNumberType.VOIP: "VoIP",
            PhoneNumberType.PERSONAL_NUMBER: "Personal Number",
            PhoneNumberType.PAGER: "Pager",
            PhoneNumberType.UAN: "UAN",
            PhoneNumberType.VOICEMAIL: "Voicemail",
            PhoneNumberType.UNKNOWN: "Unknown"
        }
        
        # Build detailed response
        data = {
            "status": "success",
            "input": number,
            "valid": phonenumbers.is_valid_number(parsed),
            "possible": phonenumbers.is_possible_number(parsed),
            "country_code": parsed.country_code,
            "national_number": parsed.national_number,
            "country": phonenumbers.region_code_for_number(parsed),
            "carrier": carrier.name_for_number(parsed, "en") or "Unknown",
            "region": geocoder.description_for_number(parsed, "en") or "Unknown",
            "timezone": str(timezone.time_zones_for_number(parsed)),
            "number_type": type_map.get(n_type, "Unknown"),
            "e164": phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164),
            "international": phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL),
            "national": phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.NATIONAL),
            "rfc3966": phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.RFC3966),
            "extension": parsed.extension or "None",
            "italian_leading_zero": parsed.italian_leading_zero,
            "raw_input": parsed.raw_input,
            "country_code_source": str(parsed.country_code_source) if parsed.country_code_source else "None"
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({"status": "error", "message": f"Invalid Number: {str(e)}"})

# 🔹 UPGRADED IP Tracker
@app.route('/api/ip', methods=['POST'])
def ip_info():
    ip = request.json.get('target')
    try:
        # Main IP info
        response = requests.get(f"http://ip-api.com/json/{ip}?fields=status,message,continent,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query")
        data = response.json()
        
        if data.get('status') == 'fail':
            return jsonify({"status": "error", "message": data.get('message', 'Invalid IP')})
        
        # Add Google Maps link
        if data.get('lat') and data.get('lon'):
            data['maps'] = f"https://www.google.com/maps?q={data['lat']},{data['lon']}"
        
        # Add flags
        data['is_proxy'] = "YES" if data.get('proxy') else "NO"
        data['is_hosting'] = "YES" if data.get('hosting') else "NO"
        data['is_mobile'] = "YES" if data.get('mobile') else "NO"
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

# 🔹 Username Search (unchanged)
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

# 🔹 Domain WHOIS (unchanged)
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
