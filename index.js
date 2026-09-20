export default {
  async fetch(request) {
    return new Response(
      'Cloudflare Email Worker is running. Configure Email Routing to forward messages.',
      { headers: { 'content-type': 'text/plain; charset=utf-8' } }
    );
  },

  async email(message, env) {
    const url = env.WEBHOOK_URL;
    const secret = env.WEBHOOK_SECRET || '';

    if (!url) {
      console.error('WEBHOOK_URL is not configured');
      return;
    }

    const rawEmail = await new Response(message.raw).text();
    const payload = {
      to: message.to,
      from: message.from,
      raw: rawEmail,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(secret ? { 'X-Secret': secret } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('Failed to forward email:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to reach webhook:', error);
    }
  },
};
