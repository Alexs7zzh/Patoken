import { PrismaClient } from '@prisma/client'
import Iron from '@hapi/iron'

const prisma = new PrismaClient()
const SESSION_NAME = 'session'
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET

async function decrypt(data) {
	return data && Iron.unseal(data, ENCRYPTION_SECRET, Iron.defaults)
}

async function getSession(cookie) {
	return await decrypt(cookie)
}

export default async function handler(req, res) {
	try {
		if (req.method === 'GET') {
			let options = {}
			if (req.query.author) options = { postAuthor: req.query.author }
			else if (req.query.id) options = { postId: { in: req.query.id } }
			else {
				res.status(404).end()
				return
			}

			const comments = await prisma.comment.findMany({
				where: options,
				select: {
					id: true,
					text: true,
					quote: true,
					selectors: true,
					postId: true,
					updatedAt: true,
					category: true,
					author: {
						select: {
							name: true
						}
					}
				}
			})

			res
				.status(200)
				.json(comments.map(i => ({ ...i, author: i.author.name })))
				.end()
			return
		}

		// authorization
		const session = req.cookies[SESSION_NAME]
		if (!session) {
			res.status(401).send('Not authorized').end()
			return
		}
		const user = await getSession(session)
		const { id } = await prisma.user.findUnique({
			where: {
				email: user.email
			}
		})

		if (req.method === 'POST') {
			await prisma.comment.create({
				data: {
					text: req.body.text,
					selectors: req.body.selectors,
					quote: req.body.quote,
					author: {
						connect: { id }
					},
					postId: req.body.postId,
					postAuthor: req.body.postAuthor,
					category: req.body.category
				}
			})

			res.status(200).end()
			return
		}

		const comment = await prisma.comment.findUnique({
			where: {
				id: Number(req.query.id)
			},
			select: {
				authorId: true
			}
		})

		if (req.method === 'DELETE') {
			if (comment.authorId === id) {
				await prisma.comment.delete({
					where: {
						id: Number(req.query.id)
					}
				})
				res.status(200).end()
				return
			} else {
				res.status(401).send('Not authorized').end()
				return
			}
		}

		if (req.method === 'PUT') {
			if (comment.authorId === id) {
				await prisma.comment.update({
					where: {
						id: Number(req.query.id)
					},
					data: {
						text: req.body.text,
						category: req.body.category
					}
				})
				res.status(200).end()
				return
			} else {
				res.status(401).send('Not authorized').end()
				return
			}
		}
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message).end()
		return
	}
}
