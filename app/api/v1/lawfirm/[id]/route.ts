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
    const lawfirm = await prisma.lawFirm.findUnique({
      where: { id },
    });

    if (lawfirm) {
      return NextResponse.json(lawfirm);
    } else {
      return NextResponse.json(
        { message: "Lawfirm not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    const errorMessage = (error as Error).message || "Error retrieving lawfirm";
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
    const updatedLawfirm = await prisma.lawFirm.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedLawfirm);
  } catch (error) {
    const errorMessage = (error as Error).message || "Error updating lawfirm";
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
    await prisma.lawFirm.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Lawfirm deleted successfully" });
  } catch (error) {
    const errorMessage = (error as Error).message || "Error deleting lawfirm";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
