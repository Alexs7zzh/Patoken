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
			<select bind:value={selected}>
				<option value="0">考察</option>
				<option value="1">パトアンサー</option>
			</select>
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
	}

	div {
		display: flex;
		flex-direction: row;
		margin-top: 0.6em;
	}

	select {
		background-color: transparent;
		border: none;
		border-bottom: 1px solid var(--color-melon);
		outline: none;
		padding: 0.3em 0.1em;
		font-family: inherit;
		font-size: inherit;
		cursor: inherit;
		line-height: inherit;
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
