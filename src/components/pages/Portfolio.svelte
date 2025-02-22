<script>
  import { portfolio_projects } from "../../js/utils";
  import { fade, slide, fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import GitHubButton from "../common/GitHubButton.svelte";

  const categories = ["mobile", "web", "server"];
  const categoryLabels = {
    mobile: "Mobile Apps",
    web: "Web Development",
    server: "Backend & Infrastructure",
  };

  let selectedCategory = "mobile";

  $: filteredProjects = portfolio_projects.filter(
    (p) => p.category === selectedCategory
  );

  function selectCategory(category) {
    selectedCategory = category;
  }
</script>

<div class="portfolio-page">
  <main class="container">
    <h1 transition:slide>My Portfolio</h1>
    <p class="section-description">
      Explore my technical journey across mobile, web, and backend development.
    </p>

    <div class="tabs-container">
      <div class="tabs" role="tablist">
        {#each categories as category}
          <button
            role="tab"
            class="tab-btn"
            class:active={selectedCategory === category}
            on:click={() => selectCategory(category)}
            aria-selected={selectedCategory === category}
          >
            {categoryLabels[category]}
            <div class="tab-indicator" />
          </button>
        {/each}
      </div>
    </div>

    <div class="projects-grid" role="tabpanel">
      {#each filteredProjects as project (project.title + project.category)}
        <div
          class="project-card"
          in:fly={{ y: 20, duration: 300, delay: 150 }}
          out:fade={{ duration: 200 }}
        >
          <div class="project-status">{project.status}</div>
          <div class="project-image">
            {#if project.image}
              <img src={project.image} alt={project.title} loading="lazy" />
            {:else}
              <div class="placeholder-image">
                <span>{project.title[0]}</span>
              </div>
            {/if}
          </div>
          <div class="project-content">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div class="tags">
              {#each project.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
            {#if project.Github}
              <GitHubButton
                repo={project.Github.replace("https://github.com/", "")}
              />
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </main>
</div>

<style>
  .portfolio-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-color);
  }

  .container {
    max-width: 1200px;
    margin: 6rem auto 2rem;
    padding: 2rem;
    flex: 1;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-align: center;
    color: var(--text-color);
  }

  .section-description {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 3rem;
    color: var(--text-color);
    opacity: 0.8;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  .tabs-container {
    margin-bottom: 3rem;
  }

  .tabs {
    display: flex;
    justify-content: center;
    gap: 1rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1px;
  }

  .tab-btn {
    background: none;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    color: var(--text-color);
    opacity: 0.7;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
  }

  .tab-btn:hover {
    opacity: 1;
  }

  .tab-btn.active {
    opacity: 1;
    color: var(--primary-color);
  }

  .tab-indicator {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--primary-color);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .tab-btn.active .tab-indicator {
    transform: scaleX(1);
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    min-height: 400px;
  }

  .project-card {
    background: var(--card-bg);
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
  }

  .project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }

  .project-status {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
    font-size: 0.875rem;
    backdrop-filter: blur(4px);
    z-index: 1;
  }

  .project-image {
    width: 100%;
    height: 200px;
    position: relative;
    overflow: hidden;
  }

  .project-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .project-card:hover .project-image img {
    transform: scale(1.05);
  }

  .project-content {
    padding: 1.5rem;
  }

  .project-content h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-color);
  }

  .project-content p {
    color: var(--text-color);
    opacity: 0.9;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tag {
    background: var(--primary-color);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .container {
      margin-top: 5rem;
      padding: 1rem;
    }

    h1 {
      font-size: 2.5rem;
    }

    .tabs {
      flex-direction: column;
      align-items: center;
      border-bottom: none;
      gap: 0.5rem;
    }

    .tab-btn {
      width: 100%;
      max-width: 300px;
      padding: 0.75rem;
      border-radius: 0.5rem;
      text-align: center;
    }

    .tab-btn.active {
      background: var(--primary-color);
      color: white;
    }

    .tab-indicator {
      display: none;
    }

    .projects-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
