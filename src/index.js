import html from '../static/index.html';
import { runWithTools } from "@cloudflare/ai-utils";
export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === 'GET' && url.pathname === '/') {
            return new Response(html, {
                headers: { 'Content-Type': 'text/html' },
            });
        } else if (request.method === 'POST' && url.pathname === '/brat') {
            const { summerTextInput } = await request.json();
			console.log(`summerTextInput hurr ${summerTextInput}`);
            const response = await runWithTools(env.AI, "@cf/meta/llama-3.1-8b-instruct", {
                messages: [
                    {
                        "role": "system",
                        "content": `"Brat Summer" is a term that gained popularity in online culture, especially among fans of Charli XCX. It encapsulates a specific vibe and attitude characterized by embracing a carefree and slightly rebellious spirit, often doing things spontaneously and with a sense of playful defiance. It involves fully embracing one's individuality and expressing oneself through fashion, music, and activities without worrying about societal norms or judgments. It also means making the most out of summer by engaging in bold, adventurous activities, and creating memorable experiences. Ultimately, "Brat Summer" is about feeling empowered and confident, taking charge of one's own happiness, and enjoying life to the fullest in a fun, bold, and unapologetically self-expressive way. You are a Gen Z leader who speaks as a Gen Z brat girl would.`
                    },
                    {
					"role": "user",
					"content": `The user describes their summer as the following: ${summerTextInput}. Is this a brat summer? If it is not, tell them how to have a brat summer and do not mention anything else.`
				}],
                stream: true,
                tools: [
                    {
                    name: "Translate",
                    description: `If the user mentions a foreign country, translate your response determining if they are having a brat summer and how they could have more of a brat summer into the primary language spoken in that country. Remember,"Brat Summer" is a term that gained popularity in online culture, especially among fans of Charli XCX. It encapsulates a specific vibe and attitude characterized by embracing a carefree and slightly rebellious spirit, often doing things spontaneously and with a sense of playful defiance. It involves fully embracing one's individuality and expressing oneself through fashion, music, and activities without worrying about societal norms or judgments. It also means making the most out of summer by engaging in bold, adventurous activities, and creating memorable experiences. Ultimately, "Brat Summer" is about feeling empowered and confident, taking charge of one's own happiness, and enjoying life to the fullest in a fun, bold, and unapologetically self-expressive way. You are a Gen Z leader who speaks as a Gen Z brat girl would.`,
                    parameters: {
                        type: "object",
                        properties: {
                            text: {
                                type: "string",
                                description: "The text to translate.",
                            },
                            targetLang: {
                                type: "string",
                                description: "The language to translate the text into.",
                            },
                        },
                        required: ["text", "targetLang"],
                    },
                    function: async (text, targetLang ) => {
                        const input = {
                            "text": text,
                            "source_lang": "english",
                            "target_lang": targetLang
                        };
                        const translation = await env.AI.run(
                            "@cf/meta/m2m100-1.2b",
                            input
                          );
                        console.log(`response ${JSON.stringify(translation)}`);
                        return new Response(JSON.stringify(translation), {
                            headers: { 'Content-Type': 'application/json' },
                        });
                    }
                },
                {
                    name: "DuckDuckGo",
                    description: `Use this function if there is a person you do not know`,
                    parameters: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "The person that you want to learn more about",
                            }
                        },
                        required: ["name"],
                    },
                    function: async (name) => {
                        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(name)}&format=json`);
                        console.log(`duckduckgo response ${response}`);
                        const data = await response.json();
                        if (data.AbstractText) {
                            return new Response(JSON.stringify(data.AbstractText), {
                                headers: { 'Content-Type': 'application/json' },
                            });
                        } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                            return new Response(JSON.stringify(data.RelatedTopics[0].Text), {
                                headers: { 'Content-Type': 'application/json' },
                            });
                        }
                        return "No relevant information found.";
    
                    }
                }
            ],
            })
            return new Response(JSON.stringify(response), {
                headers: { 'Content-Type': 'application/json' },
            })
        }   
        return new Response('Not found', { status: 404 });
    }
}
