import GhostContentAPI from '@tryghost/content-api'
import type { Post, Author, AsidePost } from '$lib/types'

let posts, authors

const api = new GhostContentAPI({
	url: import.meta.env.VITE_GHOST_URL as string,
	key: import.meta.env.VITE_GHOST_API as string,
	version: 'v3'
})

export async function getAuthors(): Promise<Author[]> {
	if (!authors) {
		const tmp = await api.authors.browse({ limit: 'all' })
		authors = tmp
			.slice(0, tmp.length)
			.filter(i => i.name !== 'Ghost')
			.map(i => ({
				name: i.name,
				slug: i.slug
			}))
	}
	return authors
}

function formatPosts(posts) {
	for (let i of posts) {
		let match = i.title.match(/\d{4}\/(\d{1,2}\/\d{1,2})/)
		if (match) i.title = match[1]
	}
	return posts
}

async function getPosts(): Promise<Post[]> {
	const posts = await api.posts.browse({ limit: 'all', include: 'authors' })
	return formatPosts(posts)
}

export async function getPostsByAuthor(author: string): Promise<Post[]> {
	posts = posts ? posts : await getPosts()
	return posts
		.filter(i => i.primary_author.slug === author)
		.map(i => ({
			title: i.title,
			slug: i.slug,
			html: i.html,
			author: i.primary_author.name,
			authorSlug: i.primary_author.slug
		}))
}

export async function getPostsByPagination(page: number): Promise<Post[]> {
	posts = posts ? posts : await getPosts()
	return posts.slice(page * 5 - 5, page * 5).map(i => ({
		title: i.title,
		slug: i.slug,
		html: i.html,
		author: i.primary_author.name,
		authorSlug: i.primary_author.slug
	}))
}

export async function getPaginationUrls(): Promise<{ urls: string[]; postsOnPage: Record<string, string[]> }> {
	posts = posts ? posts : await getPosts()
	const totalPageNumber = Math.ceil(posts.length / 5)
	const urls = Array.from(Array(totalPageNumber).keys()).map(i => {
		if (i === 0) return '/'
		return `/page/${i + 1}`
	})
	const postsOnPage = {}
	for (let i = 0; i < totalPageNumber; i++) {
		postsOnPage[urls[i]] = posts.slice(i * 5, i * 5 + 5).map(i => i.slug)
	}

	return { urls, postsOnPage }
}

export async function getAsidePostsByAuthor(author: string): Promise<AsidePost[]> {
	posts = posts ? posts : await getPosts()

	const tmp = posts
		.filter(i => i.primary_author.slug === author)
		.map(i => ({
			title: i.title.match(/\d{4}\/(\d{1,2}\/\d{1,2})/) ? i.title.match(/\d{4}\/(\d{1,2}\/\d{1,2})/)[1] : i.title,
			slug: i.slug,
			year: Number(i.published_at.substring(0, 4)),
			published_at: i.published_at
		}))

	const yearSet = new Set()
	tmp.forEach(i => yearSet.add(i.year))

	return [...yearSet]
		.sort((a: number, b: number) => b - a)
		.map(year => [
			String(year),
			tmp
				.filter(i => i.year === year)
				.sort((a, b) => b.published_at.localeCompare(a.published_at))
				.map(i => ({
					title: i.title,
					slug: i.slug
				}))
		])
}
