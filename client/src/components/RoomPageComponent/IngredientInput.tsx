import { useState } from "react";
import { useParams } from "react-router-dom";

import { ShoppingBasket, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { IngredientInputSchema } from "@/schemas/ingredient.schema";

import { toast } from "sonner";
import { addIngredient } from "@/api/room/room.api";

export default function IngredientInput() {
  const { roomId } = useParams();

  const [ingredient, setIngredient] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddIngredient = async () => {
    const result = IngredientInputSchema.safeParse({
      ingredient: ingredient,
    });

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    try {
      if (!roomId) return;
      setLoading(true);

      await addIngredient(roomId, ingredient);

      setIngredient("");

      toast.success("Ingredient added to pantry");
    } catch (error: any) {
      toast.error(error.message || "Failed to add ingredient");
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddIngredient();
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <ShoppingBasket className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold tracking-tight">
            Add Ingredients
          </h3>
        </div>

        {/* Input Area */}
        <div className="flex gap-2 p-2 rounded-xl border bg-muted/40">
          <Input
            placeholder="Search your pantry..."
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            onKeyDown={handleEnter}
            className="border-none bg-transparent focus-visible:ring-0"
          />

          <Button size="sm" onClick={handleAddIngredient} disabled={loading}>
            <Plus className="h-4 w-4 mr-1" />
            {loading ? "Adding..." : "Add"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
