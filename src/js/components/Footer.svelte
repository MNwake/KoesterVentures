<script>
  const currentYear = new Date().getFullYear();
  
  const links = {
    company: [
      { text: "About", href: "#about" },
      { text: "Services", href: "#services" },
      { text: "Portfolio", href: "#portfolio" },
      { text: "Contact", href: "#contact" }
    ],
    legal: [
      { text: "Privacy Policy", href: "/privacy_policy.html" },
      { text: "Terms of Service", href: "/terms.html" }
    ],
    social: [
      { text: "GitHub", href: "https://github.com/theopkoester", icon: "github" },
      { text: "LinkedIn", href: "https://linkedin.com/in/theopkoester", icon: "linkedin" }
    ]
  };
</script>

<footer class="footer">
  <div class="container footer-content">
    <div class="footer-main">
      <div class="footer-brand">
        <h3>Koester Ventures</h3>
        <p>Building innovative software solutions for the modern world.</p>
      </div>
      
      <div class="footer-links">
        <div class="link-group">
          <h4>Company</h4>
          <ul>
            {#each links.company as link}
              <li><a href={link.href}>{link.text}</a></li>
            {/each}
          </ul>
        </div>
        
        <div class="link-group">
          <h4>Legal</h4>
          <ul>
            {#each links.legal as link}
              <li><a href={link.href}>{link.text}</a></li>
            {/each}
          </ul>
        </div>
        
        <div class="link-group">
          <h4>Connect</h4>
          <ul class="social-links">
            {#each links.social as link}
              <li>
                <a href={link.href} target="_blank" rel="noopener">
                  {link.text}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; {currentYear} Koester Ventures. All rights reserved.</p>
    </div>
  </div>
</footer>

<style>
  .footer {
    background-color: var(--text-color);
    color: white;
    padding: 4rem 0 2rem;
  }

  .footer-content {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .footer-main {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 4rem;
  }

  .footer-brand h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .footer-brand p {
    opacity: 0.8;
    line-height: 1.6;
  }

  .footer-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .link-group h4 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: var(--accent-color);
  }

  .link-group ul {
    list-style: none;
    padding: 0;
  }

  .link-group li {
    margin-bottom: 0.5rem;
  }

  .link-group a {
    color: white;
    opacity: 0.8;
    text-decoration: none;
    transition: opacity var(--transition-speed);
  }

  .link-group a:hover {
    opacity: 1;
  }

  .social-links {
    display: flex;
    gap: 1rem;
  }

  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 2rem;
    text-align: center;
  }

  .footer-bottom p {
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    .footer-main {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .footer-links {
      grid-template-columns: 1fr;
    }

    .social-links {
      flex-direction: column;
    }
  }
</style> 