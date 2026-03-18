import { signOutAction } from "./actions"

export default function NotesPage() {
  return (
    <main>
      <p>Notes — coming soon</p>
      <form action={signOutAction}>
        <button type="submit">Sign out</button>
      </form>
    </main>
  )
}
