import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'sebas622';
const REPO_NAME = 'belfast-final';
const BRANCH = 'main';

export async function POST(request) {
    try {
        const { filePath, content, message, preview } = await request.json();

        if (!filePath || !content) {
            return NextResponse.json({ error: 'filePath y content son requeridos' }, { status: 400 });
        }

        // Si es preview, crear rama separada en vez de main
        const targetBranch = preview ? `preview/${Date.now()}` : BRANCH;

        // Si es preview, primero crear la rama
        if (preview) {
            // Obtener SHA de main
            const mainRes = await fetch(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/main`,
                { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'User-Agent': 'BelfastCM' } }
            );
            const mainData = await mainRes.json();
            const mainSha = mainData.object?.sha;

            // Crear rama preview
            await fetch(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/refs`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'BelfastCM' },
                    body: JSON.stringify({ ref: `refs/heads/${targetBranch}`, sha: mainSha })
                }
            );
        }

        // Obtener SHA del archivo actual
        const fileRes = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${targetBranch}`,
            { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'User-Agent': 'BelfastCM' } }
        );
        const fileData = await fileRes.json();
        const currentSha = fileData.sha;

        // Subir el archivo nuevo
        const updateRes = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'BelfastCM' },
                body: JSON.stringify({
                    message: message || '🤖 Actualización automática via IA',
                    content: Buffer.from(content).toString('base64'),
                    sha: currentSha,
                    branch: targetBranch
                })
            }
        );

        if (!updateRes.ok) {
            const err = await updateRes.json();
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        const previewUrl = preview
            ? `https://belfast-final-git-${targetBranch.replace('/', '-')}-sebas-5237s-projects.vercel.app`
            : 'https://belfast-final.vercel.app';

        return NextResponse.json({
            ok: true,
            branch: targetBranch,
            previewUrl,
            message: preview
                ? `Cambio en rama preview. Probalo en: ${previewUrl}`
                : 'Cambio aplicado en producción.'
        });

    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
