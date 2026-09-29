// prisma/seed.ts
import { PrismaClient, Role, Priority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ─── Clean existing data (respect FK order) ───
  console.log("🧹 Cleaning existing data...");
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.userGroup.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ All existing data removed");

  // ─── Admin ───
  const adminPassword = await bcrypt.hash("123123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log("👤 Admin created:", admin.email);

  // ─── Regular users ───
  const userPassword = await bcrypt.hash("123123", 10);

  const userNames = [
    "Jasmin",
    "Shan",
    "Star",
    "Vinz",
    "Jem",
    "Rev",
    "Lawrence",
    "Tene",
    "Norman",
    "Jer",
    "Ber",
    "Pat C",
    "Artem",
    "Bago",
    "Mhay",
  ];

  const users = [];
  for (const name of userNames) {
    const u = await prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        passwordHash: userPassword,
        role: Role.USER,
      },
    });
    users.push(u);
  }
  console.log(`👥 ${users.length} users created`);

  // ─── Groups ───
  const aug10Group = await prisma.group.create({
    data: {
      name: "Aug 10 Group",
      description: "Team working on the Aug 10 batch",
    },
  });

  const aug3Group = await prisma.group.create({
    data: {
      name: "Aug 3 Group",
      description: "Team working on the Aug 3 batch",
    },
  });
  console.log("🗂️  2 groups created");

  // ─── Assign users to groups ───
  const aug10Members = [
    "Jasmin",
    "Shan",
    "Star",
    "Vinz",
    "Jem",
    "Rev",
    "Lawrence",
  ];
  const aug3Members = [
    "Tene",
    "Norman",
    "Jer",
    "Ber",
    "Star",
    "Shan",
    "Pat C",
    "Artem",
    "Vinz",
    "Bago",
    "Mhay",
    "Jasmin",
  ];

  const userByName = new Map(users.map((u) => [u.name, u]));

  const memberships: { userId: string; groupId: string }[] = [];
  for (const name of aug10Members) {
    const u = userByName.get(name);
    if (u) memberships.push({ userId: u.id, groupId: aug10Group.id });
  }
  for (const name of aug3Members) {
    const u = userByName.get(name);
    if (u) memberships.push({ userId: u.id, groupId: aug3Group.id });
  }

  await prisma.userGroup.createMany({ data: memberships });
  console.log(`🔗 ${memberships.length} group memberships created`);

  // ─── Sample tasks ───
  // Each user creates their own task; admin will "monitor" them.
  const sampleTasks: {
    author: string;
    groupId: string;
    title: string;
    description: string;
    priority: Priority;
    dueDate: Date;
  }[] = [
    {
      author: "Jasmin",
      groupId: aug10Group.id,
      title: "Prepare Aug 10 inventory list",
      description:
        "Compile the full list of items for the Aug 10 batch and verify counts.",
      priority: Priority.HIGH,
      dueDate: new Date("2026-08-08"),
    },
    {
      author: "Shan",
      groupId: aug10Group.id,
      title: "Coordinate with supplier",
      description:
        "Confirm delivery schedule with the supplier for the Aug 10 batch.",
      priority: Priority.MEDIUM,
      dueDate: new Date("2026-08-09"),
    },
    {
      author: "Star",
      groupId: aug10Group.id,
      title: "QA check on received items",
      description:
        "Inspect all items received and log any damages or discrepancies.",
      priority: Priority.URGENT,
      dueDate: new Date("2026-08-09"),
    },
    {
      author: "Vinz",
      groupId: aug10Group.id,
      title: "Update tracking spreadsheet",
      description:
        "Reflect the latest counts and statuses in the shared tracking sheet.",
      priority: Priority.LOW,
      dueDate: new Date("2026-08-11"),
    },
    {
      author: "Tene",
      groupId: aug3Group.id,
      title: "Reconcile Aug 3 deliveries",
      description:
        "Match deliveries against the Aug 3 order forms and flag mismatches.",
      priority: Priority.HIGH,
      dueDate: new Date("2026-08-05"),
    },
    {
      author: "Norman",
      groupId: aug3Group.id,
      title: "Archive Aug 3 documents",
      description: "Scan and archive all Aug 3 receipts and delivery notes.",
      priority: Priority.MEDIUM,
      dueDate: new Date("2026-08-06"),
    },
    {
      author: "Jer",
      groupId: aug3Group.id,
      title: "Follow up on unpaid entries",
      description: "Contact the 3 unpaid debtors and record their responses.",
      priority: Priority.URGENT,
      dueDate: new Date("2026-08-07"),
    },
    {
      author: "Ber",
      groupId: aug3Group.id,
      title: "Print summary report",
      description: "Generate and print the Aug 3 summary report for the admin.",
      priority: Priority.LOW,
      dueDate: new Date("2026-08-08"),
    },
  ];

  for (const t of sampleTasks) {
    const author = userByName.get(t.author);
    if (!author) continue;

    await prisma.task.create({
      data: {
        title: t.title,
        description: t.description,
        priority: t.priority,
        dueDate: t.dueDate,
        authorId: author.id,
        groupId: t.groupId,
        activityLogs: {
          create: {
            actorId: author.id,
            action: "CREATED",
            metadata: { source: "seed" },
          },
        },
      },
    });
  }
  console.log(`📝 ${sampleTasks.length} sample tasks created`);

  // ─── Admin reviews one task as a demo ───
  const firstTask = await prisma.task.findFirst({
    where: { author: { name: "Jasmin" } },
    orderBy: { createdAt: "asc" },
  });

  if (firstTask) {
    await prisma.task.update({
      where: { id: firstTask.id },
      data: {
        reviewedById: admin.id,
        reviewedAt: new Date(),
        reviewNotes: "Reviewed during seed. Looks complete.",
        activityLogs: {
          create: {
            actorId: admin.id,
            action: "REVIEWED",
            metadata: { source: "seed" },
          },
        },
      },
    });
    console.log("🔍 Admin reviewed one task as a demo");
  }

  console.log("\n✅ Seed completed!");
  console.log("   - Admin login: admin@example.com / 123123");
  console.log(
    `   - ${users.length} user logins (e.g. jasmin@example.com / 123123)`,
  );
  console.log(`   - ${sampleTasks.length} tasks`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
