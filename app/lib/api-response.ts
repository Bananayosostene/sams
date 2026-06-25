import { NextResponse } from "next/server";

export function successResponse(data: unknown, message = "Success", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, message, data: null }, { status });
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ success: false, message, data: null }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ success: false, message, data: null }, { status: 403 });
}

export function notFoundResponse(message = "Not found") {
  return NextResponse.json({ success: false, message, data: null }, { status: 404 });
}
