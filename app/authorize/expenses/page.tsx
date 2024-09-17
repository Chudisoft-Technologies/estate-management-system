"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import ExpenseCard from "./ExpenseCard";
import Pagination from "../../Pagination";
import dynamic from "next/dynamic";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { useRouter } from "next/navigation";
import Link from "next/link";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const CSVLink = dynamic(() => import("react-csv").then((mod) => mod.CSVLink), {
  ssr: false,
});

const ExpenseList: React.FC = () => {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      setStatus("loading");
      try {
        const response = await axios.get("/api/v1/expenses");
        // Access the array of expenses from response.data.data
        const expensesData = response.data.data;
        if (Array.isArray(expensesData)) {
          setExpenses(expensesData);
          setCsvData(expensesData);
          setStatus("succeeded");
        } else {
          throw new Error("Data is not an array");
        }
      } catch (err) {
        setError((err as Error).message || "Failed to fetch expenses");
        new Toastify({
          text: error,
          duration: 3000,
          backgroundColor: "#FF4D4D",
          stopOnFocus: true,
        }).showToast();
        setStatus("failed");
      }
    };

    fetchExpenses();
  }, [error]);

  useEffect(() => {
    if (status === "succeeded" && !isMounted) {
      setIsMounted(true);
    }
  }, [status, isMounted]);

  const handleSort = (key: string) => {
    const sortedExpenses = [...expenses].sort((a, b) => {
      if (a[key as keyof typeof a] < b[key as keyof typeof b])
        return sortOrder === "asc" ? -1 : 1;
      if (a[key as keyof typeof a] > b[key as keyof typeof b])
        return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    setExpenses(sortedExpenses);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Expenses Report", 14, 16);
    doc.autoTable({
      head: [["ID", "Name", "Amount", "Category"]],
      body: expenses.map((exp) => [exp.id, exp.name, exp.amount, exp.category]),
    });
    doc.save("expenses-report.pdf");
  };

  const handleExportToCSV = () => {
    const data = expenses.map((exp) => ({
      ID: exp.id,
      Name: exp.name,
      Amount: exp.amount,
      Category: exp.category,
    }));
    setCsvData(data);
  };

  const filteredExpenses = Array.isArray(expenses)
    ? expenses.filter((expense) =>
        expense.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const indexOfLastExpense = currentPage * itemsPerPage;
  const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(
    indexOfFirstExpense,
    indexOfLastExpense
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded"
        />
        <div>
          <button
            onClick={handleExportToPDF}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Export to PDF
          </button>
          <CSVLink
            data={csvData}
            filename={"expenses.csv"}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleExportToCSV}
          >
            Export to CSV
          </CSVLink>
        </div>
      </div>
      {status === "loading" && <p>Loading...</p>}
      {status === "failed" && <p>{error}</p>}
      {status === "succeeded" && (
        <div>
          {currentExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onDelete={() => handleDelete(expense.id)} // Ensure this prop is handled properly
            />
          ))}

          <Link
            href={"/authorize/expenses/new"}
            className="  btn bg-blue-950 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Add Expenses
          </Link>

          <Pagination
            totalItems={filteredExpenses.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            paginate={handlePageChange} // Provide the paginate function here
          />
        </div>
      )}
    </div>
  );
};

const handleDelete = (id: number) => {
  // Implement delete logic
};

export default ExpenseList;
