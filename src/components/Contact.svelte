<script>
  let formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  
  let isSubmitting = false;
  let submitTimeout = null;
  
  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  function validateForm() {
    // Trim all fields before validation
    const trimmedData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      subject: formData.subject.trim(),
      message: formData.message.trim()
    };
    
    // Check for empty fields
    if (!trimmedData.name || !trimmedData.email || 
        !trimmedData.subject || !trimmedData.message) {
      alert('Please fill out all fields');
      return false;
    }
    
    // Validate email format
    if (!emailRegex.test(trimmedData.email)) {
      alert('Please enter a valid email address');
      return false;
    }
    
    // Check minimum lengths
    if (trimmedData.name.length < 2) {
      alert('Name must be at least 2 characters long');
      return false;
    }
    
    if (trimmedData.subject.length < 3) {
      alert('Subject must be at least 3 characters long');
      return false;
    }
    
    if (trimmedData.message.length < 10) {
      alert('Message must be at least 10 characters long');
      return false;
    }
    
    // Update formData with trimmed values
    formData = trimmedData;
    
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    isSubmitting = true;
    
    try {
      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Clear form after successful submission
      formData = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };
      
      alert('Message sent successfully!');
      
      // Prevent multiple submissions within 30 seconds
      if (submitTimeout) {
        clearTimeout(submitTimeout);
      }
      submitTimeout = setTimeout(() => {
        isSubmitting = false;
      }, 30000); // 30 second cooldown
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again later.');
      isSubmitting = false;
    }
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
          <p><a href="mailto:theo@koesterventures.com">theo@koesterventures.com</a></p>
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
            minlength="2"
            maxlength="100"
            required
          />
          <input 
            type="email" 
            id="input-email" 
            placeholder="Email address"
            bind:value={formData.email}
            pattern="[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+"
            maxlength="100"
            required
          />
          <input 
            type="text" 
            id="input-subject" 
            placeholder="Subject"
            bind:value={formData.subject}
            minlength="3"
            maxlength="200"
            required
          />
          <textarea 
            name="message" 
            id="input-message" 
            placeholder="Message"
            bind:value={formData.message}
            minlength="10"
            maxlength="2000"
            required
          ></textarea>
        </div>
        <input 
          type="submit" 
          value={isSubmitting ? 'Sending...' : 'Send Message'} 
          id="input-submit"
          disabled={isSubmitting}
        >
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

  #input-submit:hover:not(:disabled) {
    background: var(--secondary-color, #c0392b);
    transform: translateY(-2px);
  }

  #input-submit:disabled {
    background: var(--gray-light, #ccc);
    cursor: not-allowed;
    transform: none;
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