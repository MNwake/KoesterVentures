<script>
  const projects = [
    {
      title: "Cabl3D",
      description: "A mobile app for cable wakeboard parks to manage their operations and engage with riders.",
      tags: ["Mobile App", "React Native", "Python", "FastAPI"],
      image: "/assets/cabl3d.jpg"
    },
    {
      title: "CableCoin",
      description: "A cryptocurrency platform for the cable wakeboarding industry.",
      tags: ["Web3", "Blockchain", "Svelte", "Smart Contracts"],
      image: "/assets/cablecoin.jpg"
    },
    {
      title: "CabledWakeparks",
      description: "An informational platform for cable wakeboard parks worldwide.",
      tags: ["Web Development", "Svelte", "Python"],
      image: "/assets/cabledwakeparks.jpg"
    }
  ];
</script>

<section id="portfolio" class="section portfolio">
  <div class="container">
    <h2>Our Work</h2>
    <p class="section-description">
      Check out some of our recent projects that showcase our expertise in building modern, scalable solutions.
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
    margin: 0 auto 3rem auto;
    color: var(--text-color);
    opacity: 0.8;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
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
    height: 200px;
    overflow: hidden;
  }

  .project-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
</style> 