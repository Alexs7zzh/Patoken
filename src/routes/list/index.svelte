<script lang="ts">
	import Toggle from '$components/Header/Toggle.svelte'
	import { onMount } from 'svelte'
	import { addToast, removeToast } from '$lib/toast'
	import { userStore } from '$lib/auth'
	import type { Stuff } from '$lib/types'

	let data,
		categories,
		c = 'All'
	let editing = false,
		name,
		category,
		text,
		idInEdit = null

	async function refresh() {
		data = (await (await fetch(`${import.meta.env.VITE_API_URL}/list`)).json()) as Stuff[]
		const m = new Map()
		data.forEach(item => {
			if (m.has(item.category)) {
				const count = m.get(item.category)
				m.set(item.category, count + 1)
			} else {
				m.set(item.category, 1)
			}
		})
		categories = Array.from(m.entries()).sort((a, b) => b[1] - a[1])
	}

	onMount(refresh)

	async function submit() {
		let id
		try {
			id = addToast('Posting…', 'info', 0)
			const res = await fetch(`${import.meta.env.VITE_API_URL}/list${idInEdit ? '?id=' + idInEdit : ''}`, {
				method: idInEdit ? 'PUT' : 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, category, text })
			})
			removeToast(id)
			if (!res.ok) throw new Error()
			else {
				editing = false
				await refresh()
			}
		} catch (err) {
			removeToast(id)
			addToast('Fail to post', 'warn')
		}
	}

	function del(commentId: number) {
		let id = addToast('Deleting', 'info', 0)
		fetch(`${import.meta.env.VITE_API_URL}/list?id=${commentId}`, {
			method: 'DELETE',
			credentials: 'include'
		}).then(async res => {
			removeToast(id)
			if (res.ok) {
				addToast('Deleted')
				await refresh()
			} else {
				addToast('Fail to delete!', 'warn')
			}
		})
	}

	function edit(commentId: number) {
		const comment = data.find(i => i.id === commentId)
		if (!comment) addToast('Comment not found', 'warn')
		else {
			name = comment.name
			category = comment.category
			text = comment.text
			idInEdit = commentId
			editing = true
		}
	}

	function startEdit() {
		name = ''
		category = ''
		text = ''
		idInEdit = null
		editing = true
	}
</script>

<svelte:head>
	<title>List</title>
</svelte:head>

