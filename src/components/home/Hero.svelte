<script>
  import { onMount } from 'svelte';
  
  let typed = '';
  let phrases = ['Software Development', 'Web Design', 'Mobile Apps', 'Cloud Solutions'];
  let currentPhraseIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  let deletingSpeed = 50;
  let pauseEnd = 2000;
  
  onMount(() => {
    typeWriter();
  });
  
  function typeWriter() {
    const currentPhrase = phrases[currentPhraseIndex];
    
    if (isDeleting) {
      typed = currentPhrase.substring(0, typed.length - 1);
    } else {
      typed = currentPhrase.substring(0, typed.length + 1);
    }
    
    let typeSpeed = isDeleting ? deletingSpeed : typingSpeed;
    
    if (!isDeleting && typed === currentPhrase) {
      typeSpeed = pauseEnd;
      isDeleting = true;
    } else if (isDeleting && typed === '') {
      isDeleting = false;
      currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
    }
    
    setTimeout(typeWriter, typeSpeed);
  }
</script>

<section class="hero section">
  <div class="container">
    <div class="hero-content">
      <h1>Transforming Ideas into <br/><span class="typing">{typed}</span></h1>
      <p class="subtitle">
        We build innovative software solutions that drive business growth
        and user engagement.
      </p>
      <div class="cta-buttons">
        <a href="#portfolio" class="btn primary">View Our Work</a>
        <a href="#contact" class="btn secondary">Get in Touch</a>
      </div>
    </div>
  </div>
</section>

<style>
  section.hero {
    min-height: calc(100vh - 4rem);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 6rem 1rem 4rem 1rem;
    margin-top: 4rem;
    background: linear-gradient(-45deg, var(--background-color), var(--gray-light), var(--accent-color), var(--primary-color));
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    position: relative;
  }
  
  h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    line-height: 1.2;
    color: var(--text-color);
  }
  
  .typing {
    color: var(--primary-color);
    border-right: 3px solid var(--primary-color);
    padding-right: 5px;
    display: inline-block;
    min-width: 10px;
    font-weight: 800;
  }
  
  .subtitle {
    font-size: 1.25rem;
    color: var(--text-color);
    opacity: 0.8;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  .btn {
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    font-weight: 600;
    text-decoration: none;
    transition: all var(--transition-speed);
    font-size: 1.1rem;
  }
  
  .btn.primary {
    background: var(--primary-color);
    color: white;
  }
  
  .btn.primary:hover {
    background: var(--secondary-color);
    transform: translateY(-2px);
  }
  
  .btn.secondary {
    background: transparent;
    color: var(--text-color);
    border: 2px solid var(--primary-color);
  }
  
  .btn.secondary:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    .hero {
      padding-top: 5rem;
    }

    h1 {
      font-size: 2.5rem;
    }
    
    .subtitle {
      font-size: 1.1rem;
    }
    
    .cta-buttons {
      flex-direction: column;
    }
    
    .btn {
      width: 100%;
      text-align: center;
    }
  }
</style> 