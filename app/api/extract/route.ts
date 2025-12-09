import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Buffer } from "buffer";
import { InvoiceData } from "../../page"; // Assuming page.tsx defines this interface

// Define the expected structure for the response JSON
interface ValidationResponse {
  validationResult: "pass" | "fail";
  errors: Record<keyof InvoiceData | string, string>;
}

export async function POST(req: Request) {
  try {
    const { formData, imageBase64, fileType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    const dataUrl = `data:${fileType};base64,${imageBase64}`;

    const client = new OpenAI({
      apiKey: process.env.NEXT_OPENAI_API_KEY, // Make sure NOT to use NEXT_
    });

    // Convert formData to a readable string for the prompt
    const formDataString = JSON.stringify(formData, null, 2);

    const prompt = `
You are an AI Invoice Validator. Your task is to compare the user's provided form data with the actual data visible in the uploaded invoice image.

1.  **Extract** all relevant data from the invoice image.
2.  **Compare** the extracted data with the user's submitted form data (provided below).
3.  **Return ONLY a JSON object**.
4.  The JSON MUST have two top-level keys: "validationResult" and "errors".

5.  **CRUCIAL - Date Handling (Format Mismatch Fix):**
    For date fields ('invoiceDate', 'dueDate'), standardize the extracted value from the invoice to the strict **YYYY-MM-DD** format (e.g., 'January 15, 2022' MUST become '2022-01-15') **before** comparison.

6.  **CRUCIAL - Field Validation Rules (Addressing Missing Data Errors):**
    * **Case A (User Data Mismatch):** If a user form field has a non-empty/non-zero value, and the corresponding data is found in the invoice, but the two values **do not match**, report an error.
    * **Case B (User Data Missing, Invoice Data Present - e.g., Customer Name):** If a user form field is empty or zero (e.g., "" or 0), but the corresponding data **is found** in the invoice image (e.g., 'ABC Company' found for an empty 'Bill To Name'), **DO NOT report an error**. This is considered acceptable (the user is expected to fill it in later).
    * **Case C (Invoice Data Missing - e.g., Vendor Info):** If a field in the invoice is **not found** (e.g., 'Vendor Email' is not on the invoice), **DO NOT report an error**, regardless of the user's input value.

7.  Set "validationResult" to "fail" if any data point violates Case A.
8.  The "errors" object should only contain fields where the user's data is incorrect (Case A). The value must be a descriptive error message indicating the discrepancy and the correct value from the invoice.
9.  If the validationResult is "pass", the "errors" object must be empty: {}.
10. The user-submitted form data is:
${formDataString}
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const output = response.choices[0].message.content || "";

    const match = output.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json(
        { error: "Model did not return valid JSON", raw: output },
        { status: 500 }
      );
    }

    const parsed: ValidationResponse = JSON.parse(match[0]);

    if (parsed.validationResult === "fail") {
      return NextResponse.json({ errors: parsed.errors }, { status: 400 });
    }

    return NextResponse.json({ message: "Validation successful" });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: err.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}
