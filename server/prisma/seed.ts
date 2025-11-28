import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({});

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const users = [
        { email: 'admin@phc.com', name: 'Admin User', role: 'ADMIN' },
        { email: 'doctor@phc.com', name: 'Dr. Dee', role: 'DOCTOR' },
        { email: 'nurse@phc.com', name: 'Nurse Nia', role: 'NURSE' },
        { email: 'lab@phc.com', name: 'Lab Tech Leo', role: 'LAB_TECH' },
        { email: 'pharma@phc.com', name: 'Pharma Priya', role: 'PHARMACIST' },
    ];

    const seeded = await Promise.all(
        users.map((user) =>
            prisma.user.upsert({
                where: { email: user.email },
                update: {
                    name: user.name,
                    role: user.role,
                    password: hashedPassword,
                },
                create: {
                    ...user,
                    password: hashedPassword,
                },
            })
        )
    );

    console.log('Seeded users:', seeded.map((u) => ({ email: u.email, role: u.role })));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
