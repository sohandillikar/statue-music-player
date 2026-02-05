<script>
	/**
	 * Formats seconds as m:ss
	 * @param {number} seconds
	 * @returns {string}
	 */
	function formatTime(seconds) {
		if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	let { src, title = '', artist = '' } = $props();

	/** @type {HTMLAudioElement | null} */
	let audioEl = $state(null);
	let currentTime = $state(0);
	let duration = $state(0);
	let isPlaying = $state(false);
	let isSeeking = false;

	$effect(() => {
		const audio = audioEl;
		if (!audio || !src) return;

		const handleTimeUpdate = () => {
			if (!isSeeking) currentTime = audio.currentTime;
		};

		const handleLoadedMetadata = () => {
			duration = audio.duration;
		};

		const handleDurationChange = () => {
			duration = audio.duration;
		};

		const handlePlay = () => {
			isPlaying = true;
		};

		const handlePause = () => {
			isPlaying = false;
		};

		const handleEnded = () => {
			isPlaying = false;
			currentTime = 0;
		};

		audio.addEventListener('timeupdate', handleTimeUpdate);
		audio.addEventListener('loadedmetadata', handleLoadedMetadata);
		audio.addEventListener('durationchange', handleDurationChange);
		audio.addEventListener('play', handlePlay);
		audio.addEventListener('pause', handlePause);
		audio.addEventListener('ended', handleEnded);

		return () => {
			audio.removeEventListener('timeupdate', handleTimeUpdate);
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
			audio.removeEventListener('durationchange', handleDurationChange);
			audio.removeEventListener('play', handlePlay);
			audio.removeEventListener('pause', handlePause);
			audio.removeEventListener('ended', handleEnded);
		};
	});

	function togglePlayPause() {
		if (!audioEl) return;
		if (audioEl.paused) {
			audioEl.play().catch(() => {});
		} else {
			audioEl.pause();
		}
	}

	/**
	 * @param {Event} e
	 */
	function handleSeekInput(e) {
		isSeeking = true;
		const val = parseFloat(/** @type {HTMLInputElement} */ (e.target).value);
		if (audioEl && Number.isFinite(val)) {
			audioEl.currentTime = Math.max(0, Math.min(val, duration || 0));
			currentTime = audioEl.currentTime;
		}
	}

	function handleSeekChange() {
		isSeeking = false;
	}
</script>

<div class="music-player">
	<audio bind:this={audioEl} {src} preload="metadata"></audio>

	{#if title || artist}
		<div class="music-player__metadata">
			{#if title}
				<div class="music-player__title">{title}</div>
			{/if}
			{#if artist}
				<div class="music-player__artist">{artist}</div>
			{/if}
		</div>
	{/if}

	<div class="music-player__controls">
		<button
			type="button"
			class="music-player__play-btn"
			onclick={togglePlayPause}
			aria-label={isPlaying ? 'Pause' : 'Play'}
		>
			{#if isPlaying}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M8 5v14l11-7z" />
				</svg>
			{/if}
		</button>

		<div class="music-player__progress">
			<span class="music-player__time">{formatTime(currentTime)}</span>
			<input
				type="range"
				class="music-player__slider"
				min="0"
				max={duration || 0}
				value={currentTime}
				step="0.1"
				oninput={handleSeekInput}
				onchange={handleSeekChange}
				aria-label="Seek"
			/>
			<span class="music-player__time">{formatTime(duration)}</span>
		</div>
	</div>
</div>

<style>
	.music-player {
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		padding: 1.5rem;
		max-width: 32rem;
	}

	.music-player__metadata {
		margin-bottom: 1rem;
	}

	.music-player__title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-foreground);
	}

	.music-player__artist {
		font-size: 0.875rem;
		color: var(--color-muted);
		margin-top: 0.25rem;
	}

	.music-player__controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.music-player__play-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: var(--color-primary);
		color: var(--color-on-primary);
		border: none;
		cursor: pointer;
		flex-shrink: 0;
		transition: background-color 0.2s, transform 0.1s;
	}

	.music-player__play-btn:hover {
		background: var(--color-secondary);
	}

	.music-player__play-btn:active {
		transform: scale(0.98);
	}

	.music-player__play-btn svg {
		width: 1.5rem;
		height: 1.5rem;
	}

	.music-player__progress {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.music-player__time {
		font-size: 0.75rem;
		color: var(--color-muted);
		flex-shrink: 0;
		min-width: 2.25rem;
	}

	.music-player__slider {
		flex: 1;
		min-width: 0;
		height: 0.5rem;
		-webkit-appearance: none;
		appearance: none;
		background: var(--color-border);
		border-radius: 0.25rem;
		outline: none;
	}

	.music-player__slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
	}

	.music-player__slider::-moz-range-thumb {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: none;
	}
</style>
