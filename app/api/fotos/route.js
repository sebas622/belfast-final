import { getServerClient, EMPRESA_ID } from '../../../lib/supabase'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const obraId = formData.get('obraId') || 'general'
    const descripcion = formData.get('descripcion') || ''

    if (!file) return Response.json({ error: 'No se recibió archivo' }, { status: 400 })

    const sb = getServerClient()
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop()
    const path = `${EMPRESA_ID}/${obraId}/${Date.now()}.${ext}`

    const { error: uploadError } = await sb.storage
      .from('bcm-media')
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (uploadError) throw uploadError

    const { data } = sb.storage.from('bcm-media').getPublicUrl(path)

    await sb.from('fotos').insert({
      empresa_id: EMPRESA_ID,
      obra_id: obraId !== 'general' ? obraId : null,
      nombre: file.name,
      url: data.publicUrl,
      descripcion,
    })

    return Response.json({ ok: true, url: data.publicUrl })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
