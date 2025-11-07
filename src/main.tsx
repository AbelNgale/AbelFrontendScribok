// import { createRoot } from "react-dom/client";
// import App from "./App.tsx";
// import "./index.css";

// createRoot(document.getElementById("root")!).render(<App />);

// src/index.js (exemplo)

/*
O novo adiciona o <AuthProvider> que vai gerir o login/logout e tokens JWT.
O as HTMLElement é a forma correta de usar o TypeScript sem o !. 
*/



// 

// src/main.tsx
//Importa e envolve a aplicação com o provedor:
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
/*
            Explicação curta:
Mantém AuthProvider (continua a gerir o login normal/email).
Envolve tudo em GoogleOAuthProvider (para ativar login Google).
Usa StrictMode como já vinha no projeto.
Assim, ambos os logins (normal + Google) funcionam juntos.
*/
