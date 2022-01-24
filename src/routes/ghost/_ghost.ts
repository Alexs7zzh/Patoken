import Cache from '@11ty/eleventy-cache-assets'
import type { Post, Author, AsidePost } from '$lib/types'

const apiUrl = data =>
	`${import.meta.env.VITE_GHOST_URL}/ghost/api/v4/content/${data}/?key=${import.meta.env.VITE_GHOST_API}&limit=all`

export async function getAuthors(): Promise<Author[]> {
	const { authors: data } = (await Cache(apiUrl('authors'), { duration: '1m', type: 'json' })) as {
		authors: Array<any>
	}

	const authors = data
		.slice(0, data.length)
		.filter(i => i.name !== 'Ghost')
		.map(i => ({
			name: i.name,
			slug: i.slug
		}))

	return authors
}

async function getPosts(): Promise<Array<any>> {
	let { posts } = (await Cache(apiUrl('posts') + '&include=authors', { duration: '1m', type: 'json' })) as {
		posts: Array<any>
	}

	for (let i of posts) {
		let match = i.title.match(/\d{4}\/(\d{1,2}\/\d{1,2})/)
		if (match) i.title = match[1]
	}

	return posts
}

export async function getPostsByAuthor(author: string): Promise<Post[]> {
	const posts = await getPosts()
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
	const posts = await getPosts()
	return posts.slice(page * 5 - 5, page * 5).map(i => ({
		title: i.title,
		slug: i.slug,
		html: i.html,
		author: i.primary_author.name,
		authorSlug: i.primary_author.slug
	}))
}

export async function getPaginationUrls(): Promise<{ urls: string[]; postsOnPage: Record<string, string[]> }> {
	const posts = await getPosts()
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
	const posts = await getPosts()

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
