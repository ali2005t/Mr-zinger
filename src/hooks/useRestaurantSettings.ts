import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "../firebase/client";
import { subscribeToSettings, RestaurantSettings } from "../firebase/data";
import { RESTAURANT_CONFIG } from "../data/restaurantConfig";

const fallback: RestaurantSettings = {
  branches: RESTAURANT_CONFIG.branches,
  openingHours: RESTAURANT_CONFIG.openingHours,
  deliveryFee: 0,
  deliveryEnabled: true,
  pickupEnabled: true,
};

export function useRestaurantSettings() {
  const [settings, setSettings] = useState<RestaurantSettings>(fallback);
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToSettings((remote) => setSettings((current) => ({ ...current, ...remote })));
  }, []);
  return settings;
}
