import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createReview, getReviewsByProductId, deleteReview, hasUserReviewedProduct } from "@/lib/repositories";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID requerido" }, { status: 400 });
    }

    const reviews = await getReviewsByProductId(productId);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Error al obtener reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, title, content } = body;

    if (!productId || !rating) {
      return NextResponse.json({ error: "Producto y rating requeridos" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating debe ser entre 1 y 5" }, { status: 400 });
    }

    const hasReview = await hasUserReviewedProduct(productId, session.user.id);
    if (hasReview) {
      return NextResponse.json({ error: "Ya has revisado este producto" }, { status: 400 });
    }

    const reviewId = await createReview({
      productId,
      userId: session.user.id,
      rating,
      title,
      content,
    });

    return NextResponse.json({ id: reviewId }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Error al crear review" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID requerido" }, { status: 400 });
    }

    const deleted = await deleteReview(reviewId, session.user.id);

    if (!deleted) {
      return NextResponse.json({ error: "Review no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Error al eliminar review" }, { status: 500 });
  }
}