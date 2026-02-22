const http = require('http');

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function verify() {
    const email = `settings_${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Verification User';

    console.log(`1. Registering user: ${email}`);
    const regRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { name, email, password });

    if (regRes.status !== 201) {
        console.error('❌ Registration failed:', regRes.data);
        return;
    }
    const token = regRes.data.token;
    const userId = regRes.data._id;
    console.log('   Registration successful.');

    console.log('2. Updating highValueThreshold to 2500...');
    // Note: The previous logic assumed PUT /api/auth/profile. 
    // Let's verify route in authRoutes/authController.
    // authController has updateUserProfile at PUT /profile
    // routes/authRoutes.js likely maps '/' or '/profile' to it.
    // Based on Controller comment: // @route PUT /api/auth/profile

    // The previous update logic in Settings.jsx used:
    // await API.post('/api/auth/profile', { userId: userInfo._id, ...values });
    // WAIT! The code in Settings.jsx showed API.post('/api/auth/profile' ...).
    // BUT the controller code (viewed in step 6) says:
    // // @route   PUT /api/auth/profile
    // const updateUserProfile = async (req, res) => { ... }

    // I need to double check if the router uses POST or PUT for profile update.
    // Let's check authRoutes.js to be sure.
    // If Settings.jsx uses POST and Backend uses PUT, that would be a bug too!
    // But let's assume for now I should follow what the controller says (PUT), 
    // OR what the frontend does.

    // Let's blindly try PUT first as per standard REST, but I'll check authRoutes in next step if this fails.
    // Actually, looking at Settings.jsx line 34: 
    // const { data } = await API.post('/api/auth/profile', {

    // It says POST!
    // And authController.js line 73 says:
    // // @route   PUT /api/auth/profile

    // If the frontend is sending POST and backend expects PUT, that might be why it's failing too?
    // Or maybe the route is actually defined as POST in authRoutes.js?
    // I will check authRoutes.js shortly. For now, I'll try POST since that's what the frontend does.

    const updateRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/profile',
        method: 'PUT', // Changing to PUT to match controller comment for now, but will check routes.
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }, { name, email, highValueThreshold: 2500 });

    if (updateRes.status !== 200) {
        // If 404, maybe it's POST?
        console.log(`   Update failed with status ${updateRes.status}. Retrying with POST...`);
        const updateResPost = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/profile', // trying same path
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, { name, email, highValueThreshold: 2500 });

        if (updateResPost.status !== 200) {
            console.error('❌ Update failed with POST too:', updateResPost.data);
            return;
        }
        console.log('   Update successful with POST.');
    } else {
        console.log('   Update successful with PUT.');
    }

    console.log('3. Logging in again to verify persistence...');
    const loginRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email, password });

    if (loginRes.status !== 200) {
        console.error('❌ Login failed:', loginRes.data);
        return;
    }

    const savedThreshold = loginRes.data.highValueThreshold;
    if (savedThreshold === 2500) {
        console.log('✅ SUCCESS: highValueThreshold validated as 2500.');
    } else {
        console.log(`❌ FAIL: Expected 2500, got ${savedThreshold}`);
    }
}

verify();
