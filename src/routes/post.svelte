<script context="module" lang="ts">
	export const prerender = true
</script>

<script lang="ts">
	import Toggle from '$components/Header/Toggle.svelte'
	import { addToast, removeToast } from '$lib/toast'
	import { goto } from '$app/navigation'

	let name, category, text

	function redirect() {
		const id = addToast('Succeeded, Redirecting…', 'info', 500)
		setTimeout(() => {
			removeToast(id)
			goto('/list')
		}, 500)
	}

	async function submit() {
		let id
		try {
			id = addToast('Posting…', 'info', 0)
			const res = await fetch(`${import.meta.env.VITE_API_URL}/list`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, category, text })
			})
			removeToast(id)
			if (res.status !== 200) throw new Error()
			else redirect()
		} catch (err) {
			removeToast(id)
			addToast('Fail to post', 'warn')
		}
	}
</script>

<svelte:head>
	<title>Post</title>
</svelte:head>

<div class="container">
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
		<button type="submit">Submit</button>
	</form>

	<Toggle style="top: calc(var(--spacing) + 0.5em); right: var(--spacing)" />
</div>

<style lang="scss">
	:global(#svelte) {
		display: block !important;
	}

	.container {
		width: 100vw;
		padding: var(--spacing);
		max-width: 600px;
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

	.input-container {
		height: 50px;
		position: relative;
		width: 100%;
		margin-top: 30px;
	}

	input {
		background-color: var(--color-secondary-bg);
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

	button {
		background-color: var(--color-blue);
		border-radius: 12px;
		border: 0;
		box-sizing: border-box;
		color: var(--color-black);
		cursor: pointer;
		font-size: 18px;
		height: 50px;
		margin-top: 38px;
		text-align: center;
		width: 100%;
		transition: all 0.2s ease-out;

		&:active,
		&:hover {
			background-color: var(--color-melon);
		}
	}

	textarea {
		width: 100%;
		height: 20em;
		background-color: var(--color-secondary-bg);
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
