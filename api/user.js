import { serialize } from 'cookie'
import Iron from '@hapi/iron'
import { PrismaClient } from '@prisma/client'

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET
const SESSION_LENGTH_MS = 604800000
const SESSION_NAME = 'session'
const prisma = new PrismaClient()

async function encrypt(data) {
	return data && Iron.seal(data, ENCRYPTION_SECRET, Iron.defaults)
}

async function decrypt(data) {
	return data && Iron.unseal(data, ENCRYPTION_SECRET, Iron.defaults)
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

async function getSession(cookie) {
	return await decrypt(cookie)
}

export default async function handler(req, res) {
	if (req.method === 'GET') {
		try {
			const session = req.cookies[SESSION_NAME]
			if (!session) {
				res.status(200).end()
				return
			}

			const user = await getSession(session)
			const cookie = await createSessionCookie(user)

			if (!user.name && user.email) {
				const { name } = await prisma.user.findUnique({
					where: {
						email: user.email
					}
				})
				user.name = name
			}

			res.setHeader('Set-Cookie', cookie)
			res
				.status(200)
				.json({
					user: user
				})
				.end()
			return
		} catch (err) {
			res.status(500).send(err.message).end()
			return
		}
	} else if (req.method === 'POST') {
		try {
			const session = req.cookies[SESSION_NAME]
			if (!session) res.status(401).end()

			const user = await getSession(req.cookies[SESSION_NAME])
			await prisma.user.create({
				data: {
					email: user.email,
					name: req.body.name
				}
			})

			res.status(200).end()
			return
		} catch (err) {
			console.log(err)
			res.status(500).send(err.message).end()
			return
		}
	} else {
		res.status(405).send('Method not allowed').end()
		return
	}
}
