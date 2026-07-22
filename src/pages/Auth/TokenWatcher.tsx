import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/index.ts";
import { GoAlertFill } from "react-icons/go";
import { performSessionLogout } from "../../utils/sessionLogout.ts";

/**
 * Warns the user when the access token has expired and forces unified logout.
 */
export default function TokenWatcher() {
  const { accessExpiresAt, accessToken } = useSelector(
    (state: RootState) => state.auth
  );
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!accessToken || !accessExpiresAt) {
      setSessionExpired(false);
      return;
    }

    const interval = setInterval(() => {
      if (new Date(accessExpiresAt).getTime() <= Date.now()) {
        setSessionExpired(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [accessExpiresAt, accessToken]);

  const handleSignInAgain = async () => {
    await performSessionLogout({ callServer: false, hardRedirect: true });
  };

  if (!sessionExpired) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#1C1E21] rounded-lg shadow-lg p-6 w-[400px] text-center">
        <div className="text-primary flex flex-row justify-center text-4xl items-center mx-auto mb-4">
          <GoAlertFill />
        </div>
        <h2 className="text-xl font-semibold mb-2">Session Expired</h2>
        <p className="text-gray-600 mb-6">
          You have been logged out due to inactivity.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleSignInAgain}
            className="bg-primary text-white px-4 py-2 rounded w-full"
          >
            Sign In Again
          </button>
        </div>
      </div>
    </div>
  );
}
