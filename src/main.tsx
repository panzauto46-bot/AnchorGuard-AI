import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { WalletContextProvider } from "./context/WalletContextProvider";

// Import Solana styles globally
import "@solana/wallet-adapter-react-ui/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WalletContextProvider>
      <App />
    </WalletContextProvider>
  </StrictMode>
);
