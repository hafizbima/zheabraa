const MAP = {
  'auth/email-already-in-use': 'Email sudah terdaftar',
  'auth/invalid-email': 'Format email tidak valid',
  'auth/wrong-password': 'Email atau password salah',
  'auth/user-not-found': 'Email atau password salah',
  'auth/invalid-credential': 'Email atau password salah',
  'auth/weak-password': 'Password minimal 6 karakter',
  'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti',
  'auth/network-request-failed': 'Gagal terhubung ke internet',
  'auth/popup-closed-by-user': 'Login dibatalkan',
  'auth/operation-not-allowed': 'Metode login tidak diizinkan',
  'invalid_credentials': 'Email atau password salah',
  'user_already_exists': 'Email sudah terdaftar',
  'email_not_confirmed': 'Email belum dikonfirmasi',
  'weak_password': 'Password minimal 6 karakter',
  'validation_failed': 'Format email tidak valid',
  'rate_limit': 'Terlalu banyak percobaan, coba lagi nanti',
  'email_address_invalid': 'Format email tidak valid',
  'over_email_send_rate_limit': 'Tidak bisa kirim email konfirmasi (batas pengiriman tercapai). Atur SMTP di Supabase atau nonaktifkan konfirmasi email.',
}

const MESSAGE_PATTERNS = [
  [/invalid login credentials/i, 'Email atau password salah'],
  [/user already registered/i, 'Email sudah terdaftar'],
  [/email not confirmed/i, 'Email belum dikonfirmasi'],
  [/invalid email|unable to validate email/i, 'Format email tidak valid'],
  [/at least 6 characters/i, 'Password minimal 6 karakter'],
  [/rate limit|too many requests/i, 'Terlalu banyak percobaan, coba lagi nanti'],
  [/fetch|network|failed to fetch/i, 'Gagal terhubung ke internet'],
]

export function friendlyAuthError(e) {
  if (!e) return 'Terjadi kesalahan'
  if (e.code && MAP[e.code]) return MAP[e.code]
  const msg = String(e.message || '')
  for (const [re, label] of MESSAGE_PATTERNS) {
    if (re.test(msg)) return label
  }
  return msg || 'Terjadi kesalahan'
}
