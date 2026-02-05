<script>
	import { PageHero } from 'statue-ssg';
	import MusicPlayer from '$lib/components/MusicPlayer.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Music</title>
	<meta name="description" content="Listen to music." />
</svelte:head>

<div
	class="min-h-screen text-white bg-linear-to-b from-(--color-hero-from) via-(--color-hero-via) to-(--color-hero-to)"
>
	<PageHero
		title="Music"
		description="Place MP3 files in static/music/ and update the track in src/routes/music/+page.server.js"
	/>

	<div class="container mx-auto px-4 pb-32">
		<div class="max-w-2xl mx-auto mt-12">
			<MusicPlayer
				src={data.track.src}
				title={data.track.title}
				artist={data.track.artist}
			/>
		</div>
	</div>
</div>
