# Music Player Implementation Guide

## Overview

This document explains the complete implementation of the Music Player component for this Statue SSG static site. The player is a self-contained, reusable Svelte component that supports both single tracks and playlists with full playback controls.

## What Was Built

### Core Component
- **Location**: `src/lib/components/MusicPlayer.svelte`
- **Type**: Reusable Svelte 5 component
- **Dependencies**: None (uses native HTML5 Audio API)

### Music Page
- **Route**: `/music`
- **Files**:
  - `src/routes/music/+page.svelte` - Page template
  - `src/routes/music/+page.server.js` - Server-side data loading

### Audio Files
- **Location**: `static/music/`
- **Supported Formats**: MP3, WAV, OGG, AAC, FLAC, WebM (any browser-supported format)

## Features

### 1. Basic Playback Controls
- **Play/Pause**: Large button with dynamic icon (play ▶ or pause ⏸)
- **Seek**: Drag the progress bar to jump to any point in the track
- **Time Display**: Shows current time and total duration (e.g., "1:23 / 3:45")

### 2. Playlist Support
- **Previous/Next Buttons**: Navigate between tracks in a playlist
- **Auto-advance**: When a track ends, automatically plays the next track
- **Track Position**: Shows "2 / 5" to indicate current track number
- **Smart State**: Remembers if you were playing/paused when switching tracks

### 3. Metadata Display
- **Track Title**: Displayed prominently at the top
- **Artist Name**: Shown below the title
- **Optional**: Both title and artist are optional

### 4. Responsive Design
- Styled with theme variables for automatic dark/light mode support
- Mobile-friendly layout with touch-friendly controls
- Maximum width of 32rem for optimal appearance

## How It Works

### Component Props

The component accepts two different usage patterns:

#### Pattern 1: Playlist Mode (Recommended)
```svelte
<MusicPlayer tracks={[
  { src: '/music/song1.mp3', title: 'Song One', artist: 'Artist A' },
  { src: '/music/song2.mp3', title: 'Song Two', artist: 'Artist B' }
]} />
```

#### Pattern 2: Single Track Mode (Backward Compatible)
```svelte
<MusicPlayer 
  src="/music/song.mp3" 
  title="Song Title" 
  artist="Artist Name" 
/>
```

### State Management

The component uses Svelte 5's new runes (`$state`, `$derived`, `$effect`) for reactive state:

1. **`currentIndex`**: Which track in the playlist is active (0-based)
2. **`currentTime`**: Current playback position in seconds
3. **`duration`**: Total length of the current track in seconds
4. **`isPlaying`**: Whether audio is currently playing (true/false)
5. **`wantToAutoPlay`**: Flag to remember playback state when switching tracks

### Key Technical Details

#### Audio Element
```svelte
<audio bind:this={audioEl} src={currentTrack.src} preload="metadata"></audio>
```
- Uses HTML5 `<audio>` element bound to a variable
- `preload="metadata"` loads duration without downloading the full file
- `src` is reactive - changes when switching tracks

#### Event Handling

The component listens to these audio events:

1. **`timeupdate`**: Fires continuously during playback (~4 times per second)
   - Updates the current time display
   - Only updates when not seeking (to prevent slider jumping)

2. **`loadedmetadata`**: Fires when audio metadata is loaded
   - Gets the track's total duration

3. **`play`**: Fires when playback starts
   - Sets `isPlaying = true` to show pause icon

4. **`pause`**: Fires when playback pauses
   - Sets `isPlaying = false` to show play icon

5. **`ended`**: Fires when track finishes
   - Resets current time to 0
   - Auto-advances to next track if in playlist mode

#### Track Switching Logic

When you click previous/next:
```javascript
function goToNext() {
  if (canGoNext) {
    currentIndex++;              // Move to next track
    wantToAutoPlay = isPlaying;  // Remember if we were playing
  }
}
```

The `$effect` detects the track change and:
1. Sets the new audio source
2. Resets time and duration to 0
3. Sets `isPlaying = false` (audio pauses during load)
4. If `wantToAutoPlay` is true, adds a listener to auto-play when ready

