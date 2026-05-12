import { useEffect, useRef, useState, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export interface OrderNotification {
  id: string;
  type: "online_booking";
  name: string;
  service: string;
  status: string;
  createdAt: Date;
  seen: boolean;
}

// Generate notification sound using Web Audio API — no file needed
function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Two-tone chime
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1108, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);

    // Cleanup
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Silently fail if audio not available
  }
}

export function useOrderNotifications() {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const initialLoadDone = useRef(false);
  const knownIds = useRef(new Set<string>());

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    const fiveMinAgo = Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000));

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("createdAt", ">=", fiveMinAgo),
      orderBy("createdAt", "desc")
    );

    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const isInitial = !initialLoadDone.current;
      initialLoadDone.current = true;

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && !knownIds.current.has(change.doc.id)) {
          knownIds.current.add(change.doc.id);
          const data = change.doc.data();

          const notif: OrderNotification = {
            id: change.doc.id,
            type: "online_booking",
            name: data.customerName || "Customer",
            service: data.serviceTitle || "Service",
            status: data.status || "pending",
            createdAt: data.createdAt?.toDate?.() || new Date(),
            seen: isInitial,
          };

          setNotifications((prev) => [notif, ...prev].slice(0, 50));

          if (!isInitial) {
            setUnreadCount((c) => c + 1);
            playNotificationSound();
          }
        }
      });
    });

    return () => {
      unsubBookings();
    };
  }, []);

  return { notifications, unreadCount, markAllRead };
}
