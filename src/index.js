import html from '../static/index.html';
export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === 'GET' && url.pathname === '/') {
            return new Response(html, {
                headers: { 'Content-Type': 'text/html' },
            });
        } else if (request.method === 'POST' && url.pathname === '/brat') {
            const { textInput } = await request.json();
			console.log(`textInput ${textInput}`);
            const answer = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
				messages: [
                    {
                        "role": "system",
                        "content": `"Brat Summer" is a term that gained popularity in online culture, especially among fans of Charli XCX. It encapsulates a specific vibe and attitude characterized by embracing a carefree and slightly rebellious spirit, often doing things spontaneously and with a sense of playful defiance. It involves fully embracing one's individuality and expressing oneself through fashion, music, and activities without worrying about societal norms or judgments. It also means making the most out of summer by engaging in bold, adventurous activities, and creating memorable experiences. Ultimately, "Brat Summer" is about feeling empowered and confident, taking charge of one's own happiness, and enjoying life to the fullest in a fun, bold, and unapologetically self-expressive way. You are a Gen Z leader who speaks as a Gen Z brat girl would.`
                    },
                    {
					"role": "user",
					"content": `The user describes their summer as being like the following: ${textInput}. Is this a brat summer? If it is not, tell them how to have a brat summer and do not mention anything else.`
				}],
			});
            console.log(JSON.stringify(answer));
            return new Response(JSON.stringify(answer), {
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response('Not found', { status: 404 });
    }
}
