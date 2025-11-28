import prisma from "../src/utils/prisma";
import bcrypt from "bcryptjs";

const users = [
    {
        name: "Super Admin",
        email: "admin@phc.com",
        role: "ADMIN"
    },
    {
        name: "Doctor One",
        email: "doctor@phc.com",
        role: "DOCTOR"
    },
    {
        name: "Lab Tech",
        email: "lab@phc.com",
        role: "LAB_TECH"
    },
    {
        name: "Pharmacist",
        email: "pharma@phc.com",
        role: "PHARMACIST"
    }
];

async function main() {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const seeded = await Promise.all(
        users.map((user) =>
            prisma.user.create({
                data: {
                    ...user,
                    password: hashedPassword
                }
            })
        )
    );

    console.log(
        "✅ Seeded users:",
        seeded.map((u) => ({ email: u.email, role: u.role }))
    );
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
