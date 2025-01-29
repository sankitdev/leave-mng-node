import { hash } from "bcrypt";
import { db } from ".";
import { roles } from "../config/constant";
import { rolesTable, usersTable } from "./schema";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../config/config";

async function seed() {
  try {
    for (const role of roles) {
      await db
        .insert(rolesTable)
        .values(role)
        .onConflictDoNothing({ target: rolesTable.name });
    }
    const adminPassword = await hash(ADMIN_PASSWORD!, 10);
    const adminUser: typeof usersTable.$inferInsert = {
      name: "Admin",
      email: ADMIN_EMAIL!,
      gender: "male",
      password: adminPassword,
      image: "",
      phone: "0000000000",
      roleId: 1,
    };
    await db.insert(usersTable).values(adminUser).onConflictDoNothing();
    console.log("Seeding completed");
    return;
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seed();
