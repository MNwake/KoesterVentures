<script>
  let formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  function handleSubmit(event) {
    event.preventDefault();
    // Here you would typically handle the form submission
    console.log('Form submitted:', formData);
    // Reset form
    formData = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }
</script>

<section id="contact" class="section contact">
  <div class="container">
    <h2>Get in Touch</h2>
    <p class="section-description">
      Ready to bring your ideas to life? Let's discuss how we can help you achieve your goals.
    </p>

    <div class="contact-container">
      <div class="contact-info">
        <div class="info-item">
          <h3>Email</h3>
          <p><a href="mailto:contact@koesterventures.com">contact@koesterventures.com</a></p>
        </div>
        <div class="info-item">
          <h3>Location</h3>
          <p>San Francisco Bay Area, CA</p>
        </div>
        <div class="info-item">
          <h3>Follow Us</h3>
          <div class="social-links">
            <a href="https://github.com/yourusername" target="_blank" rel="noopener">GitHub</a>
            <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>
      </div>

      <form class="contact-form" on:submit={handleSubmit}>
        <div class="form-group">
          <label for="name">Name</label>
          <input 
            type="text" 
            id="name" 
            bind:value={formData.name} 
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            bind:value={formData.email} 
            required
          />
        </div>

        <div class="form-group">
          <label for="subject">Subject</label>
          <input 
            type="text" 
            id="subject" 
            bind:value={formData.subject} 
            required
          />
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea 
            id="message" 
            bind:value={formData.message} 
            rows="5" 
            required
          ></textarea>
        </div>

        <button type="submit" class="btn primary">Send Message</button>
      </form>
    </div>
  </div>
</section>

<style>
  .contact {
    background-color: white;
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

  .contact-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 4rem;
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .info-item h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }

  .info-item p {
    color: var(--text-color);
    opacity: 0.8;
  }

  .info-item a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color var(--transition-speed);
  }

  .info-item a:hover {
    color: var(--secondary-color);
  }

  .social-links {
    display: flex;
    gap: 1rem;
  }

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 500;
    color: var(--text-color);
  }

  input, textarea {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: border-color var(--transition-speed);
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--transition-speed);
  }

  .btn.primary {
    background: var(--primary-color);
    color: white;
  }

  .btn.primary:hover {
    background: var(--secondary-color);
  }

  @media (max-width: 768px) {
    .contact-container {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .contact-info {
      order: 2;
    }

    .contact-form {
      order: 1;
    }
  }
</style> 