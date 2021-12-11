<svelte:options immutable={true} />

<script lang="ts">
	export let comment

	import { onMount } from 'svelte'
	import { userStore } from '$lib/auth'
	import { addToast, removeToast } from '$lib/toast'
	import { highlightComment, removeHighlightById } from '$lib/highlight'
	import { page } from '$app/stores'
	import { commentStore, editComment, scrollToHighlight } from '$lib/comment'

	$: ({ refresh } = commentStore($page.path.slice(1)))

	onMount(() => {
		highlightComment(comment, { animate: false, id: comment.id, postId: comment.postId })

		return () => removeHighlightById(comment.id)
	})

	function deleteComment(commentId: number) {
		let id = addToast('Deleting', 'info', 0)
		fetch(`${import.meta.env.VITE_API_URL}/comment?id=${commentId}`, {
			method: 'DELETE',
			credentials: 'include'
		}).then(res => {
			removeToast(id)
			if (res.status === 200) {
				addToast('Deleted')
				refresh()
			} else {
				addToast('Fail to delete!', 'warn')
			}
		})
	}
</script>

<div class="meta">
	<p>{comment.author}</p>
	{#if $userStore && $userStore.name === comment.author}
		<div class="buttons">
			<button on:click={() => editComment(comment)}>
				<svg class="edit" viewBox="0 0 512.009 512.009">
					<path
						d="M397.96 330.099c-13.755 0-24.872 11.118-24.872 24.872v78.125c0 13.73-11.143 24.872-24.872 24.872H74.617c-13.73 0-24.872-11.143-24.872-24.872V109.754c0-13.73 11.143-24.872 24.872-24.872h144.509c13.754 0 24.872-11.118 24.872-24.872s-11.118-24.872-24.872-24.872H74.617C33.478 35.136 0 68.615 0 109.754v323.342c0 41.139 33.478 74.617 74.617 74.617h273.597c41.139 0 74.617-33.453 74.617-74.617v-78.124c.001-13.755-11.117-24.873-24.871-24.873z" />
					<path
						d="M484.193 31.977c-18.057-18.057-41.637-27.161-65.39-27.658-24.997-.547-50.143 8.506-69.046 27.434L181.37 200.14c-24.574 24.674-38.105 57.406-38.105 92.177v55.714c0 13.754 11.118 24.872 24.872 24.872h55.714c34.772 0 67.504-13.531 92.202-38.13L484.216 166.61c37.061-37.083 37.061-97.523-.023-134.633zM280.91 299.581c-15.247 15.197-35.543 23.579-57.057 23.579H193.01v-30.842c0-21.515 8.382-41.811 23.554-57.033L327.57 124.279l64.32 64.32-110.98 110.982zm168.113-168.114L427.06 153.43l-64.32-64.32 21.962-21.962c17.759-17.759 46.611-17.709 64.32 0 17.71 17.733 17.71 46.585.001 64.319z" />
				</svg>
			</button>
			<button on:click={() => deleteComment(comment.id)}>
				<svg class="delete" viewBox="0 0 512 512">
					<path
						d="M184 22.1c-4.4 1.8-9 5.9-11.3 10.2-2.1 4-2.2 5.6-2.5 28.4l-.3 24.3H80.4l-5.1 2.5c-3.2 1.6-6.1 4.1-7.9 6.7-2.6 3.7-2.9 4.9-2.9 12.4s.3 8.6 3 12.5c1.7 2.3 5 5.3 7.4 6.6l4.4 2.3h353.4l4.4-2.3c2.7-1.4 5.7-4.2 7.7-7.3 3.2-4.7 3.4-5.3 3-12.5-.4-9.5-3.4-14.5-11.1-18.4l-5.1-2.5h-89.5l-.3-24.3c-.3-23.7-.4-24.3-2.8-28.7-1.4-2.4-4.5-5.8-6.8-7.5l-4.4-3-70.6-.2c-45.1-.1-71.6.2-73.2.8zm114 52.4V85h-84V64h84v10.5zM97.5 150.9c-4.9 2.3-8.9 6.4-10.9 11.3-1.4 3.3-1.6 18-1.6 128.7 0 135.3-.1 131.8 5.5 146.6 7.9 21 26.8 40.1 47.6 47.9 15.1 5.7 13.5 5.6 117.9 5.6s102.8.1 117.9-5.6c20.6-7.8 39.7-26.9 47.5-47.5 5.8-15.4 5.6-10.7 5.6-147.1 0-119.8-.1-125.5-1.9-129.3-6.9-15-28.4-16.8-37.7-3.3l-2.9 4.1-.5 126.1c-.5 137.1-.1 127.1-5.9 138.3-4.9 9.8-17.5 18.3-29.7 20.3-7.8 1.3-177 1.3-184.8 0-12.4-2-24.7-10.4-29.8-20.3-5.7-11.2-5.3-1.2-5.8-138.3l-.5-126.1-2.9-4.1c-5.6-8.2-18-11.5-27.1-7.3z" /><path
						d="M203.5 193.6c-4.4 2.4-7.5 5.5-9.6 9.6-1.8 3.6-1.9 7.1-1.9 84.6v80.9l2.3 4.4c1.3 2.4 4.3 5.7 6.6 7.4 3.9 2.7 5 3 12.5 3s8.7-.3 12.4-2.9c2.6-1.8 5.1-4.7 6.7-7.9l2.5-5.1V208.4l-2.5-5.1c-1.6-3.2-4.1-6.1-6.7-7.9-3.5-2.5-5.2-2.9-11.7-3.2-5.5-.2-8.4.2-10.6 1.4zM289.5 193.4c-4.4 2-8.3 6-10.5 10.8-1.9 4.1-2 7.4-2 83.9v79.5l2.5 5.1c3.8 7.5 8.9 10.7 17.9 11.1 9.1.4 14.6-2.2 19.4-9.2l3.2-4.8v-81.5c0-88.4.3-84-5.4-90.1-5.2-5.8-17.5-8.1-25.1-4.8z" /></svg>
			</button>
		</div>
	{/if}
</div>
<blockquote on:click={() => scrollToHighlight(comment.id)}>
	{@html comment.quote}
</blockquote>
<p class="comment-text">{@html comment.text}</p>

<style lang="scss">
	.meta {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		user-select: none;
		p {
			font-weight: bold;
			cursor: default;
		}
	}

	button {
		border: none;
		background: none;
		padding: 0;
		cursor: pointer;
	}

	.buttons {
		@media screen and (min-width: 680px) {
			opacity: 0;
			visibility: hidden;
			transition: opacity 0.5s ease-out;
		}
	}

	blockquote {
		cursor: pointer;
		@media screen and (max-width: 680px) {
			display: none;
		}
	}

	.edit {
		fill: var(--color-blue-text);
		width: 1.1em;
		height: 1.1em;
		vertical-align: baseline;
	}

	.delete {
		margin-left: 0.3em;
		fill: var(--color-melon-dark);
		width: 1.2em;
		height: 1.2em;
		vertical-align: baseline;
	}

	.comment-text {
		white-space: pre-wrap;
		font-size: 0.9em;
		@media screen and (max-width: 680px) {
			height: calc(40vh - var(--line-height) * 2.5);
			padding-bottom: var(--spacing);
			overflow: scroll;
			overscroll-behavior: contain;
			scrollbar-width: none;
			&::-webkit-scrollbar {
				display: none;
			}
		}
	}
</style>
