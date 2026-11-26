import 'server-only'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export function createAppAuth(collection: 'users') {
  return {
    async currentUser() {
      const token = (await cookies()).get('app-session')?.value
      if (!token) return null
      const payload = await getPayload({ config })
      const { user } = await payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })
      return user?.collection === collection && user.status === 'approved' ? user : null
    },
    async login(email: string, password: string) {
      const payload = await getPayload({ config })
      const result = await payload.login({ collection, data: { email, password } })
      if (!result.token) throw new Error('Unable to sign in.')
      ;(await cookies()).set('app-session', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7200 })
      return result.user
    },
    async logout() { (await cookies()).delete('app-session') },
  }
}
export const appAuth = createAppAuth('users')
