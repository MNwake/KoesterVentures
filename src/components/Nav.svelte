<script>
  let isMenuOpen = false;
  
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<nav class="nav">
  <div class="container nav-container">
    <a href="/" class="logo">Koester Ventures</a>
    
    <button class="menu-toggle" on:click={toggleMenu}>
      <span class="sr-only">Menu</span>
      <div class="hamburger" class:open={isMenuOpen}></div>
    </button>
    
    <ul class="nav-links" class:open={isMenuOpen}>
      <li><a href="#portfolio">Portfolio</a></li>
      <li><a href="#services">Services</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#contact" class="cta-button">Get in Touch</a></li>
    </ul>
  </div>
</nav>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--background-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 4rem;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-links a {
    color: var(--text-color);
    text-decoration: none;
    font-weight: 500;
    transition: color var(--transition-speed);
  }

  .nav-links a:hover {
    color: var(--primary-color);
  }

  .cta-button {
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white !important;
    border-radius: 0.375rem;
  }

  .cta-button:hover {
    background: var(--secondary-color);
    color: white !important;
  }

  .menu-toggle {
    display: none;
  }

  .hamburger {
    width: 24px;
    height: 2px;
    background: var(--text-color);
    position: relative;
    transition: all var(--transition-speed);
  }

  @media (max-width: 768px) {
    .menu-toggle {
      display: block;
      background: none;
      border: none;
      padding: 0.5rem;
    }

    .nav-links {
      position: fixed;
      top: 4rem;
      left: 0;
      right: 0;
      background: var(--background-color);
      flex-direction: column;
      padding: 1rem;
      gap: 1rem;
      transform: translateY(-100%);
      transition: transform var(--transition-speed);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .nav-links.open {
      transform: translateY(0);
    }

    .hamburger::before,
    .hamburger::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      background: var(--text-color);
      transition: all var(--transition-speed);
    }

    .hamburger::before {
      top: -6px;
    }

    .hamburger::after {
      bottom: -6px;
    }

    .hamburger.open {
      background: transparent;
    }

    .hamburger.open::before {
      transform: rotate(45deg);
      top: 0;
    }

    .hamburger.open::after {
      transform: rotate(-45deg);
      bottom: 0;
    }
  }
</style> 