"use client";
import React, { useEffect, useState } from "react";
import PaymentCard from "./PaymentCard";
import Pagination from "../../Pagination";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Payment } from "@prisma/client";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const PaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [status, setStatus] = useState<string>("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isClient, setIsClient] = useState(false); // Track if the component is mounted on the client

  useEffect(() => {
    const fetchPayments = async () => {
      setStatus("loading");
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }

        const response = await fetch("/api/v1/payments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data && Array.isArray(data.data)) {
          setPayments(data.data); // Accessing the nested data
          setStatus("idle");
          new Toastify({
            text: "Payments fetched successfully!",
            backgroundColor: "green",
            duration: 3000,
          }).showToast();
        } else {
          throw new Error("Fetched data is not in the expected format");
        }
      } catch (err) {
        setError("Failed to fetch payments");
        setStatus("failed");
        new Toastify({
          text: "Failed to fetch payments!",
          backgroundColor: "red",
          duration: 3000,
        }).showToast();
      }
    };

    fetchPayments();
  }, []);

  useEffect(() => {
    // Set isClient to true when the component is mounted on the client
    setIsClient(true);
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (column: keyof Payment) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    // Sort logic based on column and order
  };

  // Ensure payments is always an array
  const filteredPayments = Array.isArray(payments)
    ? payments
        .filter((payment: Payment) =>
          payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) =>
          sortOrder === "asc"
            ? a.paymentId.localeCompare(b.paymentId)
            : b.paymentId.localeCompare(a.paymentId)
        )
    : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Payment_Id", "Amount", "Status"]],
      body: payments.map((payment: Payment) => [
        payment.paymentId,
        payment.amountPaid,
        payment.active,
      ]),
    });
    doc.save("payments.pdf");
  };

  const exportToExcel = () => {
    const csvData = payments.map((payment: Payment) => ({
      Payment_Id: payment.paymentId,
      Amount: payment.amountPaid,
      Status: payment.active,
    }));

    const csvRows = [
      Object.keys(csvData[0]).join(","), // headers
      ...csvData.map((row) => Object.values(row).join(",")), // rows
    ];

    const csvBlob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(csvBlob, "payments.csv");
  };

  const onEdit = (id: number) => {
    // Handle edit logic
  };

  const onDelete = (id: number) => {
    // Handle delete logic
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border rounded"
        />
        <div className="flex space-x-2">
          {isClient && (
            <CSVLink
              data={payments}
              filename={"payments.csv"}
              className="btn btn-primary"
            >
              Export to CSV
            </CSVLink>
          )}
          <button onClick={exportToPDF} className="btn btn-primary">
            Export to PDF
          </button>
          <button onClick={exportToExcel} className="btn btn-primary">
            Export to Excel
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentPayments.map((payment: Payment) => (
          <PaymentCard
            key={payment.id}
            payment={payment}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={filteredPayments.length}
        currentPage={currentPage}
        paginate={(pageNumber: number) => setCurrentPage(pageNumber)}
      />
    </div>
  );
};

export default PaymentList;
