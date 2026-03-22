import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Package } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
  addIngredient,
  removeIngredient,
  setIngredients,
} from "@/store/slices/ingredientSlice";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { getIngredientsApi, removeIngredientApi } from "@/api/room/room.api";

export default function IngredientList() {
  const dispatch = useDispatch();

  const ingredients = useSelector((state: RootState) => state.ingredient.items);
  const roomId = useSelector((state: RootState) => state.room.roomId);
  const isRoomReady = useSelector((state: RootState) => state.room.isRoomReady);

  useEffect(() => {
    const handleIngredientAdded = (data: {
      ingredient: string;
      addedBy: string;
    }) => {
      dispatch(addIngredient(data));
    };

    const handleIngredientRemoved = (data: {
      ingredient: string;
      addedBy: string;
    }) => {
      dispatch(removeIngredient(data));
    };

    socket.on("ingredient_added", handleIngredientAdded);
    socket.on("ingredient_removed", handleIngredientRemoved);

    return () => {
      socket.off("ingredient_added", handleIngredientAdded);
      socket.off("ingredient_removed", handleIngredientRemoved);
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        if (!roomId || !isRoomReady) return;

        const data = await getIngredientsApi(roomId);

        dispatch(setIngredients(data.data.ingredients));
      } catch (err: any) {
        if (err.status === 401) {
          console.error("Unauthorized - redirect if needed");
          return;
        }
        console.error("Failed to fetch ingredients:", err.message);
      }
    };

    fetchIngredients();
  }, [roomId, isRoomReady, dispatch]);

  const handleRemoveIngredient = async (ingredient: string) => {
    try {
      if (!roomId) return;

      await removeIngredientApi(roomId, ingredient);

      toast.success("Ingredient removed");
    } catch (error: any) {
      if (error.status === 401) {
        toast.error("Session expired");
        return;
      }

      toast.error(error.message || "Failed to remove ingredient");
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Package className="h-4 w-4 text-primary" />
          Pantry Inventory
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {ingredients.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No ingredients added yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ingredients.map((item) => (
              <Badge
                key={item.ingredient}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1 text-sm"
              >
                {item.ingredient}

                <span className="text-xs text-muted-foreground">
                  ({item.addedBy})
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveIngredient(item.ingredient)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
