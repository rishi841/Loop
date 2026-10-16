import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import { z } from "zod";

const csvRowSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Feedback content is required")
    .max(5000, "Feedback is too long"),

  customerName: z
    .string()
    .trim()
    .max(100, "Customer name is too long")
    .optional()
    .or(z.literal("")),

  customerEmail: z
    .string()
    .trim()
    .email("Invalid customer email")
    .optional()
    .or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    // 1. Check authentication
    const session = await auth();

    if (!session?.user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // 2. Get uploaded file
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        {
          success: false,
          message: "CSV file is required",
        },
        { status: 400 }
      );
    }

    // 3. Check file type
    if (
      !file.name.toLowerCase().endsWith(".csv") &&
      file.type !== "text/csv"
    ) {
      return Response.json(
        {
          success: false,
          message: "Please upload a CSV file",
        },
        { status: 400 }
      );
    }

    // 4. Read CSV contents
    const csvText = await file.text();

    if (!csvText.trim()) {
      return Response.json(
        {
          success: false,
          message: "CSV file is empty",
        },
        { status: 400 }
      );
    }

    // 5. Parse CSV
    const rows = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!rows.length) {
      return Response.json(
        {
          success: false,
          message: "CSV contains no data rows",
        },
        { status: 400 }
      );
    }

    // 6. Validate every row
    const validatedRows = [];

    for (let index = 0; index < rows.length; index++) {
      const result = csvRowSchema.safeParse(rows[index]);

      if (!result.success) {
        return Response.json(
          {
            success: false,
            message: `Invalid data in CSV row ${index + 2}`,
            errors: result.error.flatten(),
          },
          { status: 400 }
        );
      }

      validatedRows.push(result.data);
    }

    // 7. Create feedback records
    const feedbackData = validatedRows.map((row) => ({
      content: row.content,
      source: "CSV" as const,
      customerName: row.customerName || null,
      customerEmail: row.customerEmail || null,
      workspaceId: session.user.workspaceId,
    }));

    const result = await prisma.feedback.createMany({
      data: feedbackData,
    });

    return Response.json(
      {
        success: true,
        message: "CSV imported successfully",
        importedCount: result.count,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CSV import error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong while importing the CSV",
      },
      { status: 500 }
    );
  }
}