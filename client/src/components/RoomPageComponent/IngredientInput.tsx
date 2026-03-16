import { ShoppingBasket, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function IngredientInput() {
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
            className="border-none bg-transparent focus-visible:ring-0"
          />

          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
