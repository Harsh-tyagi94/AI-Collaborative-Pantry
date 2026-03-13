import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CreateRoomForm from "@/components/RoomPageComponent/CreateRoomForm";
import { ArrowLeft } from "lucide-react";

const CreateRoomPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center px-4 bg-[#0b0b0f] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute pointer-events-none w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full bottom-[-150px] right-[-100px]" />

      <div className="relative w-full max-w-md">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-slate-400 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <span className="text-xs font-medium uppercase tracking-widest text-emerald-500">
            New Workspace
          </span>
        </div>

        <div className="bg-[#111115] border border-[#1f1f25] rounded-2xl p-6 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-white text-xl font-bold">Start a Room</h2>
            <p className="text-slate-400 text-sm mt-1">
              Invite others to add ingredients and cook together.
            </p>
          </div>

          <CreateRoomForm />
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage;
