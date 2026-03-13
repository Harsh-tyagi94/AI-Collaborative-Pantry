import LoginUserForm from "@/components/AuthPageComponent/LoginUserForm";

const LoginPage = () => {
  return (
    <div className="h-screen flex items-center justify-center px-4 bg-[#0b0b0f] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute pointer-events-none w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full top-[-150px]" />

      <div className="relative w-full max-w-md md:max-w-lg">
        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-500">
            PantryAI
          </h1>

          <p className="text-gray-400 mt-1 text-sm">
            Your Collaborative AI Kitchen
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111115] border border-[#1f1f25] rounded-2xl p-5 md:p-6 shadow-2xl shadow-indigo-900/30">
          <h2 className="text-white text-lg font-semibold mb-4 text-center">
            Welcome Back
          </h2>

          <LoginUserForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
