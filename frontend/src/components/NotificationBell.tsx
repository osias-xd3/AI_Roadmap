"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, X } from "lucide-react";
import { NotificationItem } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import {
  fetchNotifications,
  markNotificationAsRead,
  triggerCertWatchdog,
} from "../lib/api";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export const NotificationBell: React.FC = () => {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch / Subscribe to notifications
  useEffect(() => {
    let unsubscribeFirestore = () => {};

    try {
      const q = query(
        collection(db, "notifications"),
        orderBy("created_at", "desc"),
        limit(20)
      );

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items: NotificationItem[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title || "Certification Alert",
                message: data.message || "",
                status_type: data.status_type || "VERIFIED",
                read: data.read ?? false,
                created_at: data.created_at || new Date().toISOString(),
              };
            });
            setNotifications(items);
          } else {
            // Initial fetch fallback
            fetchNotifications().then(setNotifications).catch(() => {});
          }
        },
        (error) => {
          console.warn("Firestore snapshot failed, falling back to API:", error);
          fetchNotifications().then(setNotifications).catch(() => {});
        }
      );
    } catch {
      fetchNotifications().then(setNotifications).catch(() => {});
    }

    return () => unsubscribeFirestore();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    const token = await getToken();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (token) {
      await markNotificationAsRead(token, id).catch(console.error);
    }
  };

  const handleMarkAllRead = async () => {
    const token = await getToken();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (token) {
      for (const n of notifications.filter((item) => !item.read)) {
        markNotificationAsRead(token, n.id).catch(console.error);
      }
    }
  };

  const handleRunWatchdog = async () => {
    setIsVerifying(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await triggerCertWatchdog(token);
      if (res.notifications && res.notifications.length > 0) {
        setNotifications((prev) => [...res.notifications, ...prev]);
      }
    } catch (err) {
      console.error("Watchdog trigger failed:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const renderBadge = (statusType: NotificationItem["status_type"]) => {
    switch (statusType) {
      case "NEW_CERT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3 h-3" /> New 100% Free Cert
          </span>
        );
      case "DISBANDED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" /> Paywalled / Retired
          </span>
        );
      case "VERIFIED":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <CheckCircle2 className="w-3 h-3" /> 100% Free Verified
          </span>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Certification Alerts"
        className="relative p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-white/[0.08] hover:border-white/15 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95"
      >
        <Bell className="w-4 h-4 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-950/95 border border-white/[0.1] shadow-2xl shadow-black/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-slate-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Watchdog Alerts</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunWatchdog}
                disabled={isVerifying}
                title="Run Live Google Search Grounding Check"
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 rounded-lg transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isVerifying ? "animate-spin" : ""}`} />
                {isVerifying ? "Auditing..." : "Audit"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader action */}
          {unreadCount > 0 && (
            <div className="flex justify-between items-center px-4 py-1.5 bg-slate-800/40 border-b border-slate-800 text-[11px] text-slate-400">
              <span>{unreadCount} unread update{unreadCount > 1 ? "s" : ""}</span>
              <button
                onClick={handleMarkAllRead}
                className="text-blue-400 hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400/60 mb-2" />
                No alerts right now. All 17 certifications are up to date.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id)}
                  className={`p-4 transition-colors cursor-pointer hover:bg-slate-800/50 ${
                    !item.read ? "bg-slate-800/20 border-l-2 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    {renderBadge(item.status_type)}
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-1 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
