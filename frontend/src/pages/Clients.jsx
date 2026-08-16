import { useState } from "react";

import ClientForm from "../components/clients/ClientForm";

const EMPTY_CLIENT = {
  id: "",
  name: "",
  taxId: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
};

export default function Clients() {
  const [client, setClient] =
    useState(EMPTY_CLIENT);

  const handleChange = (e) => {
    setClient((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Cliente preparado:", client);

    setClient(EMPTY_CLIENT);
  };

  return (
    <div className="container-fluid p-4">

      <h2 className="fw-bold mb-4">
        Clientes
      </h2>

      <ClientForm
        client={client}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

    </div>
  );
}