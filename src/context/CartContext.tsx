import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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
}

interface CartContextType {
  cart: CartItem[];
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

  /* -------- Load Cart On Login -------- */

  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setCart([]);
        return;
      }

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
    };

    loadCart();
  }, [user]);

  /* -------- Add -------- */

  const addToCart = async (item: CartItem) => {
    if (!user) {
      throw new Error("User must be logged in");
    }

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

    setCart((prev) => [...prev, item]);
  };

  /* -------- Remove -------- */

  const removeFromCart = async (
    serviceId: string
  ) => {
    if (!user) return;

    const itemRef = doc(
      db,
      "users",
      user.uid,
      "cart",
      serviceId
    );

    await deleteDoc(itemRef);

    setCart((prev) =>
      prev.filter(
        (item) => item.serviceId !== serviceId
      )
    );
  };

  /* -------- Clear -------- */

  const clearCart = async () => {
    if (!user) return;

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

    setCart([]);
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
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