import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthContext/AuthContext.jsx";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const queryClient = new QueryClient();
const stripePromise = loadStripe(
  "pk_test_51P3ThuSIRaf8tWkGpR2imDH6yw0aAvf1Y9PAMnYToLWpQnLL9RyfqNyi72jk6qeNFRYqgmYvx64q08Z8GdSrqrbv00I6C1Qg6K"
);
const options = {
  mode: "payment",
  currency: "inr",
  amount: 1099,
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Elements stripe={stripePromise} options={options}>
          <App />
        </Elements>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
