<script>
  import { onMount } from "svelte";

  export let repo = "";

  onMount(() => {
    // Load GitHub buttons script
    const script = document.createElement("script");
    script.src = "https://buttons.github.io/buttons.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  });
</script>

<div class="github-btn">
  <a
    class="github-button"
    href="https://github.com/{repo}"
    data-color-scheme="no-preference: light; light: light; dark: dark;"
    data-icon="octicon-repo"
    data-size="large"
    aria-label="View {repo} on GitHub"
  >
    View on GitHub
  </a>
</div>

<style>
  .github-btn {
    margin-top: 0.5rem;
  }
</style>
