// Ensure this page is pre-rendered as a static page
export const prerender = true;

/** @type {import('./$types').PageServerLoad} */
export function load() {
	return {
		track: {
			src: '/music/sample.mp3',
			title: 'Sample Track',
			artist: 'Artist Name'
		}
	};
}
