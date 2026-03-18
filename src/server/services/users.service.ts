import { db, users } from "@/server/db"
import type { User } from "@/server/db"
import { eq } from "drizzle-orm"
import bcryptjs from "bcryptjs"

export class EmailInUseError extends Error {
  constructor() {
    super("EMAIL_IN_USE")
    this.name = "EmailInUseError"
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  )
}

export async function createUser(
  email: string,
  password: string
): Promise<Omit<User, "hashedPassword">> {
  const normalizedEmail = email.toLowerCase().trim()

  const existing = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  })

  if (existing) throw new EmailInUseError()

  const hashedPassword = await bcryptjs.hash(password, 12)

  let inserted: User
  try {
    const [row] = await db
      .insert(users)
      .values({ email: normalizedEmail, hashedPassword })
      .returning()

    if (!row) throw new Error("INSERT_RETURNED_EMPTY")
    inserted = row
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new EmailInUseError()
    throw error
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hashedPassword: _hashedPassword, ...safeUser } = inserted
  return safeUser
}
