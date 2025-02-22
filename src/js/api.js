import analytics from "../../../components/analytics.js";

export class ChatAPI {
  static async sendMessage(message) {
    try {
      // Track chat interaction with analytics
      try {
        await analytics.trackCustomEvent("chat_message_sent", {
          message_length: message.length,
        });
      } catch (analyticsError) {
        console.warn("Analytics tracking failed:", analyticsError);
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Raw server response:", data);

      if (!data.response) {
        throw new Error("Invalid response format from server");
      }

      // Parse the response, handling both string and TextContentBlock formats
      let parsedResponse = data.response;

      // If it's a string that looks like a TextContentBlock
      if (typeof data.response === "string") {
        // Check for both single and double quote variations
        const singleQuoteMatch = data.response.match(/value='([^']+)'/);
        const doubleQuoteMatch = data.response.match(/value="([^"]+)"/);

        if (singleQuoteMatch && singleQuoteMatch[1]) {
          parsedResponse = singleQuoteMatch[1];
        } else if (doubleQuoteMatch && doubleQuoteMatch[1]) {
          parsedResponse = doubleQuoteMatch[1];
        }
      }
      // If it's an array of TextContentBlocks
      else if (Array.isArray(data.response)) {
        const firstBlock = data.response[0];
        if (firstBlock && firstBlock.text && firstBlock.text.value) {
          parsedResponse = firstBlock.text.value;
        }
      }

      console.log("Parsed response:", parsedResponse);

      // Track successful response
      try {
        await analytics.trackCustomEvent("chat_response_received", {
          response_length: parsedResponse.length,
        });
      } catch (analyticsError) {
        console.warn("Analytics tracking failed:", analyticsError);
      }

      return { response: parsedResponse };
    } catch (error) {
      console.error("Chat API error:", error);
      // Track error in analytics
      try {
        await analytics.trackCustomEvent("chat_error", {
          error_message: error.message,
        });
      } catch (analyticsError) {
        console.warn("Analytics tracking failed:", analyticsError);
      }
      throw error;
    }
  }
}
