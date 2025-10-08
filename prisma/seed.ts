import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@company.com";
  const name  = "Super Admin";
  const password = "allah123";

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", name },
    create: { email, name, role: "ADMIN" },
  });

  const hash = await bcrypt.hash(password, 10);
  // store the password hash in VerificationToken table with a special identifier
  await prisma.verificationToken.upsert({
    where: { identifier_token: { identifier: `pwd:${admin.id}`, token: hash } },
    update: { token: hash },
    create: { identifier: `pwd:${admin.id}`, token: hash, expires: new Date("2999-12-31") },
  });

  console.log("Seeded admin:", email, "password:", password);
}

main().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
