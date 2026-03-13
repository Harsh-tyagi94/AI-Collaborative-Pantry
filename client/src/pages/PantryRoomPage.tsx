import { useParams } from "react-router-dom";
import { useState } from "react";

interface User {
  id: string;
  name: string;
}

const PantryRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const [users, setUsers] = useState<User[]>([]);

  const copyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Invite link copied!");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Room ID: {roomId}
        </h1>

        <button
          onClick={copyInvite}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Copy Invite Link
        </button>
      </div>

      <div className="flex flex-1">

        {/* Participants */}
        <div className="w-64 bg-white border-r p-4">
          <h2 className="font-semibold mb-3">Participants</h2>

          {users.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No users yet
            </p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="mb-2">
                {user.name}
              </div>
            ))
          )}
        </div>

        {/* Main Room Area */}
        <div className="flex-1 p-6">

          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h2 className="text-lg font-semibold mb-4">
              Room Workspace
            </h2>

            <p className="text-gray-600">
              This is where your collaborative content will appear.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PantryRoomPage;