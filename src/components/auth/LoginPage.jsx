// src/components/auth/LoginPage.jsx
import React from "react";
import NoneSpace from "../../routes/NoneSpace.jsx";

export default function LoginPage({ error }) {
  // For now, we simply render NoneSpace which has dev login and QR auth flows
  // In the future, this could be a dedicated login UI
  return <NoneSpace error={error} />;
}
