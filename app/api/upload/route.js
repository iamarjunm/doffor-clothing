import { NextResponse } from 'next/server';

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'mwmriieg';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const API_VERSION = '2024-10-01';

/**
 * POST /api/upload
 * Uploads an image file directly to Sanity's global Asset CDN (cdn.sanity.io).
 * Keeps SANITY_API_WRITE_TOKEN strictly server-side.
 */
export async function POST(req) {
  try {
    const token = (process.env.SANITY_API_WRITE_TOKEN || '').trim();
    if (!token) {
      return NextResponse.json(
        {
          error:
            'SANITY_API_WRITE_TOKEN is not set in .env.local. Create an Editor token at https://www.sanity.io/manage/project/' +
            PROJECT_ID +
            '/api#tokens',
          code: 'SANITY_TOKEN_MISSING',
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    const contentType = file.type || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image exceeds 10 MB limit.' },
        { status: 413 }
      );
    }

    const rawName = (file.name || 'doffor-asset.jpg').replace(/[^a-zA-Z0-9._-]/g, '-');
    const uploadUrl = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/assets/images/${DATASET}?filename=${encodeURIComponent(
      rawName
    )}`;

    const sanityRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        Authorization: `Bearer ${token}`,
      },
      body: Buffer.from(arrayBuffer),
    });

    const data = await sanityRes.json().catch(() => ({}));
    if (!sanityRes.ok || !data?.document?.url) {
      console.error('[Sanity Upload Error]', sanityRes.status, data);
      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.error?.description ||
            `Sanity CDN upload failed (${sanityRes.status}). Check your SANITY_API_WRITE_TOKEN permissions.`,
        },
        { status: sanityRes.status || 500 }
      );
    }

    const baseUrl = data.document.url;
    const optimizedUrl = `${baseUrl}?auto=format&fit=max&w=1400&q=85`;

    return NextResponse.json({
      url: optimizedUrl,
      rawUrl: baseUrl,
      assetId: data.document._id,
      width: data.document.metadata?.dimensions?.width || null,
      height: data.document.metadata?.dimensions?.height || null,
      cdn: 'sanity',
    });
  } catch (err) {
    console.error('[Sanity Upload Route Error]', err);
    return NextResponse.json(
      { error: err.message || 'Unexpected error uploading to Sanity CDN.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * Lists the latest uploaded image assets from Sanity CDN (mwmriieg / production).
 */
export async function GET() {
  try {
    const query = encodeURIComponent(
      '*[_type == "sanity.imageAsset"] | order(_createdAt desc)[0...30]{ _id, url, originalFilename, _createdAt }'
    );
    const url = `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${query}`;
    const res = await fetch(url, { next: { revalidate: 30 } });
    const data = await res.json().catch(() => ({ result: [] }));
    return NextResponse.json({ assets: data.result || [] });
  } catch (err) {
    return NextResponse.json({ assets: [], error: err.message }, { status: 200 });
  }
}
