import { ChefHat, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function RoomHeader({ roomId }: { roomId: string | undefined }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-border">
          <ChefHat className="text-primary h-6 w-6" />
        </div>

        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-tight text-foreground">
            AI Kitchen Workspace
          </h1>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              Room: {roomId}
            </span>

            <Badge variant="outline" className="text-[10px]">
              Live
            </Badge>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={copyLink} className="shadow-sm">
          {copied ? (
            <Check className="mr-2 h-3.5 w-3.5" />
          ) : (
            <Share2 className="mr-2 h-3.5 w-3.5" />
          )}

          {copied ? "Link Copied" : "Invite Peer"}
        </Button>
      </div>
    </header>
  );
}
