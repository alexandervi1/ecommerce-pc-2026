"use client";

import { useState, useEffect, useCallback } from "react";
import { StarRating, StarRatingDisplay, Skeleton, Button } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  isVerified: boolean;
  createdAt: string;
  userName: string;
}

interface ReviewsSectionProps {
  productId: string;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
        if (data.length > 0) {
          const avg = data.reduce((sum: number, r: Review) => sum + r.rating, 0) / data.length;
          setAverageRating(avg);
          setTotalReviews(data.length);
        } else {
          setAverageRating(0);
          setTotalReviews(0);
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, content }),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setRating(5);
        fetchReviews();
      } else {
        const data = await res.json();
        setError(data.error || "Error al enviar review");
      }
    } catch {
      setError("Error al enviar review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("¿Eliminar esta reseña?")) return;

    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-8">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight italic">
        Reseñas ({totalReviews})
      </h2>

      {totalReviews > 0 && (
        <div className="bg-white/2 border border-white/5 backdrop-blur-2xl rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-muted mb-1.5">Calificación promedio</p>
            <StarRatingDisplay rating={averageRating} count={totalReviews} />
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-white italic">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-muted font-medium"> / 5.0</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass bg-white/2 border border-white/10 rounded-3xl p-6 lg:p-8 mb-12 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <h3 className="font-bold text-white tracking-tight text-xl mb-6 italic uppercase">
          Escribir una reseña
        </h3>
        
        {error && (
          <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2.5">
            Calificación
          </label>
          <StarRating rating={rating} interactive onChange={setRating} size="lg" />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            Título (opcional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-medium"
            placeholder="Resumen de tu experiencia"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            Tu reseña
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none font-medium"
            placeholder="Comparte tu experiencia con este producto..."
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          isLoading={submitting}
          className="font-black tracking-widest text-xs py-3 px-8 rounded-xl"
        >
          Enviar Reseña
        </Button>
      </form>

      <div className="space-y-8">
        {reviews.length === 0 ? (
          <p className="text-muted text-center py-12 font-medium bg-white/2 border border-white/5 rounded-3xl">
            Aún no hay reseñas. ¡Sé el primero en opinar!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-white/5 pb-8 last:border-b-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.title && (
                    <h4 className="font-bold text-white mt-3 italic uppercase text-lg">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-xs text-muted mt-1 font-semibold">
                    {review.userName} • {formatDateTime(new Date(review.createdAt))}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all duration-200 active:scale-95"
                  title="Eliminar"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
              
              {review.content && (
                <p className="text-gray-300 mt-4 text-sm leading-relaxed font-medium">
                  {review.content}
                </p>
              )}
              
              {review.isVerified && (
                <span className="inline-flex items-center gap-1 mt-4 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 uppercase tracking-widest">
                  Compra verificada
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}