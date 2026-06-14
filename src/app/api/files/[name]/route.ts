import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/auth-server';
import { resolveUploadPath } from '@/lib/uploads';
import { jsonError, ApiError } from '@/lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ name: string }> },
) {
  try {
    await requireAuth(request);
    const { name } = await context.params;
    const filePath = resolveUploadPath(name);

    if (!filePath) {
      throw new ApiError(404, 'File tidak ditemukan');
    }

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime =
      ext === '.pdf'
        ? 'application/pdf'
        : ext === '.png'
          ? 'image/png'
          : ext === '.jpg' || ext === '.jpeg'
            ? 'image/jpeg'
            : ext === '.gif'
              ? 'image/gif'
              : ext === '.webp'
                ? 'image/webp'
                : 'application/octet-stream';

    return new Response(buffer, {
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
