import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useParams, useSearchParams } from "react-router-dom";
import StatusMessage from "../Alert/StatusMessage";
import { useMutation } from "@tanstack/react-query";
import { createStripePaymentIntentAPI } from "../../apis/stripePayment/stripePayment";

const CheckoutForm = () => {
  const params = useParams();
  console.log("Params:", params);
  const plan = params.plan;
  const [searchParams] = useSearchParams();
  console.log("SearchParams:", searchParams);
  const amount = searchParams.get("amount");
  console.log("Amount:", amount);

  // State for address details
  const [address, setAddress] = useState({
    line1: "",
    postal_code: "",
    city: "",
    state: "",
    country: "",
  });

  // Stripe config
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const mutation = useMutation({
    mutationFn: createStripePaymentIntentAPI,
  });

  // Handle change in address fields
  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (elements === null) {
      return;
    }

    try {
      // Preparing data for payment
      const data = {
        amount,
        plan,
        address,
      };

      // Call elements.submit() before making any asynchronous work
      const { error: submitError } = await elements.submit();
      if (submitError) {
        return;
      }

      // Making the HTTP request
      mutation.mutate(data);

      if (mutation?.isSuccess) {
        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret: mutation?.data?.clientSecret,
          confirmParams: {
            return_url: "http://localhost:5173/success",
          },
        });
        if (error) {
          setErrorMessage(error?.message);
        }
      }
    } catch (error) {
      setErrorMessage(error?.message);
    }
  };

  return (
    <div className="bg-gray-900 h-screen -mt-4 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="w-96 mx-auto my-4 p-6 bg-white rounded-lg shadow-md"
      >
        {/* Address fields */}
        <input
          type="text"
          name="line1"
          value={address.line1}
          onChange={handleChange}
          placeholder="Address Line 1"
          className="w-full py-2 px-4 border border-gray-300 rounded-md mb-2"
        />
        <input
          type="text"
          name="postal_code"
          value={address.postal_code}
          onChange={handleChange}
          placeholder="Postal Code"
          className="w-full py-2 px-4 border border-gray-300 rounded-md mb-2"
        />
        <input
          type="text"
          name="city"
          value={address.city}
          onChange={handleChange}
          placeholder="City"
          className="w-full py-2 px-4 border border-gray-300 rounded-md mb-2"
        />
        <input
          type="text"
          name="state"
          value={address.state}
          onChange={handleChange}
          placeholder="State"
          className="w-full py-2 px-4 border border-gray-300 rounded-md mb-2"
        />
        <input
          type="text"
          name="country"
          value={address.country}
          onChange={handleChange}
          placeholder="Country"
          className="w-full py-2 px-4 border border-gray-300 rounded-md mb-4"
        />

        <div className="mb-4">
          <PaymentElement />
        </div>

        {/* Display loading */}
        {mutation?.isPending && (
          <StatusMessage type="loading" message="Processing please wait..." />
        )}

        {/* Display error message */}
        {mutation?.isError && (
          <StatusMessage
            type="error"
            message={mutation?.error?.response?.data?.error}
          />
        )}

        {/* Pay button */}
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Pay
        </button>

        {/* Display error message */}
        {errorMessage && (
          <div className="text-red-500 mt-4">{errorMessage}</div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;
