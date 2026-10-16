import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const feedbackSchema = z.object({
  content: z
    .string()
    .min(1, "Feedback content is required")
    .max(5000, "Feedback is too long"),

  source: z.enum(["MANUAL", "CSV", "API"]),

  customerName: z
    .string()
    .max(100, "Customer name is too long")
    .optional(),

  customerEmail: z
    .string()
    .email("Invalid customer email")
    .optional(),
});

/*
 * GET /api/feedback
 *
 * Returns feedback belonging only to
 * the currently logged-in user's workspace.
 */
export async function GET(request: Request) {
  try {
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

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";

    const feedback = await prisma.feedback.findMany({
      where: {
        workspaceId: session.user.workspaceId,

        ...(search
          ? {
              OR: [
                {
                  content: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  customerName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  customerEmail: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("Get feedback error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong while fetching feedback",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const body = await request.json();

    const result = feedbackSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          message: "Invalid feedback data",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      content,
      source,
      customerName,
      customerEmail,
    } = result.data;

    const feedback = await prisma.feedback.create({
      data: {
        content,
        source,
        customerName,
        customerEmail,
        workspaceId: session.user.workspaceId,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Feedback created successfully",
        feedback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create feedback error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong while creating feedback",
      },
      { status: 500 }
    );
  }
}