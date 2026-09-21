import { Link } from "react-router-dom";

function ChannelLoggedOut() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#08090b] px-6 text-center text-white">
      <div>
        <h1 className="text-xl font-semibold">
          Please log in to view your channel.
        </h1>

        <Link
          to="/login"
          className="
            mt-5
            inline-block
            rounded-xl
            bg-red-600
            px-5
            py-2.5
            text-sm
            font-semibold
            transition
            hover:bg-red-700
          "
        >
          Log In
        </Link>
      </div>
    </div>
  );
}

export default ChannelLoggedOut;