import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import RoomSidebar from "@/components/RoomPageComponent/RoomSidebar";
import RoomHeader from "@/components/RoomPageComponent/RoomHeader";
import IngredientInput from "@/components/RoomPageComponent/IngredientInput";
import IngredientList from "@/components/RoomPageComponent/IngredientList";
import RecipeDisplay from "@/components/RoomPageComponent/RecipeDisplay";

import type { RootState } from "@/store/store";
import { setRoom, setRoomReady, setUsers } from "@/store/slices/roomSlice";

import { socket } from "@/lib/socket.ts";
import { joiningRoomApi } from "@/api/room/room.api";

export default function PantryRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();

  const dispatch = useDispatch();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const users = useSelector((state: RootState) => state.room.users);

  useEffect(() => {
    // console.log("useEffect fired", { roomId, currentUser });
    const joinRoom = async () => {
      // console.log("joinRoom called", { roomId, currentUser });
      if (!roomId || !currentUser) {
        return;
      }

      try {
        const data = await joiningRoomApi(roomId);

        const room = data.data.room;
        const members = data.data.members;

        dispatch(
          setRoom({
            roomId: room.roomId,
            adminId: room.admin,
          }),
        );

        const mappedUsers =
          (members ?? []).length > 0
            ? members.map((username: string) => ({ id: username, username }))
            : [{ id: currentUser.username, username: currentUser.username }];

        dispatch(setUsers(mappedUsers));

        dispatch(setRoomReady(true));
      } catch (error) {
        console.error("Join room error:", error);
      } finally {
        // console.log("finally reached", { roomId, username: currentUser?.username });
        if (roomId && currentUser?.username) {
          // console.log("socket connected?", socket.connected); // ← add this
          // console.log("emitting join_kitchen", {
          //   roomId,
          //   username: currentUser.username,
          // });

          if (socket.connected) {
            socket.emit("join_kitchen", {
              roomId,
              username: currentUser.username,
            });
            // console.log(`user joined room ${currentUser.username}`);
          } else {
            socket.once("connect", () => {
              socket.emit("join_kitchen", {
                roomId,
                username: currentUser.username,
              });
            });
          }
        }
      }
    };

    joinRoom();
  }, [roomId, currentUser, dispatch]);

  useEffect(() => {
    const handleOnlineUsers = (users: string[]) => {
      const mappedUsers = users.map((username) => ({
        id: username,
        username,
      }));

      dispatch(setUsers(mappedUsers));
    };

    socket.on("online_users", handleOnlineUsers);

    return () => {
      socket.off("online_users", handleOnlineUsers);
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(setRoomReady(false)); // cleanup
    };
  }, [dispatch]);

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      <RoomSidebar users={users} />

      <main className="flex-1 flex flex-col">
        <RoomHeader roomId={roomId} />

        <div className="flex-1 overflow-y-auto px-8 py-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <section className="max-w-xl mx-auto">
              <IngredientInput />
            </section>

            <IngredientList />

            <RecipeDisplay />
          </div>
        </div>
      </main>
    </div>
  );
}
