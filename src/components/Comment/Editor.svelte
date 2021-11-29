<script lang="ts">
	import { currentComment, removeEditHighlights } from '$lib/comment'
	import { slide } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import { addToast, removeToast } from '$lib/toast'
	import { page } from '$app/stores'
	import { anchor, highlightRange, commentStore } from '$lib/comment'
	import { tick } from 'svelte'

	let text, selected
	$: ({ refresh } = commentStore($page.path.slice(1)))

	currentComment.subscribe(async comment => {
		if (!comment) return
		text = ''
		removeEditHighlights()
		if (comment.text.length === 0) highlightRange(anchor(comment) as Range, { animate: true, isEdit: true })
		else text = comment.text
		await tick()
		document.getElementById('edit-form').scrollIntoView({ behavior: 'smooth' })
		document.getElementById('edit-textarea').focus()
		selected = comment.category === 'BEFORE' ? '0' : '1'
	})

	function createComment() {
		let id = addToast('投稿中...', 'info', 0)
		fetch('/api/comment', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				...$currentComment,
				text,
				category: selected === '0' ? 'BEFORE' : 'AFTER'
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
		fetch(`/api/comment?id=${$currentComment.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text, category: selected === '0' ? 'BEFORE' : 'AFTER' })
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
			<label for="editor-select">
				<select id="editor-select" bind:value={selected}>
					<option value="0">考察</option>
					<option value="1">パトアンサー</option>
				</select>
				<svg viewBox="0 0 320 512"
					><path
						d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z" /></svg>
			</label>
			<button type="submit">投稿</button>
			<button type="button" on:click={resetComment}>キャンセル</button>
		</div>
	</form>
{/if}

<style lang="scss">
	form {
		padding: var(--spacing-half) var(--spacing);
		background-color: var(--color-secondary-bg);
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

	label {
		border-bottom: 1px solid var(--color-melon);
		position: relative;
	}

	select {
		background-color: transparent;
		border: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		border-radius: 0;
		outline: none;
		padding: 0.2em 1.2em 0.2em 0.1em;

		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		cursor: pointer;
	}

	svg {
		fill: var(--color-text);
		width: 1em;
		height: 1em;
		position: absolute;
		right: 0;
		top: calc(50% - 0.5em);
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
		-webkit-transform-style: preserve-3d;

		&::after {
			content: '';
			position: absolute;
			bottom: -0.1em;
			left: 0;
			width: 100%;
			height: 0.1em;
			background-color: currentColor;
			transition: transform 300ms;
			-webkit-backface-visibility: hidden;

			transform: scale(0);
			-webkit-transform: scale(0);
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
