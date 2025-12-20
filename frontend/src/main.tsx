import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="438912551996-vjltqbp5r0mdeqr2qm3vci34qsm2030h.apps.googleusercontent.com">
          <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
