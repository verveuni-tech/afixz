import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

interface CartItem {
  serviceId: string;
  title: string;
  price: number;
  slug: string;
  locationId?: string | null;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (serviceId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(
  null
);

export const CartProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* =============================
     LOAD CART WHEN USER CHANGES
  ============================== */

  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setCart([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const cartRef = collection(
          db,
          "users",
          user.uid,
          "cart"
        );

        const snapshot = await getDocs(cartRef);

        const items = snapshot.docs.map(
          (doc) => doc.data() as CartItem
        );

        setCart(items);
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  /* =============================
     ADD TO CART (Optimistic)
  ============================== */

  const addToCart = async (item: CartItem) => {
    if (!user) {
      throw new Error("User must be logged in");
    }

    const exists = cart.some(
      (c) => c.serviceId === item.serviceId
    );

    if (exists) return;

    // Optimistic update
    setCart((prev) => [...prev, item]);

    try {
      const itemRef = doc(
        db,
        "users",
        user.uid,
        "cart",
        item.serviceId
      );

      await setDoc(itemRef, {
        ...item,
        addedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Add to cart failed:", error);

      // Rollback
      setCart((prev) =>
        prev.filter(
          (c) => c.serviceId !== item.serviceId
        )
      );
    }
  };

  /* =============================
     REMOVE (Optimistic)
  ============================== */

  const removeFromCart = async (
    serviceId: string
  ) => {
    if (!user) return;

    const previousCart = cart;

    // Optimistic
    setCart((prev) =>
      prev.filter(
        (item) => item.serviceId !== serviceId
      )
    );

    try {
      const itemRef = doc(
        db,
        "users",
        user.uid,
        "cart",
        serviceId
      );

      await deleteDoc(itemRef);
    } catch (error) {
      console.error("Remove failed:", error);

      // Rollback
      setCart(previousCart);
    }
  };

  /* =============================
     CLEAR CART
  ============================== */

  const clearCart = async () => {
    if (!user) return;

    const previousCart = cart;

    setCart([]);

    try {
      const cartRef = collection(
        db,
        "users",
        user.uid,
        "cart"
      );

      const snapshot = await getDocs(cartRef);

      const deletes = snapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletes);
    } catch (error) {
      console.error("Clear failed:", error);
      setCart(previousCart);
    }
  };

  /* =============================
     MEMOIZED TOTAL
  ============================== */

  const totalPrice = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.price,
      0
    );
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }
  return context;
};
