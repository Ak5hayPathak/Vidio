import { House, UserCircle, UsersRound, History } from "lucide-react";

const youLinks = [
  {
    to: "/",
    icon: House,
    label: "Home",
    end: true,
  },

  {
    to: "/channel",
    icon: UserCircle,
    label: "Your Channel",
    end: true,
  },

  {
    to: "/subscriptions",
    icon: UsersRound,
    label: "Subscriptions",
    end: true,
  },

  {
    to: "/history",
    icon: History,
    label: "History",
    end: true,
  },
];

export { youLinks };