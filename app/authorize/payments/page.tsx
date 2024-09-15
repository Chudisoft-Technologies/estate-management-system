"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments } from "../../store/paymentSlice"; // Ensure you have this slice
import { AppDispatch, RootState } from "../../store";
import PaymentCard from "./PaymentCard"; // Ensure you have this component
import Pagination from "../../Pagination";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Payment } from "@prisma/client";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const PaymentList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { payments, status, error } = useSelector(
    (state: RootState) => state.payments
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (column: keyof (typeof payments)[0]) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    // Sort logic based on column and order
  };

  const filteredPayments = payments
    .filter((payment: Payment) =>
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.paymentId.localeCompare(b.paymentId)
        : b.paymentId.localeCompare(a.paymentId)
    );

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
          <CSVLink
            data={payments}
            filename={"payments.csv"}
            className="btn btn-primary"
          >
            Export to CSV
          </CSVLink>
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
