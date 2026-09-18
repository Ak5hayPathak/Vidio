import AuthVisualPanel from "../components/login/AuthVisualPanel.jsx";
import LoginForm from "../components/login/LoginForm.jsx";
import AuthLogo from "../components/logo/AuthLogo.jsx";

const Login = () => {
  return (
    <div className="h-screen overflow-hidden bg-[#08090b] text-white flex">
      {/* Desktop visual panel */}
      <AuthVisualPanel />

      {/* Authentication section */}
      <main className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <AuthLogo />
          </div>

          <LoginForm />
        </div>
      </main>
    </div>
  );
};

export default Login;
