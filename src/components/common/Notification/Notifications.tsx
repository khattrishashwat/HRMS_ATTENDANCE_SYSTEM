import React from "react";
import {
  FiX,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiAward,
  FiFileText,
  FiBell,
} from "react-icons/fi";
import { useNotificationsContext, type NotificationItem } from "../../../hooks/useNotifications.tsx";

interface NotificationsProps {
  onClose: () => void;
}

const getEntityIcon = (entityType: string) => {
  switch (entityType?.toUpperCase()) {
    case "LEAVE":
    case "WFH":
      return <FiCalendar className="text-[#6941C6]" size={18} />;
    case "ATTENDANCE":
      return <FiClock className="text-[#3B82F6]" size={18} />;
    case "PAYROLL":
      return <FiDollarSign className="text-[#10B981]" size={18} />;
    case "TARGET":
    case "PERFORMANCE":
      return <FiTrendingUp className="text-[#3B82F6]" size={18} />;
    case "TRAINING":
      return <FiAward className="text-[#F59E0B]" size={18} />;
    case "POLICY":
      return <FiFileText className="text-[#6B7280]" size={18} />;
    default:
      return <FiBell className="text-[#6941C6]" size={18} />;
  }
};

const getEntityBgColor = (entityType: string) => {
  switch (entityType?.toUpperCase()) {
    case "LEAVE":
    case "WFH":
      return "bg-[#F4EBFF]";
    case "ATTENDANCE":
    case "TARGET":
    case "PERFORMANCE":
      return "bg-[#EFF6FF]";
    case "PAYROLL":
      return "bg-[#D1FAE5]";
    case "TRAINING":
      return "bg-[#FEF3C7]";
    case "POLICY":
      return "bg-[#F3F4F6]";
    default:
      return "bg-[#F4EBFF]";
  }
};

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const Notifications: React.FC<NotificationsProps> = ({ onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchAllNotifications,
    isViewAll,
    loadingAll,
  } = useNotificationsContext();

  return (
    <div className="w-[420px] bg-white h-full shadow-[-4px_0_15px_rgba(0,0,0,0.05)] border-l flex flex-col z-50">
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-[46px] h-[46px] bg-[#4B1B91] rounded-full flex items-center justify-center shadow-md">
            <FiBell className="text-white" size={22} />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-[20px] font-bold text-black leading-tight">Notifications</h2>
            <p className="text-sm text-gray-500">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-[#111827] rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Action Row */}
      <div className="px-6 py-4 flex justify-between border-b border-gray-100">
        <button
          onClick={markAllAsRead}
          className="text-[#6941C6] text-sm font-semibold hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-white flex flex-col">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">No notifications available.</div>
        ) : (
          notifications.map((notif: NotificationItem) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && markAsRead(notif.id)}
              className="bg-white p-5 border-b border-gray-100 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors relative"
            >
              {!notif.read && (
                <div className="absolute top-[26px] right-6 w-2 h-2 rounded-full bg-[#6941C6]"></div>
              )}

              <div
                className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${getEntityBgColor(notif.entityType)}`}
              >
                {getEntityIcon(notif.entityType)}
              </div>

              <div className="flex-1 flex flex-col pr-8">
                <h3 className="text-[14px] font-bold text-gray-900 mb-1">{notif.title}</h3>
                <p className="text-[13px] text-gray-600 mb-3 leading-relaxed">{notif.message}</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${getEntityBgColor(notif.entityType)} text-[#6941C6]`}
                  >
                    {notif.entityType
                      ? notif.entityType.charAt(0).toUpperCase() +
                        notif.entityType.slice(1).toLowerCase()
                      : "General"}
                  </span>
                  <span className="text-[11px] font-medium text-gray-400">
                    {formatTimeAgo(notif.createdDate)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Button */}
      {!isViewAll && (
        <div className="p-6 bg-white border-t">
          <button
            onClick={fetchAllNotifications}
            disabled={loadingAll}
            className="w-full py-3.5 bg-[#4B1B91] hover:bg-[#36136B] text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {loadingAll ? "Loading..." : "View All Notifications"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
