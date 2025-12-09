import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Buffer } from "buffer";
// Assuming InvoiceData interface is defined in a shared file like page.tsx
import { InvoiceData } from "../../page"; 

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
      // Corrected API key variable
      apiKey: process.env.NEXT_OPENAI_API_KEY, 
    });

    // Convert formData to a readable string for the prompt
    const formDataString = JSON.stringify(formData, null, 2);

    const prompt = `
You are an AI Invoice Validator. Your task is to perform a **strict validation** by comparing the user's provided form data with the actual data visible in the uploaded invoice image.

1.  **Extract** all relevant data from the invoice image.
2.  **Compare** the extracted data with the user's submitted form data (provided below).
3.  **Return ONLY a JSON object**.
4.  The JSON MUST have two top-level keys: "validationResult" and "errors".

5.  **CRUCIAL - Date Handling (Format Mismatch Fix):**
    For date fields ('invoiceDate', 'dueDate'), standardize the extracted value from the invoice to the strict **YYYY-MM-DD** format (e.g., 'January 15, 2022' MUST become '2022-01-15') before comparison.

6.  **CRUCIAL - Strict Validation Rules (FIX for Misidentified Missing Fields):**
    * **Rule A (Value Mismatch):** If a user form field has a non-empty/non-zero value, and the corresponding data is found in the invoice, but the two values **do not match**, report an error.
    * **Rule B (Required Field Missing in Form):** If a user form field is empty or zero (e.g., "" or 0) **AND** you successfully extract ANY value from the invoice that corresponds to this field (e.g., you find a Vendor Name for an empty 'vendorName' field in the form), **YOU MUST REPORT AN ERROR.** This ensures the user fills out all available data. The error message must state the missing field and the expected value from the invoice.
    * **Rule C (Invoice Data Truly Missing):** If a field (like 'Vendor Email') is **not physically present or extractable** from the invoice, **DO NOT report an error**, regardless of the user's input value.

7.  Set "validationResult" to "fail" if any data point violates Rule A or Rule B.
8.  The "errors" object should only contain fields where the user's data is incorrect (Rule A) or missing (Rule B). The value must be a descriptive error message indicating the discrepancy and the correct value from the invoice.
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