#### Seek Functionality

The progress bar is an `<input type="range">`:
- **User drags slider**: `oninput` fires → sets `audio.currentTime`
- **Prevents jumping**: Sets `isSeeking = true` to pause time updates
- **On release**: `onchange` fires → sets `isSeeking = false`

#### Time Formatting

```javascript
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
```
Converts seconds (e.g., 125) to "2:05" format.

### Styling

Uses CSS custom properties (theme variables):
- `--color-card`: Background color
- `--color-border`: Border and slider track color
- `--color-primary`: Play button and slider thumb color
- `--color-foreground`: Text color
- `--color-muted`: Secondary text (artist, time)

This ensures the player automatically adapts to your site's theme.

## File Structure

```
src/
├── lib/
│   └── components/
│       └── MusicPlayer.svelte          # Main component
├── routes/
│   └── music/
│       ├── +page.svelte                # Music page template
│       └── +page.server.js             # Track data loader
static/
└── music/
    ├── .gitkeep
    ├── sample-12s.mp3                  # Example tracks
    ├── sample-15s.mp3
    ├── sample-9s.mp3
    └── voice-note.wav
```

## How to Use

### Step 1: Add Audio Files
Place your audio files in `static/music/`:
```
static/music/my-song.mp3
static/music/podcast.wav
```

### Step 2: Configure Tracks
Edit `src/routes/music/+page.server.js`:
```javascript
export function load() {
  return {
    tracks: [
      { 
        src: '/music/my-song.mp3', 
        title: 'My Awesome Song', 
        artist: 'Me' 
      },
      { 
        src: '/music/podcast.wav', 
        title: 'Episode 1' 
      }
    ]
  };
}
```

### Step 3: Use in Other Pages (Optional)
Import and use the component anywhere:
```svelte
<script>
  import MusicPlayer from '$lib/components/MusicPlayer.svelte';
</script>

<MusicPlayer tracks={[
  { src: '/music/song.mp3', title: 'Title', artist: 'Artist' }
]} />
```

## Customization

### Change Colors
The player uses theme variables. To customize colors, edit your theme in `src/lib/index.css` or create a custom theme file.

### Change Layout
Edit `src/lib/components/MusicPlayer.svelte`:
- Modify the `<style>` section for different sizing
- Adjust the `.music-player` class for different max-width or padding
- Rearrange elements in the template for different layouts

### Add Features
Some ideas:
- **Volume control**: Add `<input type="range">` bound to `audio.volume`
- **Shuffle**: Randomize `currentIndex` when clicking next
- **Loop**: Check if at end and restart playlist
- **Download button**: Add `<a href={currentTrack.src} download>`

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

Requires JavaScript enabled. No other dependencies.

## Technical Notes

### Why Svelte 5 Runes?
- `$state()`: Reactive state that triggers re-renders
- `$derived`: Computed values that update automatically
- `$effect()`: Side effects (audio event listeners) that re-run when dependencies change

### Why HTML5 Audio?
- Native browser support (no libraries needed)
- Good performance
- Wide format support
- Handles streaming automatically
- Built-in browser controls available if needed

### State Synchronization
The trickiest part was keeping the UI state (`isPlaying`) in sync with the actual audio element state:
- Solution: Always set `isPlaying = false` when changing tracks (audio pauses during load)
- Then use the `play` and `pause` events to update `isPlaying` accurately
- This ensures the play/pause button icon always matches reality

## Adding to Navigation

The Music page was added to the site navigation by:
1. Adding `{ title: 'Music', url: '/music' }` to `site.config.js` navbar
2. Adding `'/music'` to `svelte.config.js` prerender entries

This makes it appear in the site's navigation bar and ensures it's pre-rendered at build time.

## Summary

This implementation provides a complete, production-ready music player that:
- Works with any audio format the browser supports
- Handles both single tracks and playlists
- Maintains playback state when switching tracks
- Integrates seamlessly with the Statue SSG theme system
- Requires no external dependencies beyond Svelte and the HTML5 Audio API
- Is fully self-contained and reusable across the site
