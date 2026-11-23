import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai"
import { withRetry } from "../_shared/retry.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders, 'Access-Control-Allow-Methods': 'POST, OPTIONS' } })
  }

  try {
    const { record_id } = await req.json()
    if (!record_id) throw new Error('record_id required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const googleKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey)
    const genAI = new GoogleGenerativeAI(googleKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })

    const { data: record, error: fetchError } = await supabase
      .from('knowledge')
      .select('id, content')
      .eq('id', record_id)
      .single()

    if (fetchError || !record) throw new Error('Record not found')
    if (!record.content || !record.content.trim()) throw new Error('Empty content, nothing to embed')

    const result = await withRetry(`embedding ${record_id}`, () => model.embedContent(record.content))
    const embedding = result.embedding.values.slice(0, 768)

    const { error: updateError } = await supabase
      .from('knowledge')
      .update({ embedding })
      .eq('id', record_id)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, dims: embedding.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})