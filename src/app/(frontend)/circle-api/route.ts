import { getPayload } from 'payload'
import config from '@payload-config'
import { appAuth } from '@/lib/app-auth'

export async function GET() {
  const payload = await getPayload({ config })
  const user = await appAuth.currentUser()
  const welcome = await payload.find({ collection: 'media', overrideAccess: false, user, where: { welcome: { equals: true } }, limit: 4 })
  if (!user) return Response.json({ user: null, welcome: welcome.docs, memories: [], messages: [], members: [], reactions: [] })
  const [memories, messages, members, reactions] = await Promise.all([
    payload.find({ collection: 'memories', overrideAccess: false, user, sort: '-createdAt', limit: 100, depth: 2 }),
    payload.find({ collection: 'messages', overrideAccess: false, user, sort: '-createdAt', limit: 60, depth: 2 }),
    payload.find({ collection: 'users', overrideAccess: false, user, limit: 100, select: { name: true, username: true, birthday: true, avatar: true, typingAt: true, status: true } }),
    payload.find({ collection: 'reactions', overrideAccess: false, user, limit: 100, depth: 0 }),
  ])
  return Response.json({ user, welcome: welcome.docs, memories: memories.docs, messages: messages.docs.reverse(), members: members.docs, reactions: reactions.docs })
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin')
    if (origin && origin !== `https://${request.headers.get('x-forwarded-host')}` && origin !== new URL(request.url).origin && origin !== process.env.FIGMA_PUBLIC_URL && origin !== process.env.NEXT_PUBLIC_SITE_URL) return Response.json({ error: 'Invalid request origin.' }, { status: 403 })
    const payload = await getPayload({ config })
    const form = await request.formData()
    const action = String(form.get('action') || '')
    const text = (key: string, max = 1000) => String(form.get(key) || '').trim().slice(0, max)
    if (action === 'login') { await appAuth.login(text('email', 254), text('password', 200)); return Response.json({ ok: true }) }
    if (action === 'logout') { await appAuth.logout(); return Response.json({ ok: true }) }
    if (action === 'register') {
      if (!text('name') || !text('username') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text('email')) || text('password').length < 8 || !Number.isFinite(Date.parse(text('birthday')))) throw new Error('Enter all fields, a valid birthday, and a password of at least 8 characters.')
      const avatarFile = form.get('avatar')
      if (!(avatarFile instanceof File) || !avatarFile.type.startsWith('image/') || avatarFile.size > 5 * 1024 * 1024 || !avatarFile.size) throw new Error('Choose a profile photo smaller than 5 MB.')
      const avatar = await payload.create({ collection: 'media', overrideAccess: false, context: { registrationUpload: true }, data: { alt: 'Member profile photo' }, file: { data: Buffer.from(await avatarFile.arrayBuffer()), mimetype: avatarFile.type, name: avatarFile.name, size: avatarFile.size } })
      await payload.create({ collection: 'users', overrideAccess: false, data: { name: text('name', 80), username: text('username', 40), email: text('email', 254), password: text('password', 200), birthday: text('birthday'), avatar: avatar.id } })
      return Response.json({ ok: true, message: 'Registration received. An admin must approve your account before you can sign in.' })
    }
    const user = await appAuth.currentUser()
    if (!user) return Response.json({ error: 'Sign in with an approved account to continue.' }, { status: 401 })
    if (action === 'message') {
      if (!text('text')) throw new Error('Write a message first.')
      await payload.create({ collection: 'messages', overrideAccess: false, user, data: { text: text('text', 2000), ...(text('replyTo') ? { replyTo: text('replyTo') } : {}) } })
    } else if (action === 'react') {
      const target = text('message') ? { message: text('message') } : { memory: text('memory') }
      const [field, value] = Object.entries(target)[0]
      const existing = await payload.find({ collection: 'reactions', overrideAccess: false, user, limit: 1, where: { and: [{ author: { equals: user.id } }, { [field]: { equals: value } }] } })
      if (existing.docs[0]) await payload.delete({ collection: 'reactions', id: existing.docs[0].id, overrideAccess: false, user })
      else await payload.create({ collection: 'reactions', overrideAccess: false, user, data: { kind: 'love', ...target } })
    } else if (action === 'typing') {
      await payload.update({ collection: 'users', id: user.id, overrideAccess: false, user, data: { typingAt: new Date().toISOString() } })
    } else if (action === 'settings') {
      if (!text('name')) throw new Error('Your real name is required.')
      await payload.update({ collection: 'users', id: user.id, overrideAccess: false, user, data: { name: text('name', 80), bio: text('bio', 500) } })
    } else if (action === 'upload' || action === 'avatar') {
      const file = form.get('file')
      if (!(file instanceof File) || !/^(image|video)\//.test(file.type) || file.size > 30 * 1024 * 1024) throw new Error('Choose an image or video smaller than 30 MB.')
      if (action === 'upload' && (!text('description') || !Number.isFinite(Date.parse(text('date'))))) throw new Error('Add a description and valid date.')
      const media = await payload.create({ collection: 'media', overrideAccess: false, user, data: { alt: text('description') || 'Profile picture' }, file: { data: Buffer.from(await file.arrayBuffer()), mimetype: file.type, name: file.name, size: file.size } })
      if (action === 'avatar') await payload.update({ collection: 'users', id: user.id, overrideAccess: false, user, data: { avatar: media.id } })
      else await payload.create({ collection: 'memories', overrideAccess: false, user, data: { file: media.id, description: text('description'), date: text('date') } })
    } else throw new Error('Unknown action.')
    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Something went wrong. Please try again.' }, { status: 400 })
  }
}
