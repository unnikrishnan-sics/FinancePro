const User = require('../models/userModel');

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@gmail.com';
        const userExists = await User.findOne({ email: adminEmail });

        if (!userExists) {
            const admin = await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: 'admin@123',
                isAdmin: true,
            });
            console.log('Admin user seeded successfully');
        } else {
            // console.log('Admin user already exists');
        }
    } catch (error) {
        console.error(`Error seeding admin: ${error.message}`);
    }
};

module.exports = seedAdmin;
