/**
 * seed_patients.js
 * Script to batch-seed all 50 patients directly into Supabase PostgreSQL database
 * Usage: node scripts/seed_patients.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { PATIENTS_50 } = require('../src/mockPatients');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[seed_patients] Error: Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runSeed() {
  console.log(`[seed_patients] Connecting to Supabase: ${supabaseUrl}`);
  console.log(`[seed_patients] Preparing to seed ${PATIENTS_50.length} clinical patient records...`);

  const rows = PATIENTS_50.map(p => ({
    id: p.id,
    name: p.name,
    age: p.age,
    gender: p.gender,
    phone: p.phone,
    mob_no: p.mob_no,
    address: p.address,
    blood_group: p.blood_group,
    current_health_condition: p.current_health_condition,
    feedback_given_last_time: p.feedback_given_last_time,
    current_medication: p.current_medication,
    previous_medical_history: p.previous_medical_history,
    allergies: p.allergies,
    emergency_contact: p.emergency_contact,
    last_visit_date: p.last_visit_date,
    consultation_reason: p.consultation_reason,
    consultation_context: p.consultationContext,
    required_questions: p.required_questions,
    approved_guidance: p.approved_guidance
  }));

  try {
    const { data, error } = await supabase
      .from('patients')
      .upsert(rows, { onConflict: 'id' })
      .select('id, name');

    if (error) {
      if (error.code === 'PGRST205') {
        console.error(`\n[seed_patients] ERROR: Table 'public.patients' does not exist in your Supabase schema.`);
        console.error(`[seed_patients] ACTION REQUIRED:`);
        console.error(`1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ubtgoswxrkzoxhptcxpn/sql`);
        console.error(`2. Open backend/supabase_schema.sql and copy the SQL code.`);
        console.error(`3. Paste into the Supabase SQL editor and click "RUN".`);
        console.error(`4. Re-run this script: node scripts/seed_patients.js\n`);
      } else {
        console.error('[seed_patients] Supabase upsert error:', error);
      }
      return false;
    }

    console.log(`[seed_patients] SUCCESS! Successfully seeded ${data.length} patients into Supabase public.patients table!`);
    data.slice(0, 5).forEach((p, idx) => console.log(`   ${idx + 1}. [${p.id}] ${p.name}`));
    console.log(`   ... and ${data.length - 5} more patients.`);
    return true;
  } catch (err) {
    console.error('[seed_patients] Exception while seeding:', err.message);
    return false;
  }
}

if (require.main === module) {
  runSeed().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runSeed };
