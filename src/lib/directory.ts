// Client-side phone -> ChatHub user directory.
// The backend has no "find user by phone" endpoint, so each account publishes
// its own phone->user_id mapping here after login/signup. This lets the UI map
// a phonebook contact to the user_id needed for WebSocket messaging.
// Works across tabs in the same browser (and could be swapped for a real
// directory/contact-sync API later).

const KEY = 'chathub_phone_directory'

export function publishUser(phone: string, userId: number) {
  try {
    const dir = readDirectory()
    dir[phone] = userId
    localStorage.setItem(KEY, JSON.stringify(dir))
  } catch {
    // storage unavailable — non fatal
  }
}

export function resolveUserIdByPhone(phone: string): number | null {
  const dir = readDirectory()
  return dir[phone] ?? null
}

function readDirectory(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}