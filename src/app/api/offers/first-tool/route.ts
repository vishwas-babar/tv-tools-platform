import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  FIRST_TOOL_OFFER_PRICE,
  isEligibleForFirstToolOffer,
} from "@/lib/first-purchase";

// GET /api/offers/first-tool — whether the current user can claim the ₹9 first-tool offer
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        data: { eligible: false, price: FIRST_TOOL_OFFER_PRICE },
      });
    }

    const eligible = await isEligibleForFirstToolOffer(session.user.id);

    return NextResponse.json({
      success: true,
      data: { eligible, price: FIRST_TOOL_OFFER_PRICE },
    });
  } catch (error) {
    console.error("First-tool offer check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check offer eligibility" },
      { status: 500 },
    );
  }
}
