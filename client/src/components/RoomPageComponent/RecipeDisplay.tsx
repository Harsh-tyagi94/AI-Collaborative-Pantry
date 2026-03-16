import { Sparkles, ChefHat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function RecipeDisplay() {
  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <div className="flex justify-center">
        <Button size="lg" className="rounded-full px-10 shadow-lg">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Recipe
        </Button>
      </div>

      {/* AI Recipe Card */}
      <Card className="min-h-[300px] shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            Gemini Kitchen Intelligence
          </CardTitle>

          <ChefHat className="h-5 w-5 text-primary" />
        </CardHeader>

        <Separator />

        <CardContent className="flex items-center justify-center p-12 text-center">
          <p className="text-sm text-muted-foreground italic">
            Add ingredients to unlock AI suggestions...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
