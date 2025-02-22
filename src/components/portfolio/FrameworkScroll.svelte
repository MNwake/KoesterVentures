<script>
  import { frameworks } from "../../js/utils";

  let scrollTrack;
  let isScrolling = false;
  let startX;
  let scrollLeft;
  let scrollPosition = 0;

  function handleMouseDown(e) {
    isScrolling = true;
    startX = e.pageX - scrollTrack.offsetLeft;
    scrollLeft = scrollTrack.scrollLeft;
    scrollTrack.style.cursor = "grabbing";
  }

  function handleMouseMove(e) {
    if (!isScrolling) return;
    e.preventDefault();
    const x = e.pageX - scrollTrack.offsetLeft;
    const walk = (x - startX) * 2;
    scrollTrack.scrollLeft = scrollLeft - walk;
    scrollPosition = Math.round(
      (scrollTrack.scrollLeft / scrollTrack.scrollWidth) * 100
    );
  }

  function handleMouseUp() {
    isScrolling = false;
    scrollTrack.style.cursor = "grab";
  }

  function handleMouseLeave() {
    isScrolling = false;
    scrollTrack.style.cursor = "grab";
  }
</script>

<div class="scroll-container">
  <div
    class="scroll-track"
    bind:this={scrollTrack}
    on:mousedown={handleMouseDown}
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseLeave}
    role="slider"
    aria-label="Framework showcase slider"
    aria-valuenow={scrollPosition}
    aria-valuemin="0"
    aria-valuemax="100"
    tabindex="0"
  >
    <!-- First set of icons -->
    <div class="scroll-content">
      {#each frameworks as framework}
        <div class="framework-item">
          <a href={framework.url} target="_blank" rel="noopener noreferrer">
            <img src={framework.icon} alt={framework.name} loading="lazy" />
          </a>
        </div>
      {/each}
    </div>
    <!-- Duplicate set for seamless scrolling -->
    <div class="scroll-content" aria-hidden="true">
      {#each frameworks as framework}
        <div class="framework-item">
          <a href={framework.url} target="_blank" rel="noopener noreferrer">
            <img src={framework.icon} alt={framework.name} loading="lazy" />
          </a>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .scroll-container {
    width: 100%;
    overflow: hidden;
    padding: 2rem 0;
  }

  .scroll-track {
    display: flex;
    width: fit-content;
    animation: scroll 60s linear infinite;
    cursor: grab;
    user-select: none;
  }

  .scroll-track:hover {
    animation-play-state: paused;
  }

  .scroll-track:active {
    cursor: grabbing;
  }

  .scroll-content {
    display: flex;
    gap: 10rem;
    padding: 0 5rem;
    align-items: center;
  }

  .framework-item {
    display: flex;
    align-items: center;
    width: 100px;
  }

  .framework-item img {
    width: 148px;
    height: 84px;
    object-fit: contain;
    transition: transform 0.3s ease;
    filter: grayscale(30%) brightness(1.2);
    pointer-events: none;
  }

  .framework-item:hover img {
    transform: scale(1.1);
    filter: grayscale(0%);
  }

  .framework-item a {
    display: inline-block;
    cursor: pointer;
  }

  .framework-item a:focus {
    outline: 2px solid var(--primary-color, #4299e1);
    border-radius: 4px;
  }

  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .scroll-track {
      animation: none;
    }

    .scroll-container {
      overflow-x: auto;
    }
  }

  /* Responsive adjustments */
  @media (max-width: 900px) {
    .scroll-content {
      gap: 4rem;
    }

    .framework-item {
      width: 80px;
    }

    .framework-item img {
      width: 84px;
      height: 84px;
    }
  }
  
</style>
