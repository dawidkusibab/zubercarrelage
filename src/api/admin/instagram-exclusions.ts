import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';

interface ExclusionRequestBody {
  action: 'exclude' | 'include' | 'verify';
  postId: string;
  password: string;
}

interface SuccessResponse {
  success: true;
  documentId?: string;
}

interface ErrorResponse {
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

const STRAPI_URL =
  process.env.GATSBY_STRAPI_URL ??
  'https://zubercarrelage-backend-production.up.railway.app';

const getStrapiToken = (): string => {
  const token = process.env.GATSBY_STRAPI_TOKEN;
  if (!token) throw new Error('Missing GATSBY_STRAPI_TOKEN environment variable');
  return token;
};

const strapiHeaders = (token: string): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export default async function handler(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse<ApiResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body as ExclusionRequestBody;
  const { action, postId, password } = body ?? {};

  // --- Password validation (server-side) ---
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
    return;
  }
  if (password !== adminPassword) {
    res.status(401).json({ error: 'Mot de passe incorrect' });
    return;
  }

  // --- Verify action: password already validated above — return success ---
  if (action === 'verify') {
    res.status(200).json({ success: true });
    return;
  }

  // --- postId validation (length + numeric format) ---
  if (!postId || typeof postId !== 'string' || postId.length > 64 || postId.trim() === '') {
    res.status(400).json({ error: 'postId manquant ou invalide' });
    return;
  }

  if (action !== 'exclude' && action !== 'include') {
    res.status(400).json({ error: 'action invalide — utiliser "exclude" ou "include"' });
    return;
  }

  // --- Strapi write ---
  try {
    const token = getStrapiToken();

    if (action === 'exclude') {
      const strapiRes = await fetch(`${STRAPI_URL}/api/instagram-excluded-posts`, {
        method: 'POST',
        headers: strapiHeaders(token),
        body: JSON.stringify({ data: { postId } }),
      });

      if (!strapiRes.ok) {
        const text = await strapiRes.text();
        throw new Error(`Strapi POST failed (${strapiRes.status}): ${text}`);
      }

      const json = (await strapiRes.json()) as { data: { documentId: string } };
      res.status(200).json({ success: true, documentId: json.data.documentId });
      return;
    }

    // action === 'include': find by postId, then DELETE by documentId
    const findRes = await fetch(
      `${STRAPI_URL}/api/instagram-excluded-posts?filters[postId][$eq]=${encodeURIComponent(postId)}`,
      { headers: strapiHeaders(token) }
    );

    if (!findRes.ok) {
      const text = await findRes.text();
      throw new Error(`Strapi GET failed (${findRes.status}): ${text}`);
    }

    const findJson = (await findRes.json()) as { data: { documentId: string }[] };
    const entry = findJson.data?.[0];

    // Not found → already included, treat as success
    if (!entry) {
      res.status(200).json({ success: true });
      return;
    }

    const deleteRes = await fetch(
      `${STRAPI_URL}/api/instagram-excluded-posts/${entry.documentId}`,
      { method: 'DELETE', headers: strapiHeaders(token) }
    );

    if (!deleteRes.ok && deleteRes.status !== 404) {
      const text = await deleteRes.text();
      throw new Error(`Strapi DELETE failed (${deleteRes.status}): ${text}`);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[API] instagram-exclusions error:', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
}
