<script lang="ts">
	import Select from '$components/Elements/Select.svelte'

	import { tick } from 'svelte'
	import { slide } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import { page } from '$app/stores'

	import { addToast, removeToast } from '$lib/toast'
	import { currentComment, commentStore, state } from '$lib/comment'
	import { highlightComment, removeEditHighlights } from '$lib/highlight'
	import { smoothScroll } from '$lib/utils'

	let text,
		selected,
		options = ['考察', 'パトアンサー']
	$: ({ refresh } = commentStore($page.path.slice(1)))

	currentComment.subscribe(async comment => {
		if (!comment) return
		text = ''
		removeEditHighlights()
		if (comment.text.length === 0) highlightComment(comment, { animate: true, isEdit: true, postId: comment.postId })
		else text = comment.text
		state.set(3)

		await tick()

		if (!window.matchMedia('(max-width: 680px)').matches) smoothScroll(0, 0, document.querySelector('.scroll'))
		document.getElementById('edit-textarea').focus()
		selected = comment.category === 'BEFORE' ? options[0] : options[1]
	})

	function createComment() {
		let id = addToast('投稿中...', 'info', 0)
		fetch(`${import.meta.env.VITE_API_URL}/comment`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({
				...$currentComment,
				text,
				category: selected === options[0] ? 'BEFORE' : 'AFTER'
			})
		}).then(res => {
			removeToast(id)
			if (res.status === 200) {
				addToast('Posted!')
				refresh()
				currentComment.set(null)
				removeEditHighlights()
			} else {
				addToast('Fail to post!', 'warn')
			}
			text = ''
		})
	}

	function editComment() {
		let id = addToast('編集中...', 'info', 0)
		fetch(`${import.meta.env.VITE_API_URL}/comment?id=${$currentComment.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ text, category: selected === options[0] ? 'BEFORE' : 'AFTER' })
		}).then(res => {
			removeToast(id)
			if (res.status === 200) {
				addToast('Edited!')
				refresh()
				currentComment.set(null)
				removeEditHighlights()
			} else {
				addToast('Fail to edit!', 'warn')
			}
			text = ''
		})
	}

	function submit() {
		localStorage.setItem('selected', selected)
		if ($currentComment.text.length === 0) createComment()
		else editComment()
	}

	function resetComment() {
		currentComment.set(null)
		removeEditHighlights()
		text = ''
		state.set(0)
	}
</script>

{#if $currentComment}
	<form on:submit|preventDefault={submit} id="edit-form" transition:slide={{ duration: 300, easing: quintOut }}>
		<blockquote>
			{@html $currentComment.quote}
		</blockquote>
		<textarea bind:value={text} id="edit-textarea" />
		<div>
			<Select bind:selected {options} />
			<button type="submit">投稿</button>
			<button type="button" on:click={resetComment}>キャンセル</button>
		</div>
	</form>
{/if}

<style lang="scss">
	form {
		padding: var(--spacing);
		background-color: var(--color-bg);
		border-bottom: 1px solid var(--color-coral);
		@media screen and (max-width: 680px) {
			position: fixed;
			top: 0;
			left: 0;
			height: 110%;
			width: 100%;
			padding: var(--spacing) var(--spacing-half);
			touch-action: none;
			border: none;
			display: flex;
			flex-flow: column wrap;
		}
	}

	textarea {
		width: 100%;
		height: 20em;
		background-color: var(--color-secondary-bg);
		font-size: 0.9em;
		resize: none;
		padding: 0.6em 0.8em;
		border: none;
		border-radius: 0.5em;
		cursor: auto;
		outline: none;
		margin-top: var(--spacing-half);
		line-height: 1.6;
		@media screen and (max-width: 680px) {
			height: 60vh;
			padding: var(--spacing-half);
		}
	}

	div {
		display: flex;
		flex-direction: row;
		margin-top: 0.6em;
		@media screen and (max-width: 680px) {
			order: -1;
			margin-top: 0;
			margin-bottom: var(--spacing);
		}
	}

	button {
		border: none;
		background: none;
		padding: 0;
		cursor: pointer;
		font-size: 0.9em;
		font-weight: bold;
		position: relative;
		margin: 0;
		transform-style: preserve-3d;

		@media screen and (max-width: 680px) {
			font-size: 1em;
		}

		&::after {
			content: '';
			position: absolute;
			bottom: -0.1em;
			left: 0;
			width: 100%;
			height: 0.1em;
			background-color: currentColor;
			transition: transform 300ms;
			backface-visibility: hidden;

			transform: scale(0);
			transform-origin: center;
		}

		&:hover::after,
		&:focus::after {
			transform: scale(1);
			-webkit-transform: scale(1);
		}
	}

	button[type='button'] {
		margin-left: 0.8em !important;
		color: var(--color-melon-dark);
	}

	button[type='submit'] {
		margin-left: auto;
		color: var(--color-blue-text);
	}
</style>
