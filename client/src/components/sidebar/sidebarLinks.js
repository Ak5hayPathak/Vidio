import { House, UserCircle, UsersRound } from "lucide-react";

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
  },
  {
    to: "/subscriptions",
    icon: UsersRound,
    label: "Subscriptions",
  },
];

export { youLinks };