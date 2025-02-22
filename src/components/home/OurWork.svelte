<script>
  import { projects } from "../../js/utils";
</script>

<section id="portfolio" class="section portfolio">
  <div class="container">
    <h2>Our Work</h2>
    <p class="section-description">
      Check out some of our recent projects that showcase our expertise in
      building modern, scalable solutions.
    </p>

    <div class="projects-grid">
      {#each projects as project}
        <div class="project-card">
          <div class="project-image">
            <img src={project.image} alt={project.title} />
          </div>
          <div class="project-content">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div class="tags">
              {#each project.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="view-all-wrapper">
      <a href="/portfolio" class="view-all-button">View All Projects</a>
    </div>
  </div>
</section>

<style>
  .portfolio {
    background-color: var(--gray-light);
  }

  h2 {
    text-align: center;
    font-size: 2.5rem;
    color: var(--text-color);
    margin-bottom: 1rem;
  }

  .section-description {
    text-align: center;
    max-width: 600px;
    margin: 0 auto 2rem auto;
    color: var(--text-color);
    opacity: 0.8;
  }

  .projects-grid {
    margin-top: 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .project-card {
    background: white;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform var(--transition-speed);
  }

  .project-card:hover {
    transform: translateY(-5px);
  }

  .project-image {
    width: 100%;
    height: 300px;
    overflow: hidden;
  }

  .project-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: var(white);
  }

  .project-content {
    padding: 1.5rem;
  }

  .project-content h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }

  .project-content p {
    color: var(--text-color);
    opacity: 0.8;
    margin-bottom: 1rem;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    background: var(--primary-color);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .projects-grid {
      grid-template-columns: 1fr;
    }
  }

  .view-all-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 3rem;
    margin-bottom: 2rem;
  }

  .view-all-button {
    display: inline-block;
    padding: 1rem 2rem;
    background-color: var(--primary-color);
    color: white;
    text-decoration: none;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: background-color var(--transition-speed);
  }

  .view-all-button:hover {
    background-color: var(--primary-color-dark);
    transform: translateY(-2px);
  }

  .view-all-button:active {
    transform: translateY(0);
  }
</style>
