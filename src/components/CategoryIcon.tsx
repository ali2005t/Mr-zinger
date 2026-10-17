import React from "react";
import {
  Pizza,
  Sandwich,
  Cake,
  UtensilsCrossed,
  CookingPot,
  Beef,
  Layers,
  Soup,
  Drumstick,
  Wheat,
  Flame,
  Sparkles,
  Utensils,
} from "lucide-react";

interface CategoryIconProps {
  categoryId: string;
  icon?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ categoryId, icon, className = "w-4 h-4" }) => {
  if (icon) return <span className={className} aria-hidden="true">{icon}</span>;
  switch (categoryId) {
    case "pizza":
      return <Pizza className={className} />;
    case "syrian":
      return <Sandwich className={className} />;
    case "crepe-sweet":
      return <Cake className={className} />;
    case "crepe-savory":
      return <UtensilsCrossed className={className} />;
    case "meals":
      return <CookingPot className={className} />;
    case "beef":
      return <Beef className={className} />;
    case "calzone":
      return <Layers className={className} />;
    case "white-sauce":
      return <Soup className={className} />;
    case "fried-chicken":
      return <Drumstick className={className} />;
    case "manaqeesh":
      return <Wheat className={className} />;
    case "sandwiches":
      return <Sandwich className={className} />;
    case "hawawshi":
      return <Flame className={className} />;
    case "crunchy-cheese":
      return <Sparkles className={className} />;
    default:
      return <Utensils className={className} />;
  }
};
