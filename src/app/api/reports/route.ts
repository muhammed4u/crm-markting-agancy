import { CrmService } from '@/services/crm.service';
import { handleApiRequest } from '@/utils/api-helper';

export async function GET(request: Request) {
  return handleApiRequest(
    request,
    async (session) => {
      return CrmService.getRevenueStats(session!.user);
    },
    { allowedRoles: ['ADMIN', 'ACCOUNTANT'] }
  );
}
