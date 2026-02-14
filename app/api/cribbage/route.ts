import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const games = await prisma.cribbageGame.findMany({
      orderBy: { date: "desc" },
    });

    // Calculate stats
    const drewWins = games.filter((g) => (g.drewScore ?? 0) > (g.aliScore ?? 0)).length;
    const aliWins = games.filter((g) => (g.aliScore ?? 0) > (g.drewScore ?? 0)).length;
    const totalGames = games.length;

    // Current streak
    let currentStreak = { player: "", count: 0 };
    if (games.length > 0) {
      const firstGame = games[0];
      const streakPlayer =
        (firstGame.drewScore ?? 0) > (firstGame.aliScore ?? 0) ? "drew" : "ali";
      let count = 0;
      for (const game of games) {
        const winner = (game.drewScore ?? 0) > (game.aliScore ?? 0) ? "drew" : "ali";
        if (winner === streakPlayer) {
          count++;
        } else {
          break;
        }
      }
      currentStreak = { player: streakPlayer, count };
    }

    // Favorite coffee shop (most visited)
    const shopCounts: Record<string, number> = {};
    for (const game of games) {
      if (game.coffeeShop) {
        shopCounts[game.coffeeShop] = (shopCounts[game.coffeeShop] || 0) + 1;
      }
    }
    const favoriteShop = Object.entries(shopCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || null;

    // Average coffee ratings
    const drewRatings = games
      .filter((g) => g.drewCoffeeRating !== null)
      .map((g) => g.drewCoffeeRating!);
    const aliRatings = games
      .filter((g) => g.aliCoffeeRating !== null)
      .map((g) => g.aliCoffeeRating!);

    const avgDrewRating =
      drewRatings.length > 0
        ? drewRatings.reduce((a, b) => a + b, 0) / drewRatings.length
        : null;
    const avgAliRating =
      aliRatings.length > 0
        ? aliRatings.reduce((a, b) => a + b, 0) / aliRatings.length
        : null;

    return NextResponse.json({
      games,
      stats: {
        drewWins,
        aliWins,
        totalGames,
        drewWinPercentage:
          totalGames > 0 ? Math.round((drewWins / totalGames) * 100) : 0,
        aliWinPercentage:
          totalGames > 0 ? Math.round((aliWins / totalGames) * 100) : 0,
        currentStreak,
        favoriteShop,
        avgDrewRating: avgDrewRating ? Math.round(avgDrewRating * 10) / 10 : null,
        avgAliRating: avgAliRating ? Math.round(avgAliRating * 10) / 10 : null,
      },
    });
  } catch (error) {
    console.error("Error fetching cribbage games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const game = await prisma.cribbageGame.create({
      data: {
        date: body.date ? new Date(body.date) : new Date(),
        drewScore: body.drewScore ? parseInt(body.drewScore) : null,
        aliScore: body.aliScore ? parseInt(body.aliScore) : null,
        coffeeShop: body.coffeeShop || null,
        coffeeBuyer: body.coffeeBuyer || null,
        drewCoffeeRating: body.drewCoffeeRating
          ? parseFloat(body.drewCoffeeRating)
          : null,
        aliCoffeeRating: body.aliCoffeeRating
          ? parseFloat(body.aliCoffeeRating)
          : null,
        drewAmbianceRating: body.drewAmbianceRating
          ? parseFloat(body.drewAmbianceRating)
          : null,
        aliAmbianceRating: body.aliAmbianceRating
          ? parseFloat(body.aliAmbianceRating)
          : null,
        notes: body.notes || null,
        firstCrib: body.firstCrib || null,
      },
    });

    revalidatePath("/cribbage");

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error("Error creating cribbage game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
