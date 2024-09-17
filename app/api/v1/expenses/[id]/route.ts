import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../../auth/auth"; // Adjust the path as necessary

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  // Extract ID from params
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (expense) {
      return NextResponse.json(expense);
    } else {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    const errorMessage = (error as Error).message || "Error retrieving expense";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const data = await request.json();
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    const errorMessage = (error as Error).message || "Error updating expense";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    const errorMessage = (error as Error).message || "Error deleting expense";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
