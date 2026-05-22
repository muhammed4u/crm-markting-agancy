import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await AuthService.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve the 10 most recent activity logs in the CRM system
    const activities = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    const notifications = activities.map((act) => {
      let title = 'System Update';
      let type = 'info';

      if (act.action.includes('LEAD')) {
        title = 'Lead Pipeline Update';
        type = 'success';
      } else if (act.action.includes('PAYMENT')) {
        title = 'Billing Notification';
        type = 'info';
      } else if (act.action.includes('COURSE') || act.action.includes('LECTURE')) {
        title = 'Curriculum Update';
        type = 'warning';
      } else if (act.action.includes('TASK')) {
        title = 'Task Assignment';
        type = 'info';
      }

      return {
        id: act.id,
        title,
        message: `${act.details} (${act.user?.name || 'System'})`,
        type,
        createdAt: act.createdAt,
        read: false,
      };
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
