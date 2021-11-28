import { Magic } from '@magic-sdk/admin'
import { serialize } from 'cookie'
import Iron from '@hapi/iron'
import { PrismaClient } from '@prisma/client'

const MAGIC_SECRET_KEY = process.env.MAGIC_SECRET_KEY
const magic = new Magic(MAGIC_SECRET_KEY)
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET
const SESSION_LENGTH_MS = 604800000
const SESSION_NAME = 'session'
const prisma = new PrismaClient()

async function encrypt(data) {
	return data && Iron.seal(data, ENCRYPTION_SECRET, Iron.defaults)
}

async function createSessionCookie(data) {
	const encrypted_data = await encrypt(data)

	return serialize(SESSION_NAME, encrypted_data, {
		maxAge: SESSION_LENGTH_MS / 1000,
		expires: new Date(Date.now() + SESSION_LENGTH_MS),
		httpOnly: true,
		secure: process.env['NODE_ENV'] === 'production',
		path: '/',
		sameSite: 'lax'
	})
}

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		res.status(405).send('Method not allowed')
		return
	}

	try {
		// Parse and validate the DID token
		const didToken = magic.utils.parseAuthorizationHeader(req.headers['authorization'])
		magic.token.validate(didToken)

		// Token is valid, so get the user metadata and set it in a cookie.
		const metadata = await magic.users.getMetadataByToken(didToken)
		const result = await prisma.user.findUnique({
			where: {
				email: metadata.email
			}
		})

		const cookie = await createSessionCookie({
			email: metadata.email,
			name: result && result.name
		})

		res.setHeader('Set-Cookie', cookie)
		res
			.status(200)
			.json({
				email: metadata.email,
				name: result && result.name
			})
			.end()
		return
	} catch (err) {
		res.status(500).send(err.message).end()
		return
	}
}
