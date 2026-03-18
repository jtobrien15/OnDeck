import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Upsert SystemSettings with placeholder values (confirm actual values with Red Cross)
  await prisma.systemSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      evaluationOptions: [
        "Successful completion",
        "Unsuccessful completion",
        "Incomplete",
      ],
      reasonOptions: [
        "Did not pass final skills test",
        "Did not pass written exam",
        "Did not complete required skills",
        "Did not attend required sessions",
        "Medical reasons",
        "Personal reasons",
        "Other",
      ],
      prereqMinDaysBefore: 3,
      prereqMaxDaysBefore: 30,
      reminderDaysBefore: 3,
      nudgeDaysAfterReg: 7,
      certDeadlineDays: 10,
      waitlistResponseHours: 48,
    },
  });

  console.log("SystemSettings seeded.");
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
