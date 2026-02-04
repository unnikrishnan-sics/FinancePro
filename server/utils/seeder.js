const User = require('../models/userModel');

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@gmail.com';
        const user = await User.findOne({ email: adminEmail });

        if (!user) {
            await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: 'admin@123',
                isAdmin: true,
            });
            console.log('✅ Admin user created: admin@gmail.com / admin@123');
        } else {
            if (!user.isAdmin) {
                user.isAdmin = true;
                await user.save();
                console.log('✅ Existing user converted to Admin');
            } else {
                console.log('ℹ️ Admin user already exists');
            }
        }
    } catch (error) {
        console.error(`❌ Error seeding admin: ${error.message}`);
    }
};

module.exports = seedAdmin;
