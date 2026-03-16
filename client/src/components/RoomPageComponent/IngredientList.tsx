import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Package } from "lucide-react";

export default function IngredientList() {
  const [ingredients, setIngredients] = useState(["Eggs", "Milk", "Honey"]);

  const removeIngredient = (item: string) => {
    setIngredients((prev) => prev.filter((i) => i !== item));
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
                key={item}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1 text-sm"
              >
                {item}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-destructive"
                  onClick={() => removeIngredient(item)}
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
