import { useCallback } from "react";

import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../utils/money";

// Formatea importes con la moneda de la empresa actual: 1.234,56 €.
// Acepta las mismas opciones que formatMoney ({ decimals }).
export function useMoney() {
  const { company } = useAuth();
  const currency = company?.currency;

  return useCallback(
    (value, options) => formatMoney(value, currency, options),
    [currency]
  );
}
