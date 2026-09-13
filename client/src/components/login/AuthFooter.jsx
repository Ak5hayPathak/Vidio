import { Link } from "react-router-dom";

const AuthFooter = () => {
  return (
    <>
      {/* Register */}
      <p className="text-center text-sm text-gray-500 mt-8">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-white hover:text-red-400 font-medium transition"
        >
          Create one
        </Link>
      </p>

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
    </>
  );
};

export default AuthFooter;
