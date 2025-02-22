<script>
  import { Link } from "svelte-routing";
  import ChatWidget from "./ChatWidget.svelte";
  let isMenuOpen = false;
  let isMobile = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  // Check if we're on mobile
  function checkMobile() {
    isMobile = window.innerWidth <= 768;
  }

  // Add resize listener
  import { onMount } from "svelte";
  onMount(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  });
</script>

<nav class="nav">
  <div class="container nav-container">
    <Link to="/" let:href>
      <a {href} class="logo">Koester Ventures</a>
    </Link>

    <button class="menu-toggle" on:click={toggleMenu}>
      <span class="sr-only">Menu</span>
      <div class="hamburger" class:open={isMenuOpen}></div>
    </button>

    <ul class="nav-links" class:open={isMenuOpen}>
      <!-- <li><Link to="#portfolio">Portfolio</Link></li> -->
      <li><a href="#portfolio">Portfolio</a></li>
      <li><a href="#services">Services</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#contact" class="cta-button">Get in Touch</a></li>
      {#if isMobile}
        <li class="mobile-chat">
          <ChatWidget />
        </li>
      {/if}
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
      z-index: 1001;
    }

    .nav-links {
      position: fixed;
      top: 4rem;
      left: 0;
      right: 0;
      bottom: 0; /* Make menu full height */
      background: var(--background-color);
      flex-direction: column;
      padding: 1rem;
      gap: 1rem;
      transform: translateX(100%); /* Slide from right instead of top */
      transition: transform var(--transition-speed);
      box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
    }

    .nav-links.open {
      transform: translateX(0);
    }

    .mobile-chat {
      margin-top: auto; /* Push chat to bottom of menu */
      padding-top: 1rem;
      border-top: 1px solid var(--gray-light);
    }

    /* Override ChatWidget styles for mobile */
    :global(.mobile-chat .chat-widget) {
      position: static;
      width: 100%;
    }

    :global(.mobile-chat .chat-window) {
      position: fixed;
      top: 4rem;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: calc(100vh - 4rem); /* Adjust height to account for nav */
      border-radius: 0;
      z-index: 1002; /* Ensure it's above the mobile menu */
    }

    :global(.mobile-chat .chat-button) {
      width: 100%;
      border-radius: 0.375rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    :global(.mobile-chat .chat-button .message-icon) {
      margin-right: 0.5rem;
    }

    :global(.mobile-chat) {
      width: 100%;
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-light);
    }

    .nav-links {
      z-index: 1001; /* Ensure proper layering */
    }

    .hamburger::before,
    .hamburger::after {
      content: "";
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
