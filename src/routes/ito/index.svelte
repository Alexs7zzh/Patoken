<script lang="ts">
	import Toggle from '$components/Header/Toggle.svelte'
	import { onMount } from 'svelte'

	let numRef,
		infoRef,
		containerRef,
		isTouching = false

	const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

	const downHandler = () => {
		if (isTouching) return
		infoRef.style.display = 'none'
		numRef.textContent = String(random(1, 100))
		numRef.style.opacity = 1
		isTouching = true
	}

	const upHandler = () => {
		numRef.style.opacity = 0
		setTimeout(() => {
			infoRef.style.display = null
			isTouching = false
		}, 300)
	}

	onMount(() => {
		containerRef.style.height = `${window.innerHeight}px`
		window.addEventListener('mousedown', downHandler, false)
		window.addEventListener('touchstart', downHandler, false)
		window.addEventListener('mouseup', upHandler, false)
		window.addEventListener('touchend', upHandler, false)
		return () => {
			window.removeEventListener('mousedown', downHandler, false)
			window.removeEventListener('touchstart', downHandler, false)
			window.removeEventListener('mouseup', upHandler, false)
			window.removeEventListener('touchend', upHandler, false)
		}
	})
</script>

<svelte:head>
	<title>イト</title>
</svelte:head>

<div class="container" bind:this={containerRef}>
	<h1>イト</h1>
	<p id="info" bind:this={infoRef}>Touch me</p>
	<p id="num" bind:this={numRef}>50</p>
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

	h1 {
		margin-bottom: 0;
		font-size: 1.6em;
		line-height: 1;
		user-select: none;
	}

	p {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		user-select: none;
		font-weight: bold;
	}

	@keyframes fadeIn {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 0.7;
		}
		100% {
			opacity: 0;
		}
	}

	#info {
		font-size: 10vw;
		animation: fadeIn 2s infinite;
		@media screen and (min-width: 680px) {
			font-size: 3em;
		}
	}

	#num {
		font-size: 35vw;
		font-variant-numeric: tabular-nums;
		opacity: 0;
		transition: opacity 0.3s ease-out;
		@media screen and (min-width: 680px) {
			font-size: 20vw;
		}
	}
</style>
