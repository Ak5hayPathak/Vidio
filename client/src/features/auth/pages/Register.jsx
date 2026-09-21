import { Link } from "react-router-dom";

import AuthVisualPanel from "../components/AuthVisualPanel.jsx";
import RegisterForm from "../components/RegisterForm.jsx";
import AuthLogo from "../../../components/logo/AuthLogo.jsx";

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
            <AuthLogo/>
          </div>

          <RegisterForm />

          {/* Terms */}
          <p className="text-center text-xs text-gray-600 mt-8 leading-relaxed">
            By continuing, you agree to Vidio's{" "}
            <Link to="/terms" className="hover:text-gray-400 transition">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="hover:text-gray-400 transition">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
