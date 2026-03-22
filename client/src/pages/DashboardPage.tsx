import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { LogOut, User, Plus, Users, History } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import type { RootState } from "@/store/store";
import { logoutUserApi } from "@/api/auth/auth.api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [roomId, setRoomId] = useState<string>("");

  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await logoutUserApi();

      dispatch(logout());

      toast.success("Logged out successfully");

      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
    }
  };

  const handleJoinRoom = (): void => {
    if (!roomId.trim()) {
      toast.error("Enter Room ID");
      return;
    }

    navigate(`/room/${roomId}`);
  };

  const handleHistory = (): void => {
    navigate("/room/gethistory");
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      {/* Navbar */}
      <div className="border-b border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold">PantryAI Dashboard</h1>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-slate-300 hover:text-white"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Page Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* User Info */}
        <Card className="mb-8 border-white/10 bg-slate-900/60">
          <CardHeader className="flex flex-row items-center gap-3">
            <User className="text-indigo-400" />
            <CardTitle>User Information</CardTitle>
          </CardHeader>

          <CardContent className="text-slate-300">
            Logged in as{" "}
            <span className="font-semibold">{user?.username || "User"}</span>
          </CardContent>
        </Card>

        {/* Dashboard Features */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Create Room */}
          <Card className="border-white/10 bg-slate-900/60 transition hover:bg-slate-900">
            <CardHeader className="flex flex-row items-center gap-3">
              <Plus className="text-green-400" />
              <CardTitle>Create Room</CardTitle>
            </CardHeader>

            <CardContent>
              <Button
                onClick={() => navigate("/create-room")}
                className="w-full bg-green-600 hover:bg-green-500"
              >
                Create New Room
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card className="border-white/10 bg-slate-900/60 transition hover:bg-slate-900">
            <CardHeader className="flex flex-row items-center gap-3">
              <Users className="text-indigo-400" />
              <CardTitle>Join Room</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <Input
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="bg-slate-950 border-white/10 text-white"
              />

              <Button
                onClick={handleJoinRoom}
                className="w-full bg-indigo-600 hover:bg-indigo-500"
              >
                Join Room
              </Button>
            </CardContent>
          </Card>

          {/* Room History */}
          <Card className="border-white/10 bg-slate-900/60 transition hover:bg-slate-900">
            <CardHeader className="flex flex-row items-center gap-3">
              <History className="text-purple-400" />
              <CardTitle>Room History</CardTitle>
            </CardHeader>

            <CardContent>
              <Button
                onClick={handleHistory}
                className="w-full bg-purple-600 hover:bg-purple-500"
              >
                View Past Rooms
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
