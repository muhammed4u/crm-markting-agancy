import { CrmService } from '@/services/crm.service';
import { handleApiRequest } from '@/utils/api-helper';

export async function GET(request: Request) {
  return handleApiRequest(
    request,
    async (session) => {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status') || undefined;
      const source = searchParams.get('source') || undefined;
      const assignedTo = searchParams.get('assignedTo') || undefined;
      const search = searchParams.get('search') || undefined;
      const page = Number(searchParams.get('page')) || 1;
      const limit = Number(searchParams.get('limit')) || 10;

      return CrmService.getLeads({ status, source, assignedTo, search, page, limit }, session!.user);
    },
    { allowedRoles: ['ADMIN', 'SALES', 'INSTRUCTOR'] }
  );
}

export async function POST(request: Request) {
  return handleApiRequest(
    request,
    async (session, body) => {
      if (!body) throw new Error('Request body is missing');
      return CrmService.createLead(body, session!.user);
    },
    { allowedRoles: ['ADMIN', 'SALES'] }
  );
}
