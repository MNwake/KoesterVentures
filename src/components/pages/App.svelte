<script>
  import { Router, Route } from "svelte-routing";
  import Nav from "../home/Nav.svelte";
  import Hero from "../home/Hero.svelte";
  import Portfolio from "./Portfolio.svelte";
  import Services from "../home/Services.svelte";
  import Contact from "../home/Contact.svelte";
  import Footer from "../home/Footer.svelte";
  import OurWork from "../home/OurWork.svelte";
  import ChatWidget from "../home/ChatWidget.svelte";

  export let url = "";
  let isMobile = false;

  // Check if we're on mobile
  function checkMobile() {
    isMobile = window.innerWidth <= 768;
  }

  import { onMount } from "svelte";
  onMount(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  });
</script>

<Router {url}>
  <div class="app">
    <Nav />
    <main>
      <Route path="/" primary={false}>
        <Hero />
        <OurWork />
        <Services />
        <Contact />
      </Route>
      <Route path="/portfolio" primary={false}>
        <Portfolio />
      </Route>
    </main>
    <Footer />
    {#if !isMobile}
      <ChatWidget />
    {/if}
  </div>
</Router>

<style>
  :global(:root) {
    --primary-color: #2563eb;
    --secondary-color: #1e40af;
    --text-color: #1f2937;
    --background-color: #ffffff;
    --accent-color: #3b82f6;
    --gray-light: #f3f4f6;
    --transition-speed: 0.3s;
  }

  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family:
      "Inter",
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      sans-serif;
    color: var(--text-color);
    line-height: 1.6;
    background-color: var(--background-color);
  }

  :global(.container) {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    width: 100%;
  }

  :global(.section) {
    padding: 4rem 0;
  }

  :global(h1, h2, h3, h4, h5, h6) {
    color: var(--text-color);
    line-height: 1.2;
  }

  :global(a) {
    color: var(--primary-color);
    text-decoration: none;
    transition: color var(--transition-speed);
  }

  :global(a:hover) {
    color: var(--secondary-color);
  }

  :global(button) {
    cursor: pointer;
    font-family: inherit;
  }

  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    margin-top: 4rem;
  }
</style>
