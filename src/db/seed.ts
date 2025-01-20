import { hash } from "bcrypt";
import { db } from ".";
import { roles } from "../config/constant";
import { rolesTable, usersTable } from "./schema";

async function seed() {
  try {
    for (const role of roles) {
      await db
        .insert(rolesTable)
        .values(role)
        .onConflictDoNothing({ target: rolesTable.name });
    }

    const adminPassword = await hash("admin123", 10);
    const adminUser: typeof usersTable.$inferInsert = {
      name: "Admin",
      email: "admin@example.com",
      gender: "Male",
      password: adminPassword,
      image: "",
      phone: "0000000000",
      department: "Administration",
      roleId: 1,
    };
    await db
      .insert(usersTable)
      .values(adminUser)
      .onConflictDoNothing({ target: usersTable.name });
    console.log("Seeding completed");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

seed();
