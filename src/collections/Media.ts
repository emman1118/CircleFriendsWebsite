import type { CollectionConfig } from 'payload'

import { createFolderField, createTagField } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: async ({ req }) => {
      if (req.user?.collection === 'admins' || (req.user?.collection === 'users' && req.user.status === 'approved')) return true
      const token = req.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith('app-session='))?.slice('app-session='.length)
      if (token) {
        const { user } = await req.payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })
        if (user?.collection === 'users' && user.status === 'approved') return true
      }
      return { welcome: { equals: true } }
    },
    create: ({ req }) => req.context.registrationUpload === true || req.user?.collection === 'admins' || (req.user?.collection === 'users' && req.user.status === 'approved'),
    update: ({ req }) => req.user?.collection === 'admins',
    delete: ({ req }) => req.user?.collection === 'admins',
  },
  fields: [
    { name: 'welcome', type: 'checkbox', defaultValue: false, access: { create: ({ req }) => req.user?.collection === 'admins', update: ({ req }) => req.user?.collection === 'admins' } },
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  upload: {
    mimeTypes: ['image/*', 'video/*'],
    modifyResponseHeaders: ({ headers }) => { headers.set('Cache-Control', 'private, no-store'); return headers },
  },
}
