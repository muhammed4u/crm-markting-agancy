import { CrmService } from '@/services/crm.service';
import { handleApiRequest } from '@/utils/api-helper';

export async function GET(request: Request) {
  return handleApiRequest(
    request,
    async (session) => {
      const { searchParams } = new URL(request.url);
      const level = searchParams.get('level') || undefined;
      const search = searchParams.get('search') || undefined;
      const page = Number(searchParams.get('page')) || 1;
      const limit = Number(searchParams.get('limit')) || 10;

      return CrmService.getStudents({ level, search, page, limit }, session!.user);
    },
    { allowedRoles: ['ADMIN', 'SALES', 'INSTRUCTOR'] }
  );
}
