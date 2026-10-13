import {
  House,
  UserCircle,
  UsersRound,
  History,
  Heart,
  Clock,
  Video,
  ListVideo,
  Mail,
} from "lucide-react";

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

const videosLinks = [
  {
    to: "/your-videos",
    icon: Video,
    label: "Your Videos",
    end: true,
  },
  {
    to: "/liked-videos",
    icon: Heart,
    label: "Liked Videos",
    end: true,
  },
  {
    to: "/watch-later",
    icon: Clock,
    label: "Watch Later",
    end: true,
  },
];

const playlistsLinks = [
  {
    to: "/playlists",
    icon: ListVideo,
    label: "Playlists",
    end: true,
  },
  {
    to: "/playlist-invitations",
    icon: Mail,
    label: "Playlist Invitations",
    end: true,
  },
];

export { youLinks, videosLinks, playlistsLinks };
