import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Buffer } from "buffer"; // 💡 Added Buffer import for robustness

// Define the runtime environment if you are not using the default Node.js runtime
// export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    // Ensure the key 'file' matches the name attribute in your frontend form
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Convert File to base64 string
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const client = new OpenAI({ apiKey: process.env.NEXT_OPENAI_API_KEY });

    const prompt = `
You are an expert data extraction assistant. Analyze the uploaded invoice image and extract all relevant information.
Return ONLY a single, valid JSON object that strictly conforms to the InvoiceData interface.

JSON Structure to follow:
{
  "invoiceNumber": "string | empty string",
  "invoiceDate": "YYYY-MM-DD | empty string",
  "dueDate": "YYYY-MM-DD | empty string",
  "vendorName": "string | empty string",
  "vendorEmail": "string | empty string",
  "vendorAddress": "string | empty string",
  "billToName": "string | empty string",
  "billToAddress": "string | empty string",
  "items": [
    {
      "description": "string | empty string",
      "quantity": "number | 0",
      "unitPrice": "number | 0",
      "amount": "number | 0"
    }
  ],
  "subtotal": "number | 0",
  "tax": "number | 0",
  "total": "number | 0"
}

If any field is missing or cannot be found, use an empty string ("") for text fields and 0 for number fields. Do NOT include any explanations or markdown formatting like \`\`\`json.
`;
    // 2. Use the correct method: client.chat.completions.create
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      // ADD THIS LINE: Explicitly force the model to return a JSON object
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            // Text part of the prompt
            // 💡 Update the prompt to include the structure
            {
              type: "text",
              text:
                prompt +
                `\n\nReturn the data in the following JSON structure: { "invoiceNumber": "...", "items": [{ "description": "...", "quantity": 0, "unitPrice": 0, "amount": 0 }], "subtotal": 0, "total": 0, ... }`,
            },
            // Image part of the content
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 1024,
    });

    const output = response.choices[0].message.content || "";

    const jsonMatch = output.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Model did not return valid JSON", raw: output },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(output);

    return NextResponse.json(parsed);
  } catch (err: any) {
    // 💡 Logging the full error might help debugging
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
