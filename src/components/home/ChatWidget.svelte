<script>
  import { fade, slide } from "svelte/transition";
  import { writable } from "svelte/store";
  import { onMount } from "svelte";
  import { ChatAPI } from "../../js/api.js";

  let isOpen = false;
  const inputStore = writable("");
  let isLoading = false;

  // Store for chat messages
  const messages = writable([
    {
      role: "assistant",
      content:
        "Hello there! I'm an AI assistant here to help you explore my portfolio, learn about my services, and get to know more about me and my work. Feel free to ask me any questions!",
    },
  ]);

  // Add unread messages counter
  let unreadMessages = writable(1); // Start with 1 for initial greeting

  let showPrompt = false;
  let promptInterval;

  onMount(() => {
    // Initial prompt after 5 seconds
    const initialTimeout = setTimeout(() => {
      if (!isOpen) showPrompt = true;
    }, 5000);

    // Set up interval to show prompt every minute
    promptInterval = setInterval(() => {
      if (!isOpen) showPrompt = true;
    }, 60000);

    // Cleanup on component destroy
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(promptInterval);
    };
  });

  // Hide prompt when showing chat
  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      showPrompt = false;
      unreadMessages.set(0);
    }
  }

  // Auto-hide prompt after 4 seconds when it appears
  $: if (showPrompt) {
    setTimeout(() => {
      showPrompt = false;
    }, 4000);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Get current input value
    let currentInput;
    inputStore.subscribe((value) => (currentInput = value))();

    if (!currentInput.trim() || isLoading) return;

    // Clear input immediately after getting its value
    inputStore.set("");

    // Add user message
    messages.update((msgs) => [
      ...msgs,
      { role: "user", content: currentInput.trim() },
    ]);
    isLoading = true;

    try {
      const data = await ChatAPI.sendMessage(currentInput.trim());
      console.log("Processed chat response:", data);

      // Add assistant response and increment unread if chat is closed
      messages.update((msgs) => [
        ...msgs,
        { role: "assistant", content: data.response },
      ]);

      if (!isOpen) {
        unreadMessages.update((n) => n + 1);
      }
    } catch (error) {
      console.error("Chat error:", error);
      messages.update((msgs) => [
        ...msgs,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="chat-widget">
  {#if isOpen}
    <div class="chat-window" transition:slide={{ duration: 300 }}>
      <div class="chat-header">
        <h3>Chat with me</h3>
        <button class="close-button" on:click={toggleChat}>×</button>
      </div>

      <div class="messages">
        {#each $messages as message}
          <div class="message {message.role}">
            <div class="message-content">
              {message.content}
            </div>
          </div>
        {/each}
        {#if isLoading}
          <div class="message assistant">
            <div class="message-content loading">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        {/if}
      </div>

      <form class="chat-input" on:submit={handleSubmit}>
        <input
          type="text"
          bind:value={$inputStore}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}> Send </button>
      </form>
    </div>
  {/if}

  <div class="chat-button-container">
    {#if showPrompt && !isOpen}
      <div class="chat-prompt" transition:slide={{ duration: 300 }}>
        Chat with me!
      </div>
    {/if}
    <button
      class="chat-button"
      on:click={toggleChat}
      class:open={isOpen}
      transition:fade
    >
      {#if isOpen}
        ×
      {:else}
        <span class="message-icon">💬</span>
        {#if $unreadMessages > 0}
          <span class="notification-badge">{$unreadMessages}</span>
        {/if}
      {/if}
    </button>
  </div>
</div>

<style>
  .chat-widget {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 1000;
  }

  .chat-button {
    position: relative; /* Add this for badge positioning */
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease-in-out;
  }

  .message-icon {
    transition: transform 0.2s ease-in-out;
  }

  .chat-button:hover .message-icon {
    transform: scale(1.1) rotate(-5deg);
  }

  .chat-button:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .chat-button.open {
    background: var(--text-color);
  }

  .chat-window {
    position: absolute;
    bottom: 5rem;
    right: 0;
    width: 350px;
    height: 500px;
    background: var(--text-color);
    color: white;
    border-radius: 1rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
  }

  .chat-header {
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chat-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: white;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: white;
    opacity: 0.7;
  }

  .close-button:hover {
    opacity: 1;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 80%;
  }

  .message.user {
    align-self: flex-end;
  }

  .message-content {
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .message.user .message-content {
    background: var(--accent-color);
    color: white;
  }

  .message.assistant .message-content {
    background: rgba(255, 255, 255, 0.1);
  }

  .loading span {
    animation: loading 1s infinite;
    display: inline-block;
  }

  .loading span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loading span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes loading {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }

  .chat-input {
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    gap: 0.5rem;
  }

  .chat-input input {
    flex: 1;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 2rem;
    outline: none;
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .chat-input input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .chat-input button {
    padding: 0.5rem 1rem;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 2rem;
    cursor: pointer;
  }

  .chat-input button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--accent-color);
    color: white;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    .chat-window {
      width: 100%;
      height: 100%;
      bottom: 0;
      right: 0;
      border-radius: 0;
    }

    .chat-input {
      padding: 1rem;
      padding-bottom: calc(1rem + env(safe-area-inset-bottom));
    }

    .messages {
      height: calc(100% - 120px);
      padding-bottom: 2rem;
    }
  }

  .chat-button-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .chat-prompt {
    position: absolute;
    right: calc(100% + 1rem);
    background: var(--primary-color);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    font-size: 0.9rem;
    white-space: nowrap;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .chat-prompt::after {
    content: "";
    position: absolute;
    right: -8px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 8px;
    border-style: solid;
    border-color: transparent transparent transparent var(--primary-color);
  }
</style>
