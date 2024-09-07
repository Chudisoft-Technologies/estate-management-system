import { Payment } from "@prisma/client";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Existing async thunks
export const fetchPayments = createAsyncThunk(
  "payment/fetchPayments",
  async () => {
    const response = await axios.get("/api/v1/payments");
    return response.data;
  }
);

export const fetchPayment = createAsyncThunk<Payment, string>(
  "payment/fetchPayment",
  async (id: string) => {
    const response = await axios.get<Payment>(`/api/v1/payments/${id}`);
    return response.data;
  }
);

export const createPayment = createAsyncThunk(
  "payment/createPayment",
  async (paymentData) => {
    const response = await axios.post("/api/v1/payments", paymentData);
    return response.data;
  }
);

export const updatePayment = createAsyncThunk(
  "payment/updatePayment",
  async (paymentData: Payment) => {
    const { id, ...rest } = paymentData;
    const response = await axios.put(`/api/v1/payments/${id}`, rest);
    return response.data;
  }
);

// New async thunk to delete a payment
export const deletePayment = createAsyncThunk<number, number>(
  "payment/deletePayment",
  async (id: number) => {
    await axios.delete(`/api/v1/payments/${id}`);
    return id; // Return the ID of the deleted payment
  }
);

// Payment state interface
interface PaymentState {
  payments: Payment[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  status: "idle",
  error: null,
};

// Payment slice with extra reducers
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Existing cases
      .addCase(fetchPayments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.payments = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      // Add cases for deletePayment
      .addCase(deletePayment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter(
          (payment) => payment.id !== action.payload
        );
        state.status = "succeeded";
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default paymentSlice.reducer;
