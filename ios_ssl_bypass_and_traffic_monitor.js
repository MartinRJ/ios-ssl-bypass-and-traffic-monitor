// Reversesio Real-Time SSL Bypass & Network Monitor for iOS
// Contact: Telegram (@reversesio, @riyadmondol2006) | Website: http://reversesio.com, http://reversesio.shop | Email: riyadmondol2006@gmail.com
// Permission Disclaimer: This script is for educational, research, and security testing purposes only. Use it only on apps you own or have explicit permission to analyze.

const VERSION = "1.2";
const TIMESTAMP_FORMAT = () => new Date().toISOString();
const COLORS = {
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    reset: "\x1b[0m"
};

// User-friendly startup message
console.log(`
${COLORS.green}Welcome to Reversesio Network Monitor v${VERSION}!${COLORS.reset}
------------------------------------------------------------
What it does: Watches app internet traffic in real-time.
Made by: Reversesio Team
Contact us: Telegram (@reversesio, @riyadmondol2006) | Email: riyadmondol2006@gmail.com
Visit: http://reversesio.com | http://reversesio.shop
------------------------------------------------------------
${COLORS.yellow}Important: Only use this on apps you own or have permission to test!${COLORS.reset}
Type 'help()' in the Frida console for instructions.
------------------------------------------------------------
`);

// Help function for users
function help() {
    console.log(`
${COLORS.green}How to Use Reversesio Network Monitor${COLORS.reset}
1. **Start the App**:
   - Run this in your terminal: 
     ${COLORS.yellow}frida -U -f com.atebits.Tweetie2 -l ios_ssl_realtime.js --no-pause${COLORS.reset}
   - This launches Tweetbot (or your app) and starts monitoring.
2. **Watch an Already Running App**:
   - Find the app's process ID: ${COLORS.yellow}frida-ps -U${COLORS.reset}
   - Then run: ${COLORS.yellow}frida -U -p <PID> -l ios_ssl_realtime.js${COLORS.reset}
3. **What You'll See**:
   - "Sending" messages (outgoing requests).
   - "Receiving" messages (incoming responses).
   - Easy-to-read details like website, headers, and data.
4. **Troubleshooting**:
   - No data? Make sure the app is active and online.
   - Errors? Contact us on Telegram (@reversesio) for help!
    `);
}

// Utility to format data simply
function formatData(data) {
    if (!data || data.isNull()) return "Nothing sent/received";
    try {
        const bytes = data.bytes();
        const length = data.length().toInt32();
        const text = bytes.readUtf8String(length);
        return text.length > 0 ? text : `Data (not text, ${length} bytes)`;
    } catch (e) {
        return `Data (unreadable, ${data.length()} bytes)`;
    }
}

// SSL Pinning Bypass
function bypassSSLPinning() {
    const SecTrustEvaluate = Module.findExportByName("Security", "SecTrustEvaluate");
    const SecTrustEvaluateWithError = Module.findExportByName("Security", "SecTrustEvaluateWithError");

    if (SecTrustEvaluate) {
        Interceptor.attach(SecTrustEvaluate, {
            onLeave: function(retval) {
                retval.replace(0);
                console.log(`${COLORS.green}[✓] Security lock #1 opened${COLORS.reset}`);
            }
        });
    }

    if (SecTrustEvaluateWithError) {
        Interceptor.attach(SecTrustEvaluateWithError, {
            onEnter: function(args) { args[1].writePointer(ptr(0)); },
            onLeave: function(retval) {
                retval.replace(1);
                console.log(`${COLORS.green}[✓] Security lock #2 opened${COLORS.reset}`);
            }
        });
    }
}

