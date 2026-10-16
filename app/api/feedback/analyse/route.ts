import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeFeedback } from "@/lib/claude";

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
    const feedbackId = body.feedbackId;

    if (
      typeof feedbackId !== "string" ||
      !feedbackId
    ) {
      return Response.json(
        {
          success: false,
          message: "Feedback ID is required.",
        },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        workspaceId: session.user.workspaceId,
      },
    });

    if (!feedback) {
      return Response.json(
        {
          success: false,
          message: "Feedback not found.",
        },
        { status: 404 }
      );
    }

    const analysis = await analyzeFeedback(
      feedback.content
    );

    await prisma.feedback.update({
      where: {
        id: feedback.id,
      },
      data: {
        sentiment: analysis.sentiment,
        category: analysis.category,
      },
    });

    for (const themeName of analysis.themes) {
      const theme = await prisma.theme.upsert({
        where: {
          workspaceId_name: {
            workspaceId: session.user.workspaceId,
            name: themeName,
          },
        },
        update: {},
        create: {
          workspaceId: session.user.workspaceId,
          name: themeName,
        },
      });

      await prisma.feedbackTheme.upsert({
        where: {
          feedbackId_themeId: {
            feedbackId: feedback.id,
            themeId: theme.id,
          },
        },
        update: {},
        create: {
          feedbackId: feedback.id,
          themeId: theme.id,
        },
      });
    }

    return Response.json({
      success: true,
      message: "Feedback analyzed successfully.",
      analysis,
    });
  } catch (error) {
    console.error(
      "Feedback analysis error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Something went wrong while analyzing feedback.",
      },
      { status: 500 }
    );
  }
}