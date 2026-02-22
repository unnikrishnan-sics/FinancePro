const http = require('http');

function reproduceIssue() {
    const numericName = "1234567890";
    const email = `testuser${Date.now()}@example.com`;
    const password = "password123";

    const data = JSON.stringify({
        name: numericName,
        email: email,
        password: password
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = http.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
            responseBody += chunk;
        });

        res.on('end', () => {
            console.log(`Response Status: ${res.statusCode}`);
            if (res.statusCode === 201) {
                console.log("❌ FAIL: Registration successful with numeric name.");
                console.log("Response:", responseBody);
            } else if (res.statusCode === 400) {
                console.log("✅ PASS: Registration failed with 400 Bad Request.");
                console.log("Response:", responseBody);
            } else {
                console.log(`❓ UNKNOWN: Registration failed with unexpected status code: ${res.statusCode}`);
                console.log("Response:", responseBody);
            }
        });
    });

    req.on('error', (error) => {
        console.error(`Error: ${error.message}`);
    });

    req.write(data);
    req.end();
}

reproduceIssue();
