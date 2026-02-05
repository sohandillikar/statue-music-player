// Ensure this page is pre-rendered as a static page
export const prerender = true;

/** @type {import('./$types').PageServerLoad} */
export function load() {
	return {
		tracks: [
			{ src: '/music/sample-15s.mp3', title: 'Lovely Song', artist: 'Average Joe' },
			{ src: '/music/sample-12s.mp3', title: 'Statue Rocks', artist: 'Joe Shmoe' },
			{ src: '/music/sample-9s.mp3', title: 'I Love Svelte', artist: 'Joe Mo' },
			{ src: '/music/voice-note.wav', title: 'Voice Note', artist: 'Wavvy Boy' },
			// Add more tracks as needed
		]
	};
}
