<script>
  const services = [
    {
      title: "Web Development",
      description: "Custom websites and web applications built with modern technologies and best practices.",
      icon: "🌐",
      features: [
        "Responsive Design",
        "Progressive Web Apps",
        "E-commerce Solutions",
        "Content Management Systems"
      ]
    },
    {
      title: "Mobile Development",
      description: "Native and cross-platform mobile applications for iOS and Android.",
      icon: "📱",
      features: [
        "React Native Apps",
        "Native iOS/Android",
        "App Store Deployment",
        "Mobile UI/UX Design"
      ]
    },
    {
      title: "Backend Development",
      description: "Scalable and secure server-side solutions for your applications.",
      icon: "⚙️",
      features: [
        "API Development",
        "Database Design",
        "Cloud Infrastructure",
        "System Architecture"
      ]
    },
    {
      title: "Web3 Solutions",
      description: "Blockchain and cryptocurrency integration for modern applications.",
      icon: "🔗",
      features: [
        "Smart Contracts",
        "DApp Development",
        "Token Integration",
        "Blockchain Consulting"
      ]
    }
  ];
</script>

<section id="services" class="section services">
  <div class="container">
    <h2>Our Services</h2>
    <p class="section-description">
      We offer comprehensive software development services to help businesses thrive in the digital age.
    </p>

    <div class="services-grid">
      {#each services as service}
        <div class="service-card">
          <div class="service-icon">{service.icon}</div>
          <h3>{service.title}</h3>
          <p>{service.description}</p>
          <ul class="features-list">
            {#each service.features as feature}
              <li>{feature}</li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .services {
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

  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .service-card {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform var(--transition-speed);
  }

  .service-card:hover {
    transform: translateY(-5px);
  }

  .service-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .service-card h3 {
    font-size: 1.5rem;
    color: var(--text-color);
    margin-bottom: 1rem;
  }

  .service-card p {
    color: var(--text-color);
    opacity: 0.8;
    margin-bottom: 1.5rem;
  }

  .features-list {
    list-style: none;
    padding: 0;
  }

  .features-list li {
    color: var(--text-color);
    opacity: 0.8;
    margin-bottom: 0.5rem;
    padding-left: 1.5rem;
    position: relative;
  }

  .features-list li::before {
    content: "→";
    position: absolute;
    left: 0;
    color: var(--primary-color);
  }

  @media (max-width: 768px) {
    .services-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 