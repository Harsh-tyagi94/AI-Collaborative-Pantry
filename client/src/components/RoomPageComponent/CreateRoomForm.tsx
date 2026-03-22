import { useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Hash } from "lucide-react";
import { createRoomSchema } from "@/schemas/room.schema";
import { createRoomApi } from "@/api/room/room.api";

export default function CreateRoomForm() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setRoomName(e.target.value);
  }

  async function handleCreate() {
    if (!roomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }

    try {
      setIsLoading(true);
      const result = createRoomSchema.safeParse({ roomName });

      if (!result.success) {
        toast.error(result.error.issues[0].message);
        return;
      }

      const data = await createRoomApi(roomName)

      setRoomId(data.data.roomId);
      toast.success("Room created successfully! 🍳");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="roomName" className="text-slate-300">
            Unique Room Name
          </Label>
          <div className="relative">
            <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              id="roomName"
              placeholder="e.g. healthy-supper-club"
              value={roomName}
              onChange={handleChange}
              className="pl-10 bg-slate-950/60 border-white/10 text-white focus-visible:ring-emerald-500"
            />
          </div>
        </div>

        {roomId && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-400 mb-1">Room ID Created:</p>
            <p className="text-sm font-mono text-white select-all">{roomId}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-6">
        {!roomId ? (
          <Button
            onClick={handleCreate}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 transition-all text-white"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Creating Room..." : "Create Room"}
          </Button>
        ) : (
          <Button
            onClick={() => navigate(`/room/${roomId}`)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition-all text-white"
          >
            Enter Room
          </Button>
        )}
      </CardFooter>
    </>
  );
}
