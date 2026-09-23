import { Check, UsersRound } from "lucide-react";

function ChannelSubscribeButton({ subscribed, loading, onSubscribe }) {
  return (
    <button
      type="button"
      onClick={onSubscribe}
      disabled={loading}
      className={`
        flex
        items-center
        justify-center
        gap-2
        rounded-xl
        px-5
        py-2.5
        text-sm
        font-semibold
        transition
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${
          subscribed
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-red-600 text-white hover:bg-red-700"
        }
      `}
    >
      {subscribed ? (
        <>
          <Check size={17} />
          Subscribed
        </>
      ) : (
        <>
          <UsersRound size={17} />
          Subscribe
        </>
      )}
    </button>
  );
}

export default ChannelSubscribeButton;
