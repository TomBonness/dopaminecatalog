import { NextResponse } from "next/server";
import { docClient } from "@/lib/db";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

interface SyncStatsRequest {
  userId: string;
  points: number;
  dopamineCoins: number;
  ordersCompletedCount: number;
  moneySaved: number;
  impulsiveDecisionsAvoided: number;
  unlockedBadges: string[];
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const payload = body as Partial<SyncStatsRequest>;

    const {
      userId,
      points,
      dopamineCoins,
      ordersCompletedCount,
      moneySaved,
      impulsiveDecisionsAvoided,
      unlockedBadges
    } = payload;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 });
    }

    if (docClient) {
      try {
        const tableName = process.env.DYNAMODB_TABLE_NAME || "DopamineUserStats";
        await docClient.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              userId,
              points: Number(points || 0),
              dopamineCoins: Number(dopamineCoins || 0),
              ordersCompletedCount: Number(ordersCompletedCount || 0),
              moneySaved: Number(moneySaved || 0),
              impulsiveDecisionsAvoided: Number(impulsiveDecisionsAvoided || 0),
              unlockedBadges: Array.isArray(unlockedBadges) ? unlockedBadges : [],
              updatedAt: new Date().toISOString()
            }
          })
        );
        return NextResponse.json({ success: true, synced: true });
      } catch (dbErr) {
        console.error("DynamoDB error during sync:", dbErr);
        return NextResponse.json({
          success: true,
          synced: false,
          note: "DynamoDB write failed, falling back to local mode gracefully"
        });
      }
    }

    // Return 200 OK with synced: false so the app knows it runs on LocalStorage fallback
    return NextResponse.json({
      success: true,
      synced: false,
      note: "Local storage only mode (no AWS credentials configured)"
    });
  } catch (error) {
    console.error("Internal API error in /api/stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown server error"
      },
      { status: 500 }
    );
  }
}
