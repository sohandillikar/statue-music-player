<script>
  /**
   * Formats seconds as m:ss
   * @param {number} seconds
   * @returns {string}
   */
  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  /**
   * @typedef {{ src: string, title?: string, artist?: string }} Track
   */

  let { tracks = [], src = "", title = "", artist = "" } = $props();

  /** @type {HTMLAudioElement | null} */
  let audioEl = $state(null);
  let currentIndex = $state(0);
  let currentTime = $state(0);
  let duration = $state(0);
  let isPlaying = $state(false);
  let isSeeking = false;
  let wantToAutoPlay = false;

  const isPlaylist = $derived(Array.isArray(tracks) && tracks.length > 0);

  const currentTrack = $derived.by(() => {
    if (isPlaylist && tracks[currentIndex]) {
      return {
        src: tracks[currentIndex].src,
        title: tracks[currentIndex].title ?? "",
        artist: tracks[currentIndex].artist ?? "",
      };
    }
    return { src, title, artist };
  });

  const canGoPrevious = $derived(isPlaylist && currentIndex > 0);
  const canGoNext = $derived(isPlaylist && currentIndex < tracks.length - 1);

  $effect(() => {
    const audio = audioEl;
    const track = currentTrack;
    if (!audio || !track.src) return;

    audio.src = track.src;
    currentTime = 0;
    duration = 0;
    isPlaying = false;

    /** @type {(() => void) | undefined} */
    /** @type {((this: HTMLAudioElement, ev: Event) => void) | undefined} */
    let loadeddataHandler;
    if (wantToAutoPlay) {
      loadeddataHandler = () => {
        audio.play().catch(() => {});
        wantToAutoPlay = false;
        if (loadeddataHandler)
          audio.removeEventListener("loadeddata", loadeddataHandler);
      };
      audio.addEventListener("loadeddata", loadeddataHandler);
    }

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
      if (isPlaylist && currentIndex < tracks.length - 1) {
        wantToAutoPlay = true;
        currentIndex++;
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      if (wantToAutoPlay && loadeddataHandler) {
        audio.removeEventListener("loadeddata", loadeddataHandler);
      }
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
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

  function goToPrevious() {
    if (canGoPrevious) {
      currentIndex--;
      wantToAutoPlay = isPlaying;
    }
  }

  function goToNext() {
    if (canGoNext) {
      currentIndex++;
      wantToAutoPlay = isPlaying;
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
  <audio bind:this={audioEl} src={currentTrack.src} preload="metadata"></audio>

  {#if currentTrack.title || currentTrack.artist}
    <div class="music-player__metadata">
      <div class="music-player__metadata-row">
        {#if currentTrack.title}
          <div class="music-player__title">{currentTrack.title}</div>
        {/if}
        {#if isPlaylist}
          <span class="music-player__position"
            >{currentIndex + 1} / {tracks.length}</span
          >
        {/if}
      </div>
      {#if currentTrack.artist}
        <div class="music-player__artist">{currentTrack.artist}</div>
      {/if}
    </div>
  {/if}

  <div class="music-player__controls">
    {#if isPlaylist}
      <button
        type="button"
        class="music-player__nav-btn"
        onclick={goToPrevious}
        disabled={!canGoPrevious}
        aria-label="Previous track"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
        </svg>
      </button>
    {/if}

    <button
      type="button"
      class="music-player__play-btn"
      onclick={togglePlayPause}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {#if isPlaying}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      {/if}
    </button>

    {#if isPlaylist}
      <button
        type="button"
        class="music-player__nav-btn"
        onclick={goToNext}
        disabled={!canGoNext}
        aria-label="Next track"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>
    {/if}

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

  .music-player__metadata-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .music-player__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-foreground);
  }

  .music-player__position {
    font-size: 0.75rem;
    color: var(--color-muted);
    flex-shrink: 0;
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

  .music-player__nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: transparent;
    color: var(--color-foreground);
    border: 1px solid var(--color-border);
    cursor: pointer;
    flex-shrink: 0;
    transition:
      background-color 0.2s,
      color 0.2s,
      transform 0.1s;
  }

  .music-player__nav-btn:hover:not(:disabled) {
    background: var(--color-border);
    color: var(--color-primary);
  }

  .music-player__nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .music-player__nav-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .music-player__nav-btn svg {
    width: 1.25rem;
    height: 1.25rem;
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
    transition:
      background-color 0.2s,
      transform 0.1s;
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
