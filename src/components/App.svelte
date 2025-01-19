<script>
  import Nav from './Nav.svelte';
  import Hero from './Hero.svelte';
  import Portfolio from './Portfolio.svelte';
  import Services from './Services.svelte';
  import Contact from './Contact.svelte';
  import Footer from './Footer.svelte';
</script>

<div class="app">
  <Nav />
  <main>
    <Hero />
    <Portfolio />
    <Services />
    <Contact />
  </main>
  <Footer />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    width: 100%;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  :global(.container) {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    width: 100%;
  }
</style> 