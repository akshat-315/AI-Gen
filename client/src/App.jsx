import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from "./components/Users/Registration";
import Login from "./components/Users/Login";
import Dashboard from "./components/Users/Dashboard";
import PublicNavbar from "./components/Navbar/PublicNavbar";
import PrivateNavbar from "./components/Navbar/PrivateNavbar";
import Home from "./components/Home/Home";
import { useAuth } from "./AuthContext/AuthContext";
import AuthRoute from "./components/AuthRoute/AuthRoute";
import BlogPostAIAssistant from "./components/ContentGenration/ContentGeneration";
import FreePlanSignup from "./components/StripePayment/FreePlanSignup";
import Plans from "./components/Plans/Plans";
import PaymentSuccess from "./components/StripePayment/PaymentSuccess";
import AppFeatures from "./components/Features/Features";
import AboutUs from "./components/About/About";
import ContentGenerationHistory from "./components/ContentGenration/ContentHistory";
import CheckoutForm from "./components/StripePayment/CheckoutForm";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <BrowserRouter>
        {/* Navbar */}
        {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}
        <Routes>
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            }
          />
          <Route
            path="/generate-content"
            element={
              <AuthRoute>
                <BlogPostAIAssistant />
              </AuthRoute>
            }
          />
          <Route
            path="/history"
            element={
              <AuthRoute>
                <ContentGenerationHistory />
              </AuthRoute>
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/plans" element={<Plans />} />
          <Route
            path="/free-plan"
            element={
              <AuthRoute>
                <FreePlanSignup />
              </AuthRoute>
            }
          />
          <Route path="/checkout/:plan" element={<CheckoutForm />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/features" element={<AppFeatures />} />
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
