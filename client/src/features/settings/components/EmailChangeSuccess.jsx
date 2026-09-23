import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

function EmailChangeSuccess() {
  return (
    <div className="text-center">
      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          bg-red-600/10
          text-red-500
        "
      >
        <Mail size={26} />
      </div>

      <div className="mt-5">
        <h1 className="text-xl font-semibold">Check your email</h1>

        <p className="mt-2 text-sm leading-6 text-gray-400">
          We've sent a verification link to your new email address.
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Your email address won't change until you verify the link.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          The verification link expires in 30 minutes.
        </p>
      </div>

      <Link
        to="/settings"
        className="
          mt-6
          block
          w-full
          rounded-lg
          bg-red-600
          px-4
          py-3
          text-center
          text-sm
          font-medium
          text-white
          transition
          hover:bg-red-700
        "
      >
        Back to Settings
      </Link>
    </div>
  );
}

export default EmailChangeSuccess;