// Network Monitoring with User-Friendly Output
function hookNetworkActivity() {
    const NSMutableURLRequest = ObjC.classes.NSMutableURLRequest;
    const NSURLSession = ObjC.classes.NSURLSession;
    let requestInfo = {};

    const requestMethods = {
        "- setHTTPMethod:": (args) => {
            requestInfo.method = new ObjC.Object(args[2]).toString();
            console.log(`${COLORS.yellow}[${TIMESTAMP_FORMAT()}] Sending a ${requestInfo.method} request...${COLORS.reset}`);
        },
        "- setValue:forHTTPHeaderField:": (args) => {
            const key = new ObjC.Object(args[3]).toString();
            const value = new ObjC.Object(args[2]).toString();
            requestInfo.headers = requestInfo.headers || {};
            requestInfo.headers[key] = value;
            console.log(`  - Extra info: ${key} = ${value}`);
        },
        "- setHTTPBody:": (args) => {
            const body = new ObjC.Object(args[2]);
            requestInfo.body = formatData(body);
            console.log(`  - Message: ${requestInfo.body}`);
        }
    };

    for (let method in requestMethods) {
        Interceptor.attach(NSMutableURLRequest[method].implementation, {
            onEnter: function(args) {
                try {
                    requestMethods[method](args);
                } catch (e) {
                    console.log(`${COLORS.red}[!] Oops, something went wrong with ${method}: ${e}${COLORS.reset}`);
                }
            }
        });
    }

    const sessionMethods = [
        "- dataTaskWithRequest:",
        "- dataTaskWithURL:",
        "- dataTaskWithRequest:completionHandler:",
        "- dataTaskWithURL:completionHandler:"
    ];

    sessionMethods.forEach(method => {
        Interceptor.attach(NSURLSession[method].implementation, {
            onEnter: function(args) {
                try {
                    const request = new ObjC.Object(args[2]);
                    requestInfo.url = request.URL().toString();
                    console.log(`  - To: ${requestInfo.url}`);
                    console.log(`${COLORS.yellow}--- Request sent! ---${COLORS.reset}`);
                } catch (e) {
                    console.log(`${COLORS.red}[!] Trouble with ${method}: ${e}${COLORS.reset}`);
                }
            }
        });
    });

    const sessionDelegateMethods = {
        "URLSession:dataTask:didReceiveResponse:completionHandler:": (args) => {
            const response = new ObjC.Object(args[4]);
            console.log(`${COLORS.green}[${TIMESTAMP_FORMAT()}] Receiving a response...${COLORS.reset}`);
            console.log(`  - Status: ${response.statusCode()} (200 means success!)`);
            console.log(`  - Details: ${response.allHeaderFields()}`);
        },
        "URLSession:dataTask:didReceiveData:": (args) => {
            const data = new ObjC.Object(args[4]);
            console.log(`  - Message: ${formatData(data)}`);
        },
        "URLSession:task:didCompleteWithError:": (args) => {
            const error = new ObjC.Object(args[4]);
            if (error && !error.isNull()) {
                console.log(`${COLORS.red}  - Problem: ${error}${COLORS.reset}`);
            }
            console.log(`${COLORS.green}--- Response received! ---${COLORS.reset}`);
            requestInfo = {};
        }
    };

    for (let method in sessionDelegateMethods) {
        const impl = ObjC.classes.NSURLSessionTask[method];
        if (impl) {
            Interceptor.attach(impl.implementation, {
                onEnter: function(args) {
                    try {
                        sessionDelegateMethods[method](args);
                    } catch (e) {
                        console.log(`${COLORS.red}[!] Issue with ${method}: ${e}${COLORS.reset}`);
                    }
                }
            });
        }
    }
}

// Main execution
if (ObjC.available) {
    bypassSSLPinning();
    hookNetworkActivity();
    console.log(`${COLORS.green}[✓] Everything’s set up! Monitoring started.${COLORS.reset}`);
} else {
    console.log(`${COLORS.red}[!] This only works on iOS devices with Frida.${COLORS.reset}`);
}

// Expose help function to the user
rpc.exports = { help: help };
