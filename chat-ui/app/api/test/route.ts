import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'API test route works!' });
}

export async function POST() {
  return NextResponse.json({ message: 'POST request received successfully' });
} 