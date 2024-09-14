import { Expense } from "@prisma/client";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define async thunks for the expenses

export const fetchExpenses = createAsyncThunk(
  "expense/fetchExpenses",
  async () => {
    const response = await axios.get("/api/v1/expenses");
    return response.data;
  }
);

export const fetchExpense = createAsyncThunk<Expense, string>(
  "expense/fetchExpense",
  async (id: string) => {
    const response = await axios.get<Expense>(`/api/v1/expenses?id=${id}`);
    return response.data;
  }
);

export const createExpense = createAsyncThunk(
  "expense/createExpense",
  async (expenseData: Omit<Expense, "id">) => {
    const response = await axios.post("/api/v1/expenses", expenseData);
    return response.data;
  }
);

export const updateExpense = createAsyncThunk(
  "expense/updateExpense",
  async (expenseData: Expense) => {
    const { id, ...rest } = expenseData;
    const response = await axios.put(`/api/v1/expenses?id=${id}`, rest);
    return response.data;
  }
);

export const deleteExpense = createAsyncThunk<number, number>(
  "expense/deleteExpense",
  async (id: number) => {
    await axios.delete(`/api/v1/expenses?id=${id}`);
    return id;
  }
);

// Define the state interface

interface ExpenseState {
  expenses: Expense[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  status: "idle",
  error: null,
};

// Create the expense slice

const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.expenses = action.payload.data;
        state.status = "succeeded";
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      // Fetch single expense
      .addCase(fetchExpense.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchExpense.fulfilled, (state, action) => {
        const expense = action.payload;
        state.expenses = state.expenses.map((exp) =>
          exp.id === expense.id ? expense : exp
        );
        state.status = "succeeded";
      })
      .addCase(fetchExpense.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const updatedExpense = action.payload;
        state.expenses = state.expenses.map((exp) =>
          exp.id === updatedExpense.id ? updatedExpense : exp
        );
        state.status = "succeeded";
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })

      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(
          (expense) => expense.id !== action.payload
        );
        state.status = "succeeded";
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export default expenseSlice.reducer;
