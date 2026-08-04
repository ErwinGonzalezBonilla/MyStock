import { createContext, useState } from "react";

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    currency: "",
    logo: null,
  });

  return (
    <CompanyContext.Provider value={{ company, setCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export default CompanyContext;