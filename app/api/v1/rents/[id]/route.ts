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
    const rent = await prisma.rent.findUnique({
      where: { id },
    });

    if (rent) {
      return NextResponse.json(rent);
    } else {
      return NextResponse.json({ message: "Rent not found" }, { status: 404 });
    }
  } catch (error) {
    const errorMessage = (error as Error).message || "Error retrieving rent";
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
    const updatedRent = await prisma.rent.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedRent);
  } catch (error) {
    const errorMessage = (error as Error).message || "Error updating rent";
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
    await prisma.rent.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Rent deleted successfully" });
  } catch (error) {
    const errorMessage = (error as Error).message || "Error deleting rent";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
