import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

interface MessageTemplates {
  instagramFirst: string;
  instagramSecond: string;
  emailFirst: { subject: string; body: string };
  emailSecond: { subject: string; body: string };
}

const llm = new ChatGroq({
  apiKey: "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",
  model: "meta-llama/llama-4-scout-17b-16e-instruct", // Updated to available model
  temperature: 0.7,
  maxRetries: 2,
  maxConcurrency: 3,
  timeout: 10000 // Added timeout
});

export async function generateMessages(
  name: string,
  instagramData: any
): Promise<MessageTemplates> {
  // Validate inputs
  if (!name || !instagramData?.latestPost) {
    console.warn('Invalid input data, using fallback messages');
    return getFallbackMessages(name, instagramData?.latestPost || 'property');
  }

  try {
    const response = await llm.invoke([
      new SystemMessage(`Generate personalized real estate messages in JSON format with these exact fields: 
      instagramFirst (string), 
      instagramSecond (string), 
      emailFirst (object with subject and body strings), 
      emailSecond (object with subject and body strings).
      
      Context:
      - Contact Name: ${name}
      - Latest Post: ${instagramData.latestPost}
      - Style: ${instagramData.style || 'not specified'}`),
      
      new HumanMessage(`Please provide the messages in perfect JSON format like this example:
      {
        "instagramFirst": "message here",
        "instagramSecond": "message here",
        "emailFirst": {
          "subject": "subject here",
          "body": "body here"
        },
        "emailSecond": {
          "subject": "subject here",
          "body": "body here"
        }
      }`)
    ]);

    const content = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
      
    return parseAIResponse(content);
  } catch (error) {
    console.error('AI generation failed:', error);
    return getFallbackMessages(name, instagramData.latestPost);
  }
}

function parseAIResponse(content: string): MessageTemplates {
  try {
    // Handle cases where content might be an object with text property
    if (typeof content !== 'string') {
      content = JSON.stringify(content);
    }

    // Extract JSON from markdown if needed
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    
    const result = JSON.parse(jsonString);
    
    // Validate the structure
    if (!result.instagramFirst || !result.emailFirst?.subject) {
      throw new Error('Missing required fields in AI response');
    }
    
    return result;
  } catch (error) {
    console.error('Failed to parse AI response:', error, 'Content:', content);
    throw new Error('Invalid AI response format');
  }
}

function getFallbackMessages(name: string, latestPost: string = 'property'): MessageTemplates {
  const propertyType = latestPost.includes('condo') ? 'condo' : 
                     latestPost.includes('house') ? 'house' : 'property';

  return {
    instagramFirst: `Hey ${name || 'there'}! I just saw your post about ${latestPost || 'your property'} - looks amazing!`,
    instagramSecond: `Hi ${name || 'there'}! Did you get a chance to check my previous message about your ${propertyType}?`,
    emailFirst: {
      subject: `Your beautiful ${propertyType}`,
      body: `Hi ${name || 'there'},\n\nI came across your ${latestPost || 'property'} and wanted to connect...`
    },
    emailSecond: {
      subject: `Following up about your ${propertyType}`,
      body: `Hi ${name || 'there'},\n\nJust checking if you saw my previous email about your ${propertyType}...`
    }
  };
}