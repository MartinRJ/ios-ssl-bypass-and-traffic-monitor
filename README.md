# iOS SSL Bypass & Real-Time Traffic Monitor

Usage video
https://youtu.be/ukz0fyGGn7Q

**iOS SSL Bypass & Traffic Monitor** is a Frida-based tool that bypasses SSL pinning and monitors network traffic of iOS applications in real time. It hooks into an app's networking APIs to intercept HTTP/HTTPS requests and responses, even if the app has SSL certificate pinning or anti-tampering protections. 

This tool is designed for developers, security researchers, and enthusiasts to analyze app behavior for **research, security testing, and educational purposes only**. Use it **only** on apps you own or have explicit permission to test.

## Features

- **Real-Time Network Monitoring** – Capture outgoing and incoming network requests from an iOS app, including URLs, headers, status codes, and body data.
- **SSL Pinning Bypass** – Hook `SecTrustEvaluate` and `SecTrustEvaluateWithError` functions to disable SSL pinning and inspect encrypted traffic.
- **Anti-Tampering Protection Bypass** – Defeat common anti-debugging techniques (e.g., ptrace bypass) to prevent apps from quitting when instrumented.
- **Data Formatting & Visualization** – Display human-readable data, attempting to decode binary content into UTF-8 text.
- **Frida Compatibility** – Works with Frida on jailbroken iOS devices or injected Frida Gadget apps, requiring no modifications to the target app.

## Installation & Setup

### Prerequisites

Ensure you have **Python 3** and **Frida** installed:

```bash
pip install frida-tools
```

For jailbroken devices, start the Frida server and connect your device via USB.

### Clone the Repository

```bash
git clone https://github.com/riyadmondol2006/ios-ssl-bypass-and-traffic-monitor.git
cd ios-ssl-bypass-and-traffic-monitor
```

### Verify Device Connection

Run the following command to check if your device is recognized:

```bash
frida-ps -U
```

If the command fails, ensure:
- Your iPhone is connected and trusted.
- Frida server is running.
- Your computer and device are on the same network (for remote connections).

## Usage Guide

### Attaching to a Running App

1. Find the app's process ID:

   ```bash
   frida-ps -U
   ```

2. Attach the script:

   ```bash
   frida -U -p <PID> -l ios_ssl_bypass_and_traffic_monitor.js
   ```

### Launching an App with Monitoring Enabled

1. Identify the bundle ID using:

   ```bash
   frida-ps -Uai
   ```

2. Start the app with monitoring:

   ```bash
   frida -U -f com.example.appname -l ios_ssl_bypass_and_traffic_monitor.js --no-pause
   ```

## Troubleshooting

- **No network logs?** Ensure the app is making requests.
- **App crashes?** Some apps have extra jailbreak protections. Modify or remove hooks accordingly.
- **Errors attaching to an app?** Update Frida using:

  ```bash
  pip install --upgrade frida-tools
  ```

## Contribution & Support

Contributions are welcome! Fork the repo, create a new branch, and submit a pull request.

For issues, contact:

- **YouTube:** [Reversesio](https://www.youtube.com/@reversesio)
- **Blog:** [reversesio.com](http://reversesio.com/)
- **Project Quotes:** [reversesio.shop](http://reversesio.shop/)
- **Telegram:** [@riyadmondol2006](https://t.me/riyadmondol2006)
- **Email:** [riyadmondol2006@gmail.com](mailto:riyadmondol2006@gmail.com)

## License & Disclaimer

**License:** MIT License. Free to use, modify, and distribute with attribution.

**Disclaimer:** This tool is **for research and educational use only**. Unauthorized use may violate laws. Use responsibly.

---

*Happy monitoring! If you find this tool useful, let us know via the contact info above.*
