import { Users, LogOut, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { clearRoom } from "@/store/slices/roomSlice";
import { socket } from "@/lib/socket";

interface User {
  id: string;
  username: string;
}

export default function RoomSidebar({ users }: { users: User[] }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const adminId = useSelector((state: RootState) => state.room.adminId);
  const roomId = useSelector((state: RootState) => state.room.roomId);

  const handleLeaveRoom = () => {
    if (roomId && currentUser?.username) {
      socket.emit(
        "leave_kitchen",
        { roomId, username: currentUser.username },
        () => {
          // this runs only after server confirms it processed the leave
          dispatch(clearRoom());
          navigate("/dashboard");
        },
      );
    } else {
      // no socket state to clean, just leave
      dispatch(clearRoom());
      navigate("/dashboard");
    }
  };

  return (
    <aside className="w-72 h-full p-4 border-r border-border bg-background">
      <Card className="h-full flex flex-col">
        {/* HEADER */}
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center justify-between text-sm font-semibold">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Participants
            </span>

            <Badge variant="secondary">{users.length}</Badge>
          </CardTitle>
        </CardHeader>

        {/* USER LIST */}
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full px-3 py-3">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No participants yet
              </p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => {
                  const isCurrentUser = currentUser?.username === user.username;

                  const isAdmin = adminId === user.username;

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-2 rounded-lg border transition
                        ${
                          isCurrentUser
                            ? "bg-primary/10 border-primary/20"
                            : "border-transparent hover:bg-muted"
                        }`}
                    >
                      {/* Avatar */}
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-semibold">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Username */}
                      <div className="flex flex-col text-sm">
                        <span className="font-medium flex items-center gap-2">
                          {user.username}

                          {isCurrentUser && (
                            <span className="text-xs text-primary">(You)</span>
                          )}

                          {isAdmin && (
                            <Badge
                              variant="outline"
                              className="text-xs flex items-center gap-1"
                            >
                              <Crown className="h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                        </span>
                      </div>

                      {/* Online indicator */}
                      <span className="ml-auto h-2 w-2 rounded-full bg-green-500" />
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLeaveRoom}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Leave Room
          </Button>
        </CardFooter>
      </Card>
    </aside>
  );
}
