import type { Access, CollectionConfig, FieldAccess, Where } from 'payload'

const admin: Access = ({ req }) => req.user?.collection === 'admins'
const adminField: FieldAccess = ({ req }) => req.user?.collection === 'admins'
const member: Access = ({ req }) => req.user?.collection === 'admins' || (req.user?.collection === 'users' && req.user.status === 'approved')
const own: Access = ({ req }) => req.user?.collection === 'admins' ? true : req.user?.collection === 'users' ? { id: { equals: req.user.id } } : false
const author: Access = ({ req }) => req.user?.collection === 'admins' ? true : req.user?.collection === 'users' && req.user.status === 'approved' ? { author: { equals: req.user.id } } : false

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'name', group: 'Circle' },
  access: {
    create: () => true,
    read: ({ req }): boolean | Where => req.user?.collection === 'admins' ? true : req.user?.collection === 'users' ? req.user.status === 'approved' ? { status: { equals: 'approved' } } : { id: { equals: req.user.id } } : false,
    update: own, delete: admin, admin: () => false,
  },
  hooks: { beforeLogin: [({ user }) => { if (user.status !== 'approved') throw new Error('Your membership is awaiting admin approval.') }] },
  fields: [
    { name: 'email', type: 'email', required: true, access: { read: ({ req, doc }) => req.user?.collection === 'admins' || (req.user?.collection === 'users' && req.user.id === doc?.id) } },
    { name: 'name', type: 'text', required: true, maxLength: 80 },
    { name: 'username', type: 'text', required: true, unique: true, maxLength: 40 },
    { name: 'birthday', type: 'date', required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea', maxLength: 500 },
    { name: 'status', type: 'select', options: ['pending', 'approved', 'declined'], defaultValue: 'pending', saveToJWT: true, access: { create: adminField, update: adminField } },
    { name: 'typingAt', type: 'date' },
  ],
}

export const Memories: CollectionConfig = {
  slug: 'memories',
  admin: { useAsTitle: 'description', group: 'Circle' },
  access: { read: member, create: member, update: author, delete: author },
  hooks: { beforeChange: [({ data, req, operation }) => { if (operation === 'create' && req.user?.collection === 'users') data.author = req.user.id; return data }] },
  fields: [
    { name: 'description', type: 'text', required: true, maxLength: 1000 },
    { name: 'date', type: 'date', required: true },
    { name: 'file', type: 'upload', relationTo: 'media', required: true },
    { name: 'author', type: 'relationship', relationTo: 'users', access: { update: adminField } },
  ],
}

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: { useAsTitle: 'text', group: 'Circle' },
  access: { read: member, create: member, update: author, delete: author },
  hooks: { beforeChange: [({ data, req, operation }) => { if (operation === 'create' && req.user?.collection === 'users') data.author = req.user.id; return data }] },
  fields: [
    { name: 'text', type: 'text', required: true, maxLength: 2000 },
    { name: 'author', type: 'relationship', relationTo: 'users', access: { update: adminField } },
    { name: 'replyTo', type: 'relationship', relationTo: 'messages' },
  ],
}

export const Reactions: CollectionConfig = {
  slug: 'reactions',
  admin: { group: 'Circle' },
  access: { read: member, create: member, update: () => false, delete: author },
  hooks: { beforeChange: [({ data, req }) => { if (req.user?.collection === 'users') data.author = req.user.id; return data }] },
  fields: [
    { name: 'author', type: 'relationship', relationTo: 'users', access: { update: adminField } },
    { name: 'message', type: 'relationship', relationTo: 'messages' },
    { name: 'memory', type: 'relationship', relationTo: 'memories' },
    { name: 'kind', type: 'select', options: ['love', 'laugh', 'celebrate'], required: true },
  ],
}
