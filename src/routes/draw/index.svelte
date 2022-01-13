<script lang="ts">
	import Toggle from '$components/Header/Toggle.svelte'
	import { onMount } from 'svelte'

	let socket,
		member = [],
		name,
		joined = false,
		card

	onMount(() => {
		const url = import.meta.env.VITE_API_URL as string
		socket = new WebSocket(`${url.replace('https', 'wss')}/draw`)
		socket.addEventListener('message', event => {
			console.log(JSON.parse(event.data))
			const message = JSON.parse(event.data)
			if (message.type === 'member') member = message.data
			if (message.type === 'draw') card = message.data[0]
		})
	})

	function join() {
		socket.send(
			JSON.stringify({
				type: 'join',
				name
			})
		)
		joined = true
	}

	function start() {
		socket.send(
			JSON.stringify({
				type: 'start'
			})
		)
	}
</script>

<svelte:head>
	<title>Draw</title>
</svelte:head>

<div class="container">
	<h1>Draw</h1>

	{#if card}
		<p id="card">{card}</p>
	{:else if member.length === 0}
		<p class="info">No one is here yet.</p>
	{:else}
		<ol>
			{#each member as m}
				<li>{m}</li>
			{/each}
		</ol>
	{/if}

	<section class="join" class:center={joined}>
		{#if joined === false}
			{#if member.length < 8}
				<div class="input-container">
					<input id="name" type="text" placeholder=" " bind:value={name} />
					<div class="cut" />
					<label for="name">Name</label>
				</div>

				<button on:click={join}>Join</button>
			{:else}
				<p>Sorry, the room is full.</p>
			{/if}
		{:else}
			<button class="start" on:click={start}>Draw</button>
		{/if}
	</section>

	<Toggle style="top: var(--spacing); right: var(--spacing)" />
</div>

<style lang="scss">
	:global(#svelte) {
		display: block !important;
		padding-bottom: 0 !important;
	}

	.container {
		position: relative;

		width: 100vw;
		max-width: 600px;
		height: 100vh;

		margin-left: auto;
		margin-right: auto;
		padding: var(--spacing);
		touch-action: none;
	}

	.input-container {
		height: 50px;
		position: relative;
		width: 60%;
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

	.join {
		position: fixed;
		bottom: var(--spacing-2);
		left: 50%;
		transform: translateX(-50%);

		width: calc(100% - var(--spacing-2));
		max-width: 600px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;

		padding-top: var(--spacing);
		border-top: 3px solid var(--color-secondary-bg);

		@media screen and (max-width: 680px) {
			bottom: var(--spacing);
		}
		&.center {
			justify-content: center;
		}
	}

	.join button {
		border-radius: 12px;
		border: 0;
		box-sizing: border-box;
		cursor: pointer;
		font-size: 18px;
		text-align: center;
		transition: all 0.2s ease-out;
		font-weight: bold;
		width: 16%;
		min-width: 90px;
		height: 50px;
		background-color: var(--color-blue);
		color: var(--color-black);

		&.start {
			width: 24%;
		}
	}

	h1 {
		margin-bottom: var(--spacing-2);
	}

	p {
		font-size: 1.1em;
		font-weight: bold;
	}

	ol {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	li {
		font-size: 1.2em;
		font-weight: bold;
		margin-top: 0.4em;
	}

	.info {
		opacity: 0.7;
	}

	#card {
		font-size: 40vw;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		user-select: none;
		@media screen and (min-width: 680px) {
			font-size: 20vw;
		}
	}
</style>
