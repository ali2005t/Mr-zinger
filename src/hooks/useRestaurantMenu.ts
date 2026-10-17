import { useEffect, useState } from "react";
import { MENU_CATEGORIES, MENU_ITEMS } from "../data/menuData";
import type { RestaurantMenu } from "../firebase/data";
import { isFirebaseConfigured } from "../firebase/client";
import { subscribeToMenu } from "../firebase/data";

const fallbackMenu: RestaurantMenu = {
  categories: MENU_CATEGORIES,
  items: MENU_ITEMS,
};

export function useRestaurantMenu() {
  const [menu, setMenu] = useState<RestaurantMenu>(fallbackMenu);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    return subscribeToMenu(
      (remoteMenu) => {
        setMenu((current) => ({ ...current, ...remoteMenu }));
      },
      (error) => console.error("تعذر تحميل قائمة Firebase:", error)
    );
  }, []);

  return menu;
}
