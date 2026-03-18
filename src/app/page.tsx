import Link from "next/link"

export default function Home() {
  return (
    <main>
      <h1>Cloud Notes</h1>
      <p>Your notes, safe in the cloud. Accessible from any device.</p>
      <Link href="/sign-up">Create account</Link>
      <Link href="/sign-in">Sign in</Link>
    </main>
  )
}
