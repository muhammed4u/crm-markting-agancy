import { CrmService } from '@/services/crm.service';
import { handleApiRequest } from '@/utils/api-helper';

export async function GET(request: Request) {
  return handleApiRequest(request, async (session) => {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;

    if (!session?.user) {
      throw new Error('Unauthorized: Please log in.');
    }

    return CrmService.getCourses({ search }, session.user);
  });
}

export async function POST(request: Request) {
  return handleApiRequest(
    request,
    async (session, body) => {
      if (!body) throw new Error('Request body is missing');
      return CrmService.createCourse(body, session!.user);
    },
    { allowedRoles: ['ADMIN', 'INSTRUCTOR'] }
  );
}
