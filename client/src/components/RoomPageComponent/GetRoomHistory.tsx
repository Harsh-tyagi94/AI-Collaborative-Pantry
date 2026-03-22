import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChefHat, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getRoomHistoryApi, getRoomStateApi } from "@/api/room/room.api";
import { useDispatch } from "react-redux";
import { setRoom } from "@/store/slices/roomSlice";

type Recipe = {
  recipeText: string;
  ingredients: string[];
  createdAt: string;
};

type Room = {
  roomId: string;
  roomName: string;
  createdAt: string;
  isActive: boolean;
  latestRecipe: Recipe | null;
  recipesCount: number;
};

export default function GetRoomHistory() {
  const dispatch = useDispatch();

  const [adminRooms, setAdminRooms] = useState<Room[]>([]);
  const [memberRooms, setMemberRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getRoomHistoryApi();

        setAdminRooms(data.data.adminRooms);
        setMemberRooms(data.data.memberRooms);
      } catch (err: any) {
        if (err.status === 401) {
          toast.error("Session expired. Please login again");
          navigate("/login");
          return;
        }
        toast.error(err.message || "Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleViewRecipe = async (roomId: string) => {
    try {
      if(!roomId) return;

      const data = await getRoomStateApi(roomId)

      const room = data.data;
      if (room.isActive) {
        navigate(`/room/${roomId}`);
      } else {
        dispatch(
          setRoom({
            roomId: room.roomId,
            adminId: room.adminId,
          }),
        );
        navigate(`/room/${roomId}/recipe`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to open room");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <h1 className="text-2xl font-bold">Your Kitchen History</h1>
      </div>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Your Kitchen History</h1>
        <p className="text-muted-foreground text-sm">
          View all rooms you’ve cooked in 🍳
        </p>
      </div>

      {/* ADMIN ROOMS */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          Rooms You Created
        </h2>

        <Separator />

        {adminRooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven’t created any rooms yet.
          </p>
        ) : (
          adminRooms.map((room) => (
            <Card key={room.roomId}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {room.roomName}
                  <Badge variant="secondary">Admin</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(room.createdAt).toLocaleString()}
                </p>

                <p className="text-sm">
                  Recipes:{" "}
                  <span className="font-medium">{room.recipesCount}</span>
                </p>

                <Button size="sm" onClick={() => handleViewRecipe(room.roomId)}>
                  View Recipe
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* MEMBER ROOMS */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Rooms You Joined
        </h2>

        <Separator />

        {memberRooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven’t joined any rooms yet.
          </p>
        ) : (
          memberRooms.map((room) => (
            <Card key={room.roomId}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {room.roomName}
                  <Badge variant="outline">Member</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(room.createdAt).toLocaleString()}
                </p>

                <p className="text-sm">
                  Recipes:{" "}
                  <span className="font-medium">{room.recipesCount}</span>
                </p>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleViewRecipe(room.roomId)}
                >
                  View Recipe
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
