import { Link } from "react-router-dom";

import AuthVisualPanel from "../components/login/AuthVisualPanel.jsx";
import RegisterForm from "../components/register/registerForm.jsx";

const Register = () => {
  return (
    <div className="h-screen overflow-hidden bg-[#08090b] text-white flex">
      {/* Desktop visual panel */}
      <AuthVisualPanel />

      {/* Authentication section */}
      <main className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.18-6.86a1 1 0 0 0 0-1.66L9.53 4.29A1 1 0 0 0 8 5.14Z" />
                </svg>
              </div>

              <span className="text-2xl font-bold">
                Vidio
              </span>
            </Link>
          </div>

          <RegisterForm/>
        </div>
      </main>
    </div>
  );
};

export default Register;