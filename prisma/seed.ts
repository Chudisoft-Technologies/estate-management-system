import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles"; // Adjust path if needed

const prisma = new PrismaClient();

async function main() {
  // Hash the password
  const hashedPassword = await bcrypt.hash("adminpassword", 10);

  // Create a default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@chudisoft.com" },
    update: {},
    create: {
      email: "admin@chudisoft.com",
      fullName: "Admin User", // Change 'fullname' to 'fullName'
      password: hashedPassword,
      role: ROLES.ADMIN, // Use the constant here

      username: "adminuser",
      phone: "1234567890",
      contactAddress: "123 Admin St",
      state: "AdminState",
      lga: "AdminLGA",
      country: "AdminCountry",
    },
  });

  console.log("Default admin user created:", adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
