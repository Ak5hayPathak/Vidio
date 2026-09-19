import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Lock, Bell, Shield, Palette, LogOut } from "lucide-react";

import SettingItem from "../components/settings/SettingItem.jsx";
import Toggle from "../components/settings/Toggle.jsx";
import LogoutConfirm from "../components/logout/LogoutConfirm.jsx";

import api from "../services/api.js";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");

      setLogoutOpen(false);
      navigate("/login");
    } catch (error) {
      console.error(
        "Logout failed:",
        error.response?.data?.message || error.message,
      );
    }
  };

  return (
    <main className="min-w-0 flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Settings</h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage your account and application preferences
          </p>
        </div>

        <div className="mt-8 space-y-8">
          {/* Account */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Account
            </h2>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111318]">
              <Link to="/settings/account/change-email">
                <SettingItem
                  icon={User}
                  title="Account details"
                  description="Update your email and profile information"
                  showArrow
                />
              </Link>

              <Link to="/settings/account/change-password">
                <SettingItem
                  icon={Lock}
                  title="Password"
                  description="Change your account password"
                  showArrow
                />
              </Link>

              <SettingItem
                icon={Shield}
                title="Privacy & security"
                description="Manage your privacy and security preferences"
                showArrow
                border={false}
                disabled
              />
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Notifications
            </h2>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111318]">
              <SettingItem
                icon={Bell}
                title="Push notifications"
                description="Receive notifications about activity on your account"
                action={
                  <Toggle enabled={notifications} onChange={setNotifications} />
                }
                disabled
              />

              <SettingItem
                icon={Bell}
                title="Email notifications"
                description="Receive important updates and activity by email"
                border={false}
                action={
                  <Toggle
                    enabled={emailNotifications}
                    onChange={setEmailNotifications}
                  />
                }
                disabled
              />
            </div>
          </section>

          {/* Playback */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Playback
            </h2>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111318]">
              <SettingItem
                icon={Palette}
                title="Autoplay"
                description="Automatically play the next recommended video"
                border={false}
                action={<Toggle enabled={autoplay} onChange={setAutoplay} />}
                disabled
              />
            </div>
          </section>

          {/* Appearance */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Appearance
            </h2>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111318]">
              <SettingItem
                icon={Palette}
                title="Theme"
                description="Choose how Vidio looks"
                border={false}
                action={
                  <select
                    defaultValue="dark"
                    className="
                      shrink-0
                      rounded-lg
                      border
                      border-white/10
                      bg-[#08090b]
                      px-3
                      py-2
                      text-sm
                      text-white
                      outline-none
                      focus:border-red-600
                    "
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                }
                disabled
              />
            </div>
          </section>

          {/* Account Actions */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Account actions
            </h2>

            <div className="rounded-2xl border border-red-600/20 bg-[#111318] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium text-white">Sign out</h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Sign out of your Vidio account on this device
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setLogoutOpen(true)}
                  className="
    flex
    shrink-0
    items-center
    justify-center
    gap-2
    rounded-lg
    border
    border-white/10
    bg-[#08090b]
    px-4
    py-2
    text-sm
    font-medium
    text-gray-300
    transition
    hover:border-red-600/30
    hover:bg-red-600/10
    hover:text-red-500
  "
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          </section>

          {logoutOpen && (
            <LogoutConfirm
              onCancel={() => setLogoutOpen(false)}
              onConfirm={handleLogout}
              text="Sign out"
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default Settings;
