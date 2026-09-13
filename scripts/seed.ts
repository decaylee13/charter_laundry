import { db } from "@/db";
import { machines, users } from "../src/db/schema";

async function main() {
    await db.insert(machines).values([
        { type: "washer", label: "Washer" },
        { type: "dryer", label: "Dryer" },
    ]).onConflictDoNothing();

    await db.insert(users).values({
        netId: "dl2635",
        firstName: "DK",
        lastName: "Lee",
        isAdmin: true,
    }).onConflictDoNothing();

    console.log("seeded washer, dryer, and admin");
    process.exit(0);
}

main();
