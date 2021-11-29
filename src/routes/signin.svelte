<script context="module" lang="ts">
	export const prerender = true
</script>

<script lang="ts">
	import { login } from '$lib/auth'
	import { goto } from '$app/navigation'
	import { addToast, removeToast } from '$lib/toast'
	import Toggle from '../components/Header/Toggle.svelte'
	import { fade, fly } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'

	let email = '',
		name = '',
		askName = false

	function redirect() {
		const id = addToast('Succeeded, Redirecting…', 'info', 500)
		setTimeout(() => {
			removeToast(id)
			goto('/')
		}, 500)
	}

	async function signin() {
		let id
		try {
			id = addToast('Signing in…', 'info', 0)
			const res = await login(email)
			removeToast(id)
			if (res.name === null) askName = true
			else redirect()
		} catch (err) {
			removeToast(id)
			addToast('Fail to sign in', 'warn')
		}
	}

	async function registerName() {
		let id
		try {
			id = addToast('Creating account…', 'info', 0)
			await fetch('/api/user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name })
			})
			removeToast(id)
			redirect()
		} catch (err) {
			removeToast(id)
			addToast('Fail to register name', 'warn')
		}
	}
</script>

<svelte:head>
	<title>Signin｜パト研</title>
</svelte:head>

<div class="container">
	{#if askName === false}
		<form on:submit|preventDefault={signin} out:fade={{ delay: 200, duration: 200, easing: quintOut }}>
			<h2>Sign In</h2>
			<div class="input-container">
				<input id="email" type="email" placeholder=" " bind:value={email} />
				<div class="cut" />
				<label for="email">Email</label>
			</div>
			<button type="submit">Submit</button>
		</form>
	{:else}
		<form on:submit|preventDefault={registerName} in:fly={{ x: 400, delay: 450, easing: quintOut, duration: 600 }}>
			<h2>What is your name?</h2>
			<div class="input-container">
				<input id="name" type="text" placeholder=" " bind:value={name} />
				<div class="cut" />
				<label for="name">Name</label>
			</div>
			<button type="submit">Submit</button>
		</form>
	{/if}
</div>
<Toggle style="top: var(--spacing); right: var(--spacing)" />

<style lang="scss">
	.container {
		width: 100vw;
		min-height: calc(90vh - var(--spacing-3));
		display: grid;
		justify-content: center;
		align-content: center;
		grid-template: none !important;
	}

	form {
		border-radius: 20px;
		box-sizing: border-box;
		padding: var(--spacing-half);
		width: 320px;
	}

	h2 {
		font-size: 2em;
		font-weight: bold;
		user-select: none;
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
		width: 56px;
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
</style>
