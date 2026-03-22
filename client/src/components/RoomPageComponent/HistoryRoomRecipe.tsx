import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { getSavedRecipesApi } from "@/api/recipe/recipe.api";
import { deleteRoomApi } from "@/api/room/room.api";

import type { RootState } from "@/store/store";

type Recipe = {
  id: string;
  recipe: string;
  ingredients: string[];
  createdAt: string;
};

export default function RoomRecipePage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const adminId = useSelector((state: RootState) => state.room.adminId);

  console.log("currentUser:", currentUser);
  console.log("adminId:", adminId);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchRecipes = async (pageNumber = 1) => {
    try {
      if (!roomId) return;

      setLoading(true);

      const data = await getSavedRecipesApi(roomId, pageNumber, 5);

      const normalized = (data.data.recipes || []).map((r: any) => ({
        id: r._id,
        recipe: r.recipeText,
        ingredients: r.ingredients,
        createdAt: r.createdAt,
      }));

      if (pageNumber === 1) {
        setRecipes(normalized);
      } else {
        setRecipes((prev) => [...prev, ...normalized]);
      }

      if (normalized.length < 5) {
        setHasMore(false);
      }

      setPage(pageNumber);
    } catch (err: any) {
      if (err.status === 401) {
        toast.error("Session expired");
        navigate("/login");
        return;
      }

      toast.error(err.message || "Failed to fetch recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(1);
  }, [roomId]);

  const handleScroll = (e: any) => {
    const { scrollTop } = e.target;

    if (scrollTop === 0 && hasMore && !loading) {
      fetchRecipes(page + 1);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);

      await deleteRoomApi(roomId);

      toast.success("Room deleted successfully");

      navigate("/dashboard");
    } catch (err: any) {
      if (err.status === 401) {
        toast.error("Session expired");
        navigate("/login");
        return;
      }

      if (err.status === 403) {
        toast.error("Only admin can delete this room");
        return;
      }

      toast.error(err.message || "Failed to delete room");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/room/gethistory")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <h1 className="text-xl font-semibold">Recipe History</h1>
      </div>

      {/* RECIPES LIST */}
      <div
        className="max-h-[70vh] overflow-y-auto space-y-4"
        onScroll={handleScroll}
      >
        {recipes.length === 0 && !loading ? (
          <p className="text-muted-foreground text-sm italic">
            No saved recipes yet.
          </p>
        ) : (
          recipes.map((item, index) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-sm flex justify-between">
                  Recipe #{recipes.length - index}
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </CardTitle>
              </CardHeader>

              <Separator />

              <CardContent className="p-4 space-y-3">
                {/* INGREDIENTS */}
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map((ing, i) => (
                    <Badge key={i}>{ing}</Badge>
                  ))}
                </div>

                {/* RECIPE */}
                <p className="text-sm whitespace-pre-line">{item.recipe}</p>
              </CardContent>
            </Card>
          ))
        )}

        {/* LOADER */}
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-5 w-5" />
          </div>
        )}

        {/* END MESSAGE */}
        {!hasMore && recipes.length > 0 && (
          <p className="text-center text-xs text-muted-foreground py-2">
            No more recipes
          </p>
        )}
      </div>

      {currentUser?._id === adminId && (
        <div className="pt-4 flex justify-end">
          <Button
            variant="destructive"
            onClick={handleDeleteRoom}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Room"}
          </Button>
        </div>
      )}
    </div>
  );
}