<div class="container">
	{#if editing === false}
		<h1>Our<br />Seeking<br />System</h1>

		{#if data}
			<ul class="categories">
				<li
					class:selected={c === 'All'}
					on:click={() => {
						c = 'All'
					}}>
					All<span>{data.length}</span>
				</li>

				{#each categories as [category, count]}
					<li
						class:selected={c === category}
						on:click={() => {
							c = category
						}}>
						{category}<span>{count}</span>
					</li>
				{/each}
			</ul>

			<ul class="list">
				{#each data.filter(i => c === 'All' || i.category === c) as item (item.id)}
					<li id={item.id}>
						<h2>{item.name}</h2>
						<p class="meta">{item.author}・{item.category}</p>
						<p class="text">{item.text}</p>
						<div class="actions">
							{#if $userStore && $userStore.name === item.author}
								<button on:click={() => edit(item.id)}>
									<svg class="edit" viewBox="0 0 512.009 512.009">
										<path
											d="M397.96 330.099c-13.755 0-24.872 11.118-24.872 24.872v78.125c0 13.73-11.143 24.872-24.872 24.872H74.617c-13.73 0-24.872-11.143-24.872-24.872V109.754c0-13.73 11.143-24.872 24.872-24.872h144.509c13.754 0 24.872-11.118 24.872-24.872s-11.118-24.872-24.872-24.872H74.617C33.478 35.136 0 68.615 0 109.754v323.342c0 41.139 33.478 74.617 74.617 74.617h273.597c41.139 0 74.617-33.453 74.617-74.617v-78.124c.001-13.755-11.117-24.873-24.871-24.873z" />
										<path
											d="M484.193 31.977c-18.057-18.057-41.637-27.161-65.39-27.658-24.997-.547-50.143 8.506-69.046 27.434L181.37 200.14c-24.574 24.674-38.105 57.406-38.105 92.177v55.714c0 13.754 11.118 24.872 24.872 24.872h55.714c34.772 0 67.504-13.531 92.202-38.13L484.216 166.61c37.061-37.083 37.061-97.523-.023-134.633zM280.91 299.581c-15.247 15.197-35.543 23.579-57.057 23.579H193.01v-30.842c0-21.515 8.382-41.811 23.554-57.033L327.57 124.279l64.32 64.32-110.98 110.982zm168.113-168.114L427.06 153.43l-64.32-64.32 21.962-21.962c17.759-17.759 46.611-17.709 64.32 0 17.71 17.733 17.71 46.585.001 64.319z" />
									</svg>
								</button>
								<button on:click={() => del(item.id)}>
									<svg class="delete" viewBox="0 0 512 512">
										<path
											d="M184 22.1c-4.4 1.8-9 5.9-11.3 10.2-2.1 4-2.2 5.6-2.5 28.4l-.3 24.3H80.4l-5.1 2.5c-3.2 1.6-6.1 4.1-7.9 6.7-2.6 3.7-2.9 4.9-2.9 12.4s.3 8.6 3 12.5c1.7 2.3 5 5.3 7.4 6.6l4.4 2.3h353.4l4.4-2.3c2.7-1.4 5.7-4.2 7.7-7.3 3.2-4.7 3.4-5.3 3-12.5-.4-9.5-3.4-14.5-11.1-18.4l-5.1-2.5h-89.5l-.3-24.3c-.3-23.7-.4-24.3-2.8-28.7-1.4-2.4-4.5-5.8-6.8-7.5l-4.4-3-70.6-.2c-45.1-.1-71.6.2-73.2.8zm114 52.4V85h-84V64h84v10.5zM97.5 150.9c-4.9 2.3-8.9 6.4-10.9 11.3-1.4 3.3-1.6 18-1.6 128.7 0 135.3-.1 131.8 5.5 146.6 7.9 21 26.8 40.1 47.6 47.9 15.1 5.7 13.5 5.6 117.9 5.6s102.8.1 117.9-5.6c20.6-7.8 39.7-26.9 47.5-47.5 5.8-15.4 5.6-10.7 5.6-147.1 0-119.8-.1-125.5-1.9-129.3-6.9-15-28.4-16.8-37.7-3.3l-2.9 4.1-.5 126.1c-.5 137.1-.1 127.1-5.9 138.3-4.9 9.8-17.5 18.3-29.7 20.3-7.8 1.3-177 1.3-184.8 0-12.4-2-24.7-10.4-29.8-20.3-5.7-11.2-5.3-1.2-5.8-138.3l-.5-126.1-2.9-4.1c-5.6-8.2-18-11.5-27.1-7.3z" /><path
											d="M203.5 193.6c-4.4 2.4-7.5 5.5-9.6 9.6-1.8 3.6-1.9 7.1-1.9 84.6v80.9l2.3 4.4c1.3 2.4 4.3 5.7 6.6 7.4 3.9 2.7 5 3 12.5 3s8.7-.3 12.4-2.9c2.6-1.8 5.1-4.7 6.7-7.9l2.5-5.1V208.4l-2.5-5.1c-1.6-3.2-4.1-6.1-6.7-7.9-3.5-2.5-5.2-2.9-11.7-3.2-5.5-.2-8.4.2-10.6 1.4zM289.5 193.4c-4.4 2-8.3 6-10.5 10.8-1.9 4.1-2 7.4-2 83.9v79.5l2.5 5.1c3.8 7.5 8.9 10.7 17.9 11.1 9.1.4 14.6-2.2 19.4-9.2l3.2-4.8v-81.5c0-88.4.3-84-5.4-90.1-5.2-5.8-17.5-8.1-25.1-4.8z" /></svg>
								</button>
							{:else}
								<div />
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}

		<button class="edit" on:click={startEdit}>
			<svg viewBox="0 0 512.009 512.009">
				<path
					d="M397.96 330.099c-13.755 0-24.872 11.118-24.872 24.872v78.125c0 13.73-11.143 24.872-24.872 24.872H74.617c-13.73 0-24.872-11.143-24.872-24.872V109.754c0-13.73 11.143-24.872 24.872-24.872h144.509c13.754 0 24.872-11.118 24.872-24.872s-11.118-24.872-24.872-24.872H74.617C33.478 35.136 0 68.615 0 109.754v323.342c0 41.139 33.478 74.617 74.617 74.617h273.597c41.139 0 74.617-33.453 74.617-74.617v-78.124c.001-13.755-11.117-24.873-24.871-24.873z" />
				<path
					d="M484.193 31.977c-18.057-18.057-41.637-27.161-65.39-27.658-24.997-.547-50.143 8.506-69.046 27.434L181.37 200.14c-24.574 24.674-38.105 57.406-38.105 92.177v55.714c0 13.754 11.118 24.872 24.872 24.872h55.714c34.772 0 67.504-13.531 92.202-38.13L484.216 166.61c37.061-37.083 37.061-97.523-.023-134.633zM280.91 299.581c-15.247 15.197-35.543 23.579-57.057 23.579H193.01v-30.842c0-21.515 8.382-41.811 23.554-57.033L327.57 124.279l64.32 64.32-110.98 110.982zm168.113-168.114L427.06 153.43l-64.32-64.32 21.962-21.962c17.759-17.759 46.611-17.709 64.32 0 17.71 17.733 17.71 46.585.001 64.319z" />
			</svg>
		</button>
	{:else}
		<h1>Post</h1>
		<form on:submit|preventDefault={submit}>
			<div class="input-container">
				<input id="name" type="text" placeholder=" " bind:value={name} />
				<div class="cut" />
				<label for="name">Name</label>
			</div>
			<div class="input-container">
				<input id="category" type="text" placeholder=" " bind:value={category} />
				<div class="cut" />
				<label for="category">Category</label>
			</div>
			<textarea bind:value={text} />
			<div class="button-container">
				<button
					class="cancel"
					type="button"
					on:click={() => {
						editing = false
					}}>Cancel</button>
				<button class="submit" type="submit">Submit</button>
			</div>
		</form>
	{/if}
	<Toggle style="top: calc(var(--spacing) + 0.5em); right: var(--spacing)" />
</div>

<style lang="scss">
	:global(#svelte) {
		display: block !important;
	}

	.container {
		width: 100vw;
		padding: var(--spacing);
		max-width: 680px;
		min-height: calc(90vh - var(--spacing-3));
		position: relative;
		margin-left: auto;
		margin-right: auto;
	}

	h1 {
		margin-bottom: 0;

		font-size: 2.6em;
		line-height: 1.1;
	}

	.categories {
		list-style: none;
		padding: 0;
		margin-top: var(--spacing-3);
		font-weight: bold;
		display: flex;
		flex-flow: row wrap;

		span {
			font-size: var(--font-s);
			position: relative;
			top: -0.4em;
			left: 0.5em;
		}

		li {
			cursor: pointer;
			transition: color 0.6s ease-out;
			&.selected,
			&:hover {
				color: var(--color-melon);
			}
		}

		li + li {
			margin-left: var(--spacing);
		}
	}

	.list {
		list-style: none;
		padding: 0;
		margin-top: var(--spacing);
		li {
			display: grid;
			grid-template:
				'title meta' 1fr
				'text  text' auto
				/ 1fr auto;
		}
		li + li {
			margin-top: var(--spacing-2);
		}
	}

	h2 {
		grid-area: title;
		margin: 0;
		line-height: 1;
		font-size: 1.2em;
	}

	.meta {
		grid-area: meta;
		font-weight: bold;
		text-align: right;
		line-height: 1.4;
		opacity: 0.6;
	}

	.text {
		grid-area: text;
		margin-top: var(--spacing-half);
		white-space: pre-wrap;
	}

	.actions {
		grid-column: 2;
		justify-self: end;
		margin-top: var(--spacing-half);

		button {
			appearance: none;
			border: none;
			background-color: transparent;
			padding: 0;
			margin-left: 0.2em;
			cursor: pointer;

			svg {
				fill: var(--color-text);
				width: 1.3em;
				height: 1.3em;
			}
		}

		.edit {
			opacity: 0.7;
		}

		.delete {
			fill: var(--color-melon);
		}
	}

	.container > .edit {
		position: absolute;
		top: calc(var(--spacing) + 0.7em);
		right: calc(var(--spacing-2) + 0.5em);
		cursor: pointer;
		appearance: none;
		border: none;
		background-color: transparent;
		padding: 0;

		svg {
			fill: var(--color-text);
			width: 1.3em;
			height: 1.3em;
		}
	}

	.input-container {
		height: 50px;
		position: relative;
		width: 100%;
		margin-top: 30px;
	}

	input {
		background-color: var(--color-grey);
		border-radius: 12px;
		border: 0;
		box-sizing: border-box;
		color: var(--color-text);
		font-size: 18px;
		height: 100%;
		outline: 0;
		padding: 4px 20px 0;
		width: 100%;

		&:focus {
			outline: none;
		}

		&:-webkit-autofill,
		&:-webkit-autofill:hover,
		&:-webkit-autofill:focus,
		&:-webkit-autofill:active {
			color: var(--color-text);
		}
	}

	.cut {
		background-color: var(--color-bg);
		transition: all 0.2s ease-out;
		border-radius: 10px;
		height: 20px;
		left: 20px;
		position: absolute;
		top: -20px;
		transform: translateY(0);
		width: 60px;
	}

	#category ~ .cut {
		width: 82px;
	}

	input:focus ~ .cut,
	input:not(:placeholder-shown) ~ .cut {
		transform: translateY(8px);
	}

	label {
		color: var(--color-coral);
		font-family: sans-serif;
		left: 20px;
		line-height: 14px;
		pointer-events: none;
		position: absolute;
		transform-origin: 0 50%;
		transition: transform 200ms, color 200ms;
		top: 20px;
	}

	input:focus ~ label,
	input:not(:placeholder-shown) ~ label {
		transform: translateY(-30px) translateX(10px) scale(0.75);
	}

	input:not(:placeholder-shown) ~ label {
		color: var(--color-coral);
	}

	.button-container {
		display: flex;
		justify-content: space-between;

		button {
			border-radius: 12px;
			border: 0;
			box-sizing: border-box;
			cursor: pointer;
			font-size: 18px;
			height: 50px;
			margin-top: 38px;
			text-align: center;
			width: 45%;
			transition: all 0.2s ease-out;
		}
	}

	.submit {
		background-color: var(--color-blue);
		color: var(--color-black);

		&:active,
		&:hover {
			background-color: var(--color-melon);
		}
	}

	.cancel {
		background-color: var(--color-grey);
		color: var(--color-text);

		&:active,
		&:hover {
			background-color: var(--color-melon);
		}
	}

	textarea {
		width: 100%;
		height: 20em;
		background-color: var(--color-grey);
		font-size: 0.9em;
		resize: none;
		padding: 0.6em 20px;
		border: none;
		border-radius: 0.5em;
		cursor: auto;
		outline: none;
		margin-top: var(--spacing);
		line-height: 1.6;
	}
</style>
