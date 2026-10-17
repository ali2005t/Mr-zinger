import pizzaImg from "../assets/images/pizza_showcase_1791898602174.jpg";
import crepeSavoryImg from "../assets/images/crepe_showcase_1791898602841.jpg";
import crepeSweetImg from "../assets/images/sweet_crepe_nutella_1791903930718.jpg";
import zingerImg from "../assets/images/fried_chicken_zinger_1791898604943.jpg";
import syrianImg from "../assets/images/syrian_shawarma_wrap_1791903954900.jpg";
import hawawshiImg from "../assets/images/hawawshi_egyptian_1791903955113.jpg";
import negrescoImg from "../assets/images/pasta_white_sauce_negresco_1791903956659.jpg";
import beefImg from "../assets/images/bbq_burger_beef_1791903956680.jpg";

export function getMenuItemImage(categoryId: string, itemName?: string): string {
  const lowerName = itemName ? itemName.toLowerCase() : "";

  // Check specific keywords first
  if (lowerName.includes("حلو") || lowerName.includes("شوكولاتة") || lowerName.includes("نوتيلا") || lowerName.includes("أوريو") || lowerName.includes("موز")) {
    return crepeSweetImg;
  }
  if (lowerName.includes("برجر") || lowerName.includes("بيف") || lowerName.includes("سلامي بيف")) {
    return beefImg;
  }
  if (lowerName.includes("حواوشي")) {
    return hawawshiImg;
  }
  if (lowerName.includes("مكرونة") || lowerName.includes("نجرسكو") || lowerName.includes("وايت صوص") || lowerName.includes("بشاميل")) {
    return negrescoImg;
  }
  if (lowerName.includes("سوري") || lowerName.includes("شاورما") || lowerName.includes("كبدة")) {
    return syrianImg;
  }
  if (lowerName.includes("زنجر") || lowerName.includes("كرانشي") || lowerName.includes("فرايد") || lowerName.includes("استربس") || lowerName.includes("ناجتس") || lowerName.includes("ريزو")) {
    return zingerImg;
  }

  // Fallback by Category ID
  switch (categoryId) {
    case "pizza":
      return pizzaImg;
    case "syrian":
      return syrianImg;
    case "crepe-sweet":
      return crepeSweetImg;
    case "crepe-savory":
      return crepeSavoryImg;
    case "meals":
      return zingerImg;
    case "beef":
      return beefImg;
    case "calzone":
      return pizzaImg;
    case "white-sauce":
      return negrescoImg;
    case "fried-chicken":
      return zingerImg;
    case "manaqeesh":
      return hawawshiImg;
    case "sandwiches":
      return syrianImg;
    case "hawawshi":
      return hawawshiImg;
    case "crunchy-cheese":
      return zingerImg;
    default:
      return pizzaImg;
  }
}
