<script>
  let formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  function handleSubmit(event) {
    event.preventDefault();
    console.log('Form submitted:', formData);
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
          <p><a href="mailto:contact@koesterventures.com">theo@koesterventures.com</a></p>
        </div>
        <div class="info-item">
          <h3>Location</h3>
          <p>Lakeland, FL</p>
        </div>
        <div class="info-item">
          <h3>Follow Us</h3>
          <div class="social-links">
            <a href="https://github.com/MNwake" target="_blank" rel="noopener">GitHub</a>
            <a href="https://www.linkedin.com/in/theo-koester-335a2a90" target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>
      </div>

      <form class="contact-form cf" on:submit={handleSubmit}>
        <div class="form-inputs">
          <input 
            type="text" 
            id="input-name" 
            placeholder="Name"
            bind:value={formData.name}
            required
          />
          <input 
            type="email" 
            id="input-email" 
            placeholder="Email address"
            bind:value={formData.email}
            required
          />
          <input 
            type="text" 
            id="input-subject" 
            placeholder="Subject"
            bind:value={formData.subject}
            required
          />
          <textarea 
            name="message" 
            id="input-message" 
            placeholder="Message"
            bind:value={formData.message}
            required
          ></textarea>
        </div>
        <input type="submit" value="Send Message" id="input-submit">
      </form>
    </div>
  </div>
</section>

<style>
  .contact {
    background-color: var(--gray-light, #f1f1f1);
    padding: 4rem 0;
  }

  h2 {
    text-align: center;
    font-size: 2.5rem;
    color: var(--text-color, #333);
    margin-bottom: 1rem;
  }

  .section-description {
    text-align: center;
    max-width: 600px;
    margin: 0 auto 3rem auto;
    color: var(--text-color, #333);
    opacity: 0.8;
  }

  .contact-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 4rem;
    align-items: start;
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .info-item h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: var(--text-color, #333);
  }

  .info-item p {
    color: var(--text-color, #333);
    opacity: 0.8;
  }

  .info-item a {
    color: var(--primary-color, #e74c3c);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .info-item a:hover {
    color: var(--secondary-color, #c0392b);
  }

  .social-links {
    display: flex;
    gap: 1rem;
  }

  .contact-form {
    width: 100%;
  }

  .form-inputs {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  input, textarea {
    border: 1px solid #e2e8f0;
    outline: 0;
    padding: 1em;
    border-radius: 8px;
    width: 100%;
    font-family: inherit;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  input:focus, textarea:focus {
    border-color: var(--primary-color, #e74c3c);
    box-shadow: 0 0 2px var(--primary-color, #e74c3c);
  }

  textarea {
    height: 150px;
    resize: vertical;
  }

  #input-submit {
    margin-top: 1rem;
    color: white;
    background: var(--primary-color, #e74c3c);
    cursor: pointer;
    font-weight: 600;
    padding: 1rem 2rem;
  }

  #input-submit:hover {
    background: var(--secondary-color, #c0392b);
    transform: translateY(-2px);
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