import App from "../components/pages/App.svelte";
import { Router } from "svelte-routing";
import analytics from "../../../components/analytics.js";

const app = new App({
  target: document.getElementById("app"),
  props: {
    url: window.location.pathname,
  },
});

// Track route changes for SPA
window.addEventListener("popstate", () => {
  analytics.trackPageView();
});

export default app;
