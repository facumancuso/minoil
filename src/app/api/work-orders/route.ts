import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WorkOrderModel from '@/models/WorkOrder';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const workOrders = await WorkOrderModel.find({});
    
    return NextResponse.json({ 
      data: workOrders.map(wo => {
        const doc = wo.toJSON ? wo.toJSON() : wo;
        return {
          ...doc,
          id: wo._id?.toString() || doc._id
        };
      })
    });
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work orders' },
      { status: 500 }
    );
  }
}
