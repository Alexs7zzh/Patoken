<script lang="ts">
	import Select from '$components/Elements/Select.svelte'
	import { currentComment, removeEditHighlights } from '$lib/comment'
	import { slide } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import { addToast, removeToast } from '$lib/toast'
	import { page } from '$app/stores'
	import { anchor, highlightRange, commentStore } from '$lib/comment'
	import { tick } from 'svelte'

	let text,
		selected,
		options = ['考察', 'パトアンサー']
	$: ({ refresh } = commentStore($page.path.slice(1)))

	currentComment.subscribe(async comment => {
		if (!comment) return
		text = ''
		removeEditHighlights()
		if (comment.text.length === 0)
			highlightRange(anchor(comment) as Range, { animate: true, isEdit: true, postId: comment.postId })
		else text = comment.text
		await tick()
		document.getElementById('edit-form').scrollIntoView({ behavior: 'smooth' })
		if(!window.matchMedia('(max-width: 680px)').matches) document.getElementById('edit-textarea').focus()
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
		padding: var(--spacing-half) var(--spacing);
		background-color: var(--color-secondary-bg);
		@media screen and (max-width: 680px) {
			padding: var(--spacing-half);
		}
	}

	textarea {
		width: 100%;
		height: 10em;
		background-color: var(--color-bg);
		font-size: 1em;
		resize: none;
		padding: 0.6em 0.8em;
		border: 1px solid var(--color-coral);
		cursor: auto;
		outline: none;
		font-family: inherit;
		margin-top: var(--spacing-half);
		line-height: 1.6;
	}

	div {
		display: flex;
		flex-direction: row;
		margin-top: 0.6em;
	}

	button {
		border: none;
		background: none;
		padding: 0;
		cursor: pointer;
		font-size: 1em;
		font-weight: bold;
		position: relative;
		margin: 0;
		transform-style: preserve-3d;

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
