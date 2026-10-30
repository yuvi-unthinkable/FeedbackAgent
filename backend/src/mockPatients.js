/**
 * mockPatients.js
 * Comprehensive dataset of 50 clinically realistic patient records.
 * Includes complete demographics, current health conditions, prior feedback,
 * active medications, previous medical history, emergency contacts, and Maya clinical prompts.
 */

const PATIENTS_50 = [
  {
    id: "pat_001",
    name: "Naman Pilania",
    age: 24,
    gender: "Male",
    phone: "+919140511451",
    mob_no: "+919140511451",
    address: "Flat 402, Royal Palm Residency, Bandra West, Mumbai, MH 400050",
    blood_group: "B+",
    current_health_condition: "Post-Discharge Chronic Fatigue & Dehydration Recovery",
    feedback_given_last_time: "Maintain oral hydration with at least 3 liters of fluids daily, take multivitamins post breakfast, avoid strenuous gym training for 5 days, report persistent dizziness immediately.",
    current_medication: [
      { name: "Oral Rehydration Salts (ORS)", dosage: "1 sachet in 1L water", frequency: "Daily morning" },
      { name: "Becosules Multivitamin + Zinc", dosage: "1 capsule", frequency: "OD after breakfast" },
      { name: "Paracetamol 650mg", dosage: "1 tablet", frequency: "SOS for body ache (max 3/day)" }
    ],
    previous_medical_history: [
      "Acute viral gastroenteritis (Discharged Oct 2026)",
      "No prior surgical interventions",
      "No history of cardiac, renal, or endocrine disorders"
    ],
    allergies: ["No known drug allergies (NKDA)"],
    emergency_contact: {
      name: "Pooja Pilania",
      relation: "Family",
      phone: "+919876543210"
    },
    last_visit_date: "2026-10-28",
    consultation_reason: "Post-Discharge Fatigue & Recovery Check-in",
    consultationContext: "Patient was discharged today following treatment for acute dehydration and fatigue. Assess energy recovery, fluid intake adherence, and absence of dizziness.",
    required_questions: [
      "How is your energy level feeling right now compared to when you were discharged?",
      "Have you been able to take your prescribed fluids and vitamin capsules today?",
      "Are you experiencing any lightheadedness, nausea, or headache?"
    ],
    approved_guidance: [
      "Continue regular fluid and electrolyte intake throughout the afternoon.",
      "Get ample physical rest and avoid lifting or intense exertion today.",
      "If severe weakness or lightheadedness returns, contact the care team immediately."
    ]
  },
  {
    id: "pat_002",
    name: "Rajesh Iyer",
    age: 56,
    gender: "Male",
    phone: "+919820144321",
    mob_no: "+919820144321",
    address: "B-12 Hiranandani Gardens, Powai, Mumbai, MH 400076",
    blood_group: "O+",
    current_health_condition: "Essential Hypertension (Stage 2) & Dyslipidemia",
    feedback_given_last_time: "Strictly limit dietary sodium to under 2 grams daily, take morning Telmisartan before 9 AM, log blood pressure morning and evening, walk 40 minutes daily.",
    current_medication: [
      { name: "Telmisartan 40mg + Amlodipine 5mg", dosage: "1 tablet", frequency: "OD morning" },
      { name: "Atorvastatin 20mg", dosage: "1 tablet", frequency: "OD at bedtime" },
      { name: "Ecosprin 75mg", dosage: "1 tablet", frequency: "OD post lunch" }
    ],
    previous_medical_history: [
      "Hypertension diagnosed 2019",
      "Dyslipidemia diagnosed 2021",
      "Paternal history of early coronary artery disease"
    ],
    allergies: ["ACE Inhibitors (caused dry cough)"],
    emergency_contact: {
      name: "Lakshmi Iyer",
      relation: "Spouse",
      phone: "+919820144322"
    },
    last_visit_date: "2026-10-22",
    consultation_reason: "Hypertension & Lipid Follow-up",
    consultationContext: "Checking compliance on Telmisartan-Amlodipine combination, pedal edema monitoring, and morning blood pressure trends.",
    required_questions: [
      "What was your blood pressure reading this morning?",
      "Have you noticed any ankle swelling or dizziness when standing up?",
      "Are you taking your cholesterol medication every night before bed?"
    ],
    approved_guidance: [
      "Target blood pressure is below 130/80 mmHg.",
      "Elevate legs for 20 minutes in the evening if mild ankle puffiness occurs.",
      "Report systolic BP consistently above 160 to clinic."
    ]
  },
  {
    id: "pat_003",
    name: "Priya Nair",
    age: 34,
    gender: "Female",
    phone: "+919711209845",
    mob_no: "+919711209845",
    address: "74 Indiranagar 100ft Road, Bengaluru, KA 560038",
    blood_group: "A+",
    current_health_condition: "Gestational Diabetes Mellitus (28 Weeks) & Mild Anemia",
    feedback_given_last_time: "Record 4-point glucose log (fasting and 2 hours post-meals), maintain complex carbohydrate diet, take iron tablet with vitamin C juice, avoid taking iron with dairy.",
    current_medication: [
      { name: "Insulin Aspart (Novorapid)", dosage: "4 units", frequency: "TID with major meals" },
      { name: "Ferrous Ascorbate 100mg + Folic Acid", dosage: "1 tablet", frequency: "OD mid-afternoon" },
      { name: "Calcium Carbonate 500mg + Vit D3", dosage: "1 tablet", frequency: "BD post meals" }
    ],
    previous_medical_history: [
      "Polycystic Ovarian Syndrome (PCOS)",
      "First pregnancy (Primigravida), 28 weeks gestation",
      "No history of chronic hypertension"
    ],
    allergies: ["Sulfa antibiotics"],
    emergency_contact: {
      name: "Gautam Nair",
      relation: "Spouse",
      phone: "+919711209846"
    },
    last_visit_date: "2026-10-25",
    consultation_reason: "Gestational Diabetes & Fetal Well-being Follow-up",
    consultationContext: "28-week antenatal check. Inquire about blood sugar logs, fetal movements, and tolerance to iron therapy.",
    required_questions: [
      "What was your fasting blood sugar reading this morning?",
      "Are you feeling regular fetal movements after every meal?",
      "Have you experienced any episodes of hypoglycemia like trembling or sweating?"
    ],
    approved_guidance: [
      "Target fasting glucose is strictly under 95 mg/dL; post-meal under 120 mg/dL.",
      "Always keep glucose tablets or fruit juice within reach in case of sugar drops.",
      "Do not skip snacks between main meals."
    ]
  },
  {
    id: "pat_004",
    name: "Marcus Brody",
    age: 48,
    gender: "Male",
    phone: "+15550148291",
    mob_no: "+15550148291",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
    blood_group: "O-",
    current_health_condition: "Type 2 Diabetes Mellitus & Peripheral Neuropathy",
    feedback_given_last_time: "Started on Metformin 500mg BID with meals. Check feet daily for blisters or cuts, report tingling sensations or gastrointestinal upset.",
    current_medication: [
      { name: "Metformin 500mg Extended Release", dosage: "1 tablet", frequency: "BD with meals" },
      { name: "Pregabalin 75mg", dosage: "1 capsule", frequency: "OD at bedtime" },
      { name: "Methylcobalamin 1500mcg", dosage: "1 tablet", frequency: "OD morning" }
    ],
    previous_medical_history: [
      "Type 2 Diabetes diagnosed 2020",
      "Diabetic sensory neuropathy diagnosed 2024",
      "Mild non-proliferative diabetic retinopathy"
    ],
    allergies: ["Penicillin", "Amoxicillin"],
    emergency_contact: {
      name: "Sarah Brody",
      relation: "Daughter",
      phone: "+15550148299"
    },
    last_visit_date: "2026-10-20",
    consultation_reason: "Diabetes Medication Tolerance & Foot Check",
    consultationContext: "Reviewing Metformin GI tolerance, fasting sugar numbers, and foot care compliance.",
    required_questions: [
      "Have you noticed any nausea, diarrhea, or stomach cramps with the new Metformin dose?",
      "What was your fasting glucose reading today?",
      "Did you inspect the soles of your feet today for any redness or pressure spots?"
    ],
    approved_guidance: [
      "Take Metformin halfway through your meals to avoid stomach upset.",
      "Wear seamless diabetic socks and comfortable supportive shoes.",
      "If blood sugar goes above 250 mg/dL consistently, alert your physician."
    ]
  },
  {
    id: "pat_005",
    name: "Sophia Martinez",
    age: 31,
    gender: "Female",
    phone: "+15550173620",
    mob_no: "+15550173620",
    address: "1244 Sunset Boulevard, Los Angeles, CA 90026",
    blood_group: "A-",
    current_health_condition: "Post-Operative Arthroscopic Meniscectomy (Day 6)",
    feedback_given_last_time: "Keep surgical dressing dry and clean. Ice the knee 20 minutes every 3 hours. Elevate leg above heart level when resting. Start gentle ankle pumps.",
    current_medication: [
      { name: "Ibuprofen 600mg", dosage: "1 tablet", frequency: "TID with food PRN" },
      { name: "Pantoprazole 40mg", dosage: "1 tablet", frequency: "OD before breakfast" },
      { name: "Acetaminophen 500mg", dosage: "1-2 tablets", frequency: "Q6H PRN breakthrough pain" }
    ],
    previous_medical_history: [
      "Left knee medial meniscus tear (Sports injury Aug 2026)",
      "Arthroscopic partial meniscectomy performed 6 days ago",
      "No chronic medical conditions"
    ],
    allergies: ["Codeine (severe nausea)"],
    emergency_contact: {
      name: "Elena Martinez",
      relation: "Mother",
      phone: "+15550173699"
    },
    last_visit_date: "2026-10-23",
    consultation_reason: "Post-Surgical Knee Recovery Follow-up",
    consultationContext: "Post-op day 6 check. Assess pain score (1-10), surgical site healing, and rule out deep vein thrombosis (DVT) red flags.",
    required_questions: [
      "On a scale of 1 to 10, what is your current knee pain level?",
      "Is the incision dressing clean and dry, without any oozing or redness?",
      "Are you experiencing any calf tenderness, swelling, or sudden chest pain?"
    ],
    approved_guidance: [
      "Continue cold compression 20 minutes on, 20 minutes off.",
      "Keep using your crutches when moving around to avoid premature weight loading.",
      "Physical therapy evaluation is scheduled for next Monday."
    ]
  },
  {
    id: "pat_006",
    name: "Vikram Malhotra",
    age: 62,
    gender: "Male",
    phone: "+919810234567",
    mob_no: "+919810234567",
    address: "C-45 Greater Kailash 1, New Delhi, DL 110048",
    blood_group: "AB+",
    current_health_condition: "Coronary Artery Disease (Post-PTCA Stent - Month 3)",
    feedback_given_last_time: "Do not miss dual antiplatelet therapy under any circumstance, maintain low-cholesterol diet, monitor for unexplained bruising or bleeding.",
    current_medication: [
      { name: "Ticagrelor 90mg", dosage: "1 tablet", frequency: "BD morning & evening" },
      { name: "Aspirin 75mg Gastro-resistant", dosage: "1 tablet", frequency: "OD post lunch" },
      { name: "Rosuvastatin 20mg", dosage: "1 tablet", frequency: "OD night" },
      { name: "Metoprolol Succinate 50mg", dosage: "1 tablet", frequency: "OD morning" }
    ],
    previous_medical_history: [
      "Acute anterior wall myocardial infarction with DES to LAD (July 2026)",
      "Mild left ventricular systolic dysfunction (LVEF 48%)",
      "Ex-smoker (Quit 3 months ago)"
    ],
    allergies: ["No known drug allergies (NKDA)"],
    emergency_contact: {
      name: "Rohit Malhotra",
      relation: "Son",
      phone: "+919810234568"
    },
    last_visit_date: "2026-10-18",
    consultation_reason: "Post-Cardiac Stent 3-Month Follow-up",
    consultationContext: "Assess cardiac stability, exercise tolerance, absence of angina or dyspnea on exertion, and medication compliance.",
    required_questions: [
      "Have you experienced any chest pressure, tightness, or breathlessness during your daily walks?",
      "Are you taking your blood thinner tablets on time twice every day?",
      "Have you noticed any unusual bleeding from gums or black-colored stools?"
    ],
    approved_guidance: [
      "Any chest pain radiating to the left arm or jaw requires immediate ER evaluation.",
      "Never discontinue Ticagrelor without cardiologist consultation.",
      "Maintain a 30-minute brisk walk within comfortable breathing limits."
    ]
  },
  {
    id: "pat_007",
    name: "Sunita Deshmukh",
    age: 51,
    gender: "Female",
    phone: "+919822345678",
    mob_no: "+919822345678",
    address: "Flat 301, Prabhat Road, Lane 4, Pune, MH 411004",
    blood_group: "B-",
    current_health_condition: "Hypothyroidism (Hashimoto's) & Primary Osteoarthritis",
    feedback_given_last_time: "Take Levothyroxine on an empty stomach with plain water at least 45 minutes before breakfast or tea. Perform quadriceps strengthening exercises.",
    current_medication: [
      { name: "Levothyroxine Sodium 75mcg", dosage: "1 tablet", frequency: "OD early morning empty stomach" },
      { name: "Glucosamine + Chondroitin", dosage: "1 tablet", frequency: "OD after lunch" },
      { name: "Cholecalciferol 60,000 IU", dosage: "1 sachet in milk", frequency: "Once weekly for 8 weeks" }
    ],
    previous_medical_history: [
      "Hashimoto's Thyroiditis diagnosed 2017",
      "Bilateral knee osteoarthritis (Grade 2)",
      "Total abdominal hysterectomy (2018)"
    ],
    allergies: ["Iodinated radiographic contrast"],
    emergency_contact: {
      name: "Anand Deshmukh",
      relation: "Spouse",
      phone: "+919822345679"
    },
    last_visit_date: "2026-10-14",
    consultation_reason: "Thyroid & Joint Health Review",
    consultationContext: "Inquire about morning thyroid medicine timing, knee stiffness, and cold intolerance.",
    required_questions: [
      "Are you taking your thyroid tablet first thing in the morning with plain water?",
      "How long do you wait after your tablet before drinking tea or having breakfast?",
      "Are you experiencing excessive tiredness, hair fall, or joint stiffness in the morning?"
    ],
    approved_guidance: [
      "Calcium or iron supplements must be taken at least 4 hours away from thyroid medicine.",
      "Perform gentle knee flexion exercises twice daily to preserve joint mobility.",
      "Repeat thyroid profile (TSH) is due next month."
    ]
  },
  {
    id: "pat_008",
    name: "David Miller",
    age: 59,
    gender: "Male",
    phone: "+15550183921",
    mob_no: "+15550183921",
    address: "389 Pine Crest Drive, Seattle, WA 98101",
    blood_group: "O+",
    current_health_condition: "Congestive Heart Failure (NYHA Class II) & CKD Stage 3a",
    feedback_given_last_time: "Weigh yourself every single morning after first urination. Strict fluid restriction to 1.5 liters per day. Report weight gain >2 lbs in 24 hours.",
    current_medication: [
      { name: "Sacubitril / Valsartan (Entresto) 24/26mg", dosage: "1 tablet", frequency: "BD morning & night" },
      { name: "Furosemide 40mg", dosage: "1 tablet", frequency: "OD morning" },
      { name: "Spironolactone 25mg", dosage: "1 tablet", frequency: "OD morning" },
      { name: "Empagliflozin 10mg", dosage: "1 tablet", frequency: "OD morning" }
    ],
    previous_medical_history: [
      "Ischemic cardiomyopathy (LVEF 35%)",
      "Chronic kidney disease Stage 3a (Baseline eGFR 52)",
      "Biatrial enlargement"
    ],
    allergies: ["Sulfa drugs (causes severe skin rash)"],
    emergency_contact: {
      name: "Karen Miller",
      relation: "Spouse",
      phone: "+15550183999"
    },
    last_visit_date: "2026-10-24",
    consultation_reason: "Heart Failure Vitals & Fluid Status Check",
    consultationContext: "Assess morning dry weight trend, orthopnea (sleeping on extra pillows), paroxysmal nocturnal dyspnea, and peripheral edema.",
    required_questions: [
      "What did your scale read this morning, and how does that compare to yesterday?",
      "How many pillows are you sleeping on to breathe comfortably at night?",
      "Have you noticed any swelling in your ankles or tightness in your shoes?"
    ],
    approved_guidance: [
      "A weight gain of more than 2 to 3 pounds overnight indicates fluid retention; call care team.",
      "Stay strictly within your 1.5 liter total daily fluid limit.",
      "Take your diuretic (Furosemide) in the morning to avoid waking up at night."
    ]
  },
  {
    id: "pat_009",
    name: "Kavita Patel",
    age: 28,
    gender: "Female",
    phone: "+919879123450",
    mob_no: "+919879123450",
    address: "15 Navrangpura, Near Stadium Crossroad, Ahmedabad, GJ 380009",
    blood_group: "B+",
    current_health_condition: "Persistent Bronchial Asthma & Allergic Rhinitis",
    feedback_given_last_time: "Always rinse mouth with water and spit after using Budesonide inhaler to prevent oral thrush. Keep Salbutamol inhaler with you at all times.",
    current_medication: [
      { name: "Budesonide 200mcg + Formoterol 6mcg Inhaler", dosage: "2 puffs", frequency: "BD morning and night" },
      { name: "Levocetirizine 5mg + Montelukast 10mg", dosage: "1 tablet", frequency: "OD at bedtime" },
      { name: "Salbutamol 100mcg Reliever Inhaler", dosage: "2 puffs", frequency: "SOS for sudden wheeze" }
    ],
    previous_medical_history: [
      "Childhood bronchial asthma",
      "Severe dust mite and pollen allergy",
      "No hospitalizations in the last 12 months"
    ],
    allergies: ["Aspirin & NSAIDs (induces bronchospasm)"],
    emergency_contact: {
      name: "Bhaven Patel",
      relation: "Brother",
      phone: "+919879123451"
    },
    last_visit_date: "2026-10-19",
    consultation_reason: "Asthma Control & Inhaler Technique Check",
    consultationContext: "Assess daytime wheezing, nighttime awakenings, and frequency of reliever inhaler usage in the past week.",
    required_questions: [
      "How many times in the past 7 days have you had to use your quick-relief Salbutamol inhaler?",
      "Have you been waking up in the middle of the night with chest tightness or coughing?",
      "Are you rinsing your mouth thoroughly after using your morning and evening inhaler?"
    ],
    approved_guidance: [
      "Using your rescue inhaler more than twice a week indicates uncontrolled inflammation.",
      "Rinse and gargle after steroid inhaler to prevent oral candida.",
      "Avoid exposure to burning incense, cigarette smoke, or heavy dust."
    ]
  },
  {
    id: "pat_010",
    name: "Arvind Swaminathan",
    age: 67,
    gender: "Male",
    phone: "+919444156789",
    mob_no: "+919444156789",
    address: "22 Luz Church Road, Mylapore, Chennai, TN 600004",
    blood_group: "AB-",
    current_health_condition: "Benign Prostatic Hyperplasia (BPH) & Chronic Gout",
    feedback_given_last_time: "Take Tamsulosin 30 minutes after dinner to reduce orthostatic lightheadedness. Avoid purine-rich foods (red meat, seafood) and stay well hydrated.",
    current_medication: [
      { name: "Tamsulosin 0.4mg + Dutasteride 0.5mg", dosage: "1 capsule", frequency: "OD post dinner" },
      { name: "Febuxostat 40mg", dosage: "1 tablet", frequency: "OD morning" },
      { name: "Colchicine 0.5mg", dosage: "1 tablet", frequency: "SOS for acute joint flare" }
    ],
    previous_medical_history: [
      "Recurrent gouty arthritis (Great toe & right ankle)",
      "BPH with moderate lower urinary tract symptoms",
      "Mild bilateral sensorineural hearing loss"
    ],
    allergies: ["Allopurinol (developed severe pruritic rash)"],
    emergency_contact: {
      name: "Sowmya Swaminathan",
      relation: "Daughter",
      phone: "+919444156790"
    },
    last_visit_date: "2026-10-16",
    consultation_reason: "Urinary Flow & Uric Acid Follow-up",
    consultationContext: "Assess nocturia frequency (times waking at night to urinate), urinary hesitancy, and absence of acute joint swelling.",
    required_questions: [
      "How many times per night do you currently wake up to use the bathroom?",
      "Have you noticed any joint tenderness, redness, or heat in your big toe or ankles?",
      "Are you feeling any dizziness when getting out of bed in the morning?"
    ],
    approved_guidance: [
      "Drink plenty of water during the daytime, but taper fluids after 8 PM to reduce nocturia.",
      "Take your prostate medication consistently after dinner.",
      "Avoid dehydration as it triggers acute gout crystal formation."
    ]
  },
  {
    id: "pat_011",
    name: "Meera Joshi",
    age: 44,
    gender: "Female",
    phone: "+919833456789",
    mob_no: "+919833456789",
    address: "Flat 5B, Sagar Darshan, Worli Sea Face, Mumbai, MH 400030",
    blood_group: "A+",
    current_health_condition: "Chronic Migraine with Visual Aura & Cervical Spondylosis",
    feedback_given_last_time: "Maintain a migraine trigger diary. Avoid skipping meals or disrupted sleep. Take Propranolol consistently for prophylaxis, take Zolmitriptan at earliest onset.",
    current_medication: [
      { name: "Propranolol Extended Release 40mg", dosage: "1 capsule", frequency: "OD morning" },
      { name: "Zolmitriptan 2.5mg Nasal Spray", dosage: "1 spray", frequency: "SOS at aura onset" },
      { name: "Naproxen 250mg", dosage: "1 tablet", frequency: "SOS with food for neck spasm" }
    ],
    previous_medical_history: [
      "Episodic migraine progressed to chronic (2022)",
      "Cervical disc bulge at C5-C6",
      "No hypertension or vascular malformations"
    ],
    allergies: ["Caffeine-based combinations (cause palpitations)"],
    emergency_contact: {
      name: "Sameer Joshi",
      relation: "Spouse",
      phone: "+919833456780"
    },
    last_visit_date: "2026-10-21",
    consultation_reason: "Migraine Frequency & Prophylaxis Review",
    consultationContext: "Assess number of migraine days in the past 14 days, efficacy of rescue nasal spray, and neck posture.",
    required_questions: [
      "How many headache episodes have you experienced over the last two weeks?",
      "Did you notice the flashing light aura before your last headache?",
      "Is the daily preventive tablet helping reduce the headache intensity?"
    ],
    approved_guidance: [
      "Take your rescue triptan at the first sign of aura rather than waiting for severe pain.",
      "Maintain a dark, quiet room during acute episodes.",
      "Do ergonomic neck stretches every 2 hours if working on screens."
    ]
  },
  {
    id: "pat_012",
    name: "Amit Singhania",
    age: 53,
    gender: "Male",
    phone: "+919830123456",
    mob_no: "+919830123456",
    address: "18 Ballygunge Circular Road, Kolkata, WB 700019",
    blood_group: "O+",
    current_health_condition: "Non-Alcoholic Fatty Liver Disease (Grade 2) & Metabolic Syndrome",
    feedback_given_last_time: "Gradual weight reduction target of 5-7% over 3 months. Eliminate refined sugars, fried street foods, and sweetened beverages. Daily brisk walking 45 mins.",
    current_medication: [
      { name: "Saroglitazar 4mg", dosage: "1 tablet", frequency: "OD before breakfast" },
      { name: "Vitamin E (d-alpha tocopherol) 400 IU", dosage: "1 capsule", frequency: "OD post lunch" },
      { name: "Metformin 500mg", dosage: "1 tablet", frequency: "BD with meals" }
    ],
    previous_medical_history: [
      "NAFLD diagnosed on ultrasound (2023)",
      "Elevated baseline ALT/AST enzymes",
      "Borderline fasting hyperglycemia (HbA1c 6.4%)"
    ],
    allergies: ["No known drug allergies (NKDA)"],
    emergency_contact: {
      name: "Ritu Singhania",
      relation: "Spouse",
      phone: "+919830123457"
    },
    last_visit_date: "2026-10-12",
    consultation_reason: "Liver Health & Weight Management Check",
    consultationContext: "Monitor lifestyle adherence, weight changes, upper right quadrant abdomen heaviness, and energy levels.",
    required_questions: [
      "Have you been able to incorporate the 45-minute daily brisk walking routine?",
      "Have you experienced any dull ache or discomfort under your right ribs?",
      "What changes have you made to eliminate refined sugars and sodas?"
    ],
    approved_guidance: [
      "Sustainable lifestyle and weight loss is the most effective therapy for fatty liver.",
      "Avoid over-the-counter pain relievers or unnecessary herbal supplements without doctor advice.",
      "Repeat liver function tests are due in 6 weeks."
    ]
  },
  {
    id: "pat_013",
    name: "Sneha Kulkarni",
    age: 39,
    gender: "Female",
    phone: "+919890123456",
    mob_no: "+919890123456",
    address: "Plot 18, Kothrud Dahanukar Colony, Pune, MH 411038",
    blood_group: "B+",
    current_health_condition: "Rheumatoid Arthritis (Active Seropositive) & Raynaud's Phenomenon",
    feedback_given_last_time: "Take Methotrexate strictly once weekly on the same day (Saturdays). Take Folic acid on non-methotrexate days. Keep hands warm in cold environments.",
    current_medication: [
      { name: "Methotrexate 15mg", dosage: "3 tablets of 5mg", frequency: "Once weekly on Saturday night" },
      { name: "Folic Acid 5mg", dosage: "1 tablet", frequency: "OD Sunday through Friday" },
      { name: "Hydroxychloroquine 200mg", dosage: "1 tablet", frequency: "OD with dinner" },
      { name: "Deflazacort 6mg", dosage: "1 tablet", frequency: "OD morning (tapering)" }
    ],
    previous_medical_history: [
      "Seropositive Rheumatoid Arthritis diagnosed 2021",
      "Secondary Raynaud's phenomenon in digits",
      "Mild osteopenia"
    ],
    allergies: ["Sulphasalazine (severe gastrointestinal intolerance)"],
    emergency_contact: {
      name: "Nilesh Kulkarni",
      relation: "Spouse",
      phone: "+919890123457"
    },
    last_visit_date: "2026-10-17",
    consultation_reason: "DMARD Safety & Morning Stiffness Review",
    consultationContext: "Monitor duration of morning joint stiffness, hand digit color changes, and liver safety on weekly Methotrexate.",
    required_questions: [
      "How long does the morning stiffness in your finger and wrist joints last after waking up?",
      "Are you taking your Methotrexate only on Saturday nights with the rest on folic acid?",
      "Have you noticed any mouth ulcers, hair thinning, or nausea after your weekly dose?"
    ],
    approved_guidance: [
      "Never take Methotrexate daily; it is strictly a once-weekly medication.",
      "Wear warm gloves if entering air-conditioned or cold rooms to prevent Raynaud's spasm.",
      "Routine CBC and LFT blood tests must be completed every 2 months."
    ]
  },
  {
    id: "pat_014",
    name: "Robert Chen",
    age: 64,
    gender: "Male",
    phone: "+15550192834",
    mob_no: "+15550192834",
    address: "512 Grant Avenue, San Francisco, CA 94108",
    blood_group: "A-",
    current_health_condition: "Chronic Obstructive Pulmonary Disease (GOLD Stage II) & Emphysema",
    feedback_given_last_time: "Use Triple Therapy inhaler daily without skipping. Practice pursed-lip breathing during exertion. Keep oxygen saturation meter accessible.",
    current_medication: [
      { name: "Fluticasone/Umeclidinium/Vilanterol (Trelegy Ellipta)", dosage: "1 inhalation", frequency: "OD every morning" },
      { name: "Albuterol Inhaler", dosage: "2 puffs", frequency: "Q4H PRN shortness of breath" },
      { name: "Azithromycin 250mg", dosage: "1 tablet", frequency: "Monday/Wednesday/Friday for exacerbation prophylaxis" }
    ],
    previous_medical_history: [
      "COPD diagnosed 2018 (35 pack-year smoking history, quit 2019)",
      "Pneumococcal vaccination up to date",
      "Hospital admission for COPD exacerbation in Dec 2025"
    ],
    allergies: ["Cephalosporins (rash)"],
    emergency_contact: {
      name: "Lisa Chen",
      relation: "Daughter",
      phone: "+15550192899"
    },
    last_visit_date: "2026-10-23",
    consultation_reason: "COPD Symptom Tracking & Sputum Review",
    consultationContext: "Assess changes in sputum color/volume, walking distance without stopping, and resting pulse oximetry readings.",
    required_questions: [
      "What is your oxygen saturation reading on your finger pulse oximeter today?",
      "Has there been any increase in the amount or change to a yellow/green color in your mucus?",
      "How many times did you need your quick-acting rescue inhaler yesterday?"
    ],
    approved_guidance: [
      "If pulse oximetry drops below 90% at rest, sit upright and use rescue inhaler; alert doctor.",
      "Pursed-lip breathing helps expel trapped air from the lungs during walking.",
      "Annual influenza shot is recommended this week."
    ]
  },
  {
    id: "pat_015",
    name: "Fatima Al-Mansoor",
    age: 41,
    gender: "Female",
    phone: "+919845012345",
    mob_no: "+919845012345",
    address: "Villa 12, Palm Meadows, Whitefield, Bengaluru, KA 560066",
    blood_group: "B+",
    current_health_condition: "Generalized Anxiety Disorder & Mild Gastroesophageal Reflux (GERD)",
    feedback_given_last_time: "Take Escitalopram consistently every morning. Avoid caffeine after 2 PM. Avoid lying down for 2 hours after dinner to prevent acid reflux.",
    current_medication: [
      { name: "Escitalopram 10mg", dosage: "1 tablet", frequency: "OD morning post breakfast" },
      { name: "Esomeprazole 40mg", dosage: "1 tablet", frequency: "OD 30 mins before dinner" },
      { name: "Clonazepam 0.25mg", dosage: "1 tablet", frequency: "SOS severe panic (max 2/week)" }
    ],
    previous_medical_history: [
      "GAD diagnosed 2023",
      "Endoscopy confirmed mild reflux esophagitis (Jan 2026)",
      "No history of cardiac arrhythmias"
    ],
    allergies: ["No known drug allergies (NKDA)"],
    emergency_contact: {
      name: "Zaid Al-Mansoor",
      relation: "Spouse",
      phone: "+919845012346"
    },
    last_visit_date: "2026-10-20",
    consultation_reason: "Anxiety & Reflux Medication Follow-up",
    consultationContext: "Assess sleep quality, daytime panic symptoms, nighttime heartburn, and medication tolerability.",
    required_questions: [
      "How have your sleep quality and morning anxiety levels been feeling this week?",
      "Are you experiencing any sour taste or burning sensation in your chest at night?",
      "Have you needed to use your backup calming tablet in the past few days?"
    ],
    approved_guidance: [
      "Elevate the head of your bed 6 inches to naturally curb nighttime acid reflux.",
      "Escitalopram takes 4 to 6 weeks for full therapeutic stabilization; do not discontinue abruptly.",
      "Practice 4-7-8 diaphragmatic breathing during moments of heightened tension."
    ]
  }
];

// Dynamically generate profiles 16 to 50 with rich clinical fidelity
const CONDITIONS_POOL = [
  {
    condition: "Post-Operative Laparoscopic Cholecystectomy (Day 8)",
    reason: "Post-Cholecystectomy Wound & Diet Review",
    meds: [
      { name: "Paracetamol 650mg", dosage: "1 tablet", frequency: "TID PRN pain" },
      { name: "Cefuroxime Axetil 500mg", dosage: "1 tablet", frequency: "BD for 3 more days" },
      { name: "Pantoprazole 40mg", dosage: "1 tablet", frequency: "OD before breakfast" }
    ],
    context: "Post-op day 8 after gall bladder removal. Assess incision healing, absence of jaundice, and tolerance to low-fat foods.",
    questions: [
      "Are your four small surgical incision sites clean, dry, and healing without redness?",
      "Have you noticed any yellowing of your eyes or skin, or dark-colored urine?",
      "Are you able to digest light, low-fat meals without nausea or pain?"
    ],
    guidance: [
      "Avoid fried, oily, and heavy dairy foods for another 2 to 3 weeks.",
      "Do not lift objects heavier than 5 kg until your surgical clearance.",
      "Stitch removal or check-up is scheduled for day 10."
    ]
  },
  {
    condition: "Type 2 Diabetes Mellitus with Chronic Microalbuminuria",
    reason: "Renal Protection & Glycemic Review",
    meds: [
      { name: "Dapagliflozin 10mg", dosage: "1 tablet", frequency: "OD morning" },
      { name: "Telmisartan 40mg", dosage: "1 tablet", frequency: "OD morning" },
      { name: "Linagliptin 5mg", dosage: "1 tablet", frequency: "OD post lunch" }
    ],
    context: "Checking renal protective medication compliance, urinary hygiene on SGLT2 inhibitor, and glucose stability.",
    questions: [
      "Have you noticed any burning sensation, increased frequency, or pain when urinating?",
      "What was your average blood sugar reading over the last 3 days?",
      "Are you drinking at least 2.5 liters of clean water daily with the Dapagliflozin?"
    ],
    guidance: [
      "Drink adequate water to prevent urinary tract infections while taking Dapagliflozin.",
      "Telmisartan helps protect your kidneys from protein leakage.",
      "Report any fever or cloudy urine immediately."
    ]
  },
  {
    condition: "Chronic Atrial Fibrillation (Rate Controlled) on Anticoagulation",
    reason: "Cardiac Rhythm & Blood Thinner Monitoring",
    meds: [
      { name: "Apixaban (Eliquis) 5mg", dosage: "1 tablet", frequency: "BD 12 hours apart" },
      { name: "Diltiazem Extended Release 120mg", dosage: "1 capsule", frequency: "OD morning" },
      { name: "Atorvastatin 10mg", dosage: "1 tablet", frequency: "OD at bedtime" }
    ],
    context: "Assess compliance with twice-daily direct oral anticoagulant (DOAC), absence of palpitations, and check for bleeding signs.",
    questions: [
      "Are you taking your blood thinner tablet exactly 12 hours apart every day?",
      "Have you felt your heart racing, fluttering, or skipping beats recently?",
      "Have you noticed any unusual nosebleeds, gum bleeding, or bruises on your arms?"
    ],
    guidance: [
      "Never miss a dose of Apixaban because protection against stroke wears off in 24 hours.",
      "Avoid high-impact contact activities to minimize bleeding and hematoma risk.",
      "Check your resting pulse rate; it should typically stay between 60 and 85 bpm."
    ]
  },
  {
    condition: "Ulcerative Colitis (Mild-to-Moderate Left Sided) in Remission",
    reason: "Inflammatory Bowel Disease Maintenance",
    meds: [
      { name: "Mesalamine (5-ASA) 1.2g Extended Release", dosage: "2 tablets", frequency: "BD with food" },
      { name: "Mesalamine Suppository 1g", dosage: "1 suppository", frequency: "Once at bedtime" },
      { name: "Probiotic VSL#3 Capsule", dosage: "1 capsule", frequency: "BD post meals" }
    ],
    context: "Assess maintenance of bowel remission, stool frequency, absence of rectal bleeding, and abdominal cramping.",
    questions: [
      "How many bowel movements are you having in a 24-hour period?",
      "Have you observed any visible blood, mucus, or urgent cramping with stools?",
      "Are you taking your full daily dose of Mesalamine regularly?"
    ],
    guidance: [
      "Continue maintenance 5-ASA even when feeling completely asymptomatic to prevent relapse.",
      "Stay hydrated and avoid spicy, raw seed, or gas-producing trigger foods.",
      "Contact the GI team promptly if stool frequency exceeds 4 per day or blood appears."
    ]
  },
  {
    condition: "Post-Stroke Rehabilitation (Right Ischemic CVA - Month 6)",
    reason: "Neurological Recovery & Secondary Prevention",
    meds: [
      { name: "Clopidogrel 75mg", dosage: "1 tablet", frequency: "OD morning" },
      { name: "Atorvastatin 40mg", dosage: "1 tablet", frequency: "OD at bedtime" },
      { name: "Baclofen 10mg", dosage: "1 tablet", frequency: "BD for muscle spasticity" },
      { name: "Citicoline 500mg", dosage: "1 tablet", frequency: "BD post meals" }
    ],
    context: "Assess motor recovery in left limbs, speech clarity, daily physiotherapy progress, and adherence to secondary stroke prevention.",
    questions: [
      "How is your daily physical therapy routine progressing with walking and arm grip?",
      "Have you experienced any sudden weakness, facial droop, or difficulty speaking?",
      "Are you able to swallow food and liquids safely without coughing or choking?"
    ],
    guidance: [
      "Secondary stroke prevention requires 100% adherence to antiplatelet and statin therapy.",
      "Daily physiotherapy exercises maintain neuroplasticity and joint range of motion.",
      "Ensure bathroom and hallways have non-slip mats and grab rails to prevent falls."
    ]
  },
  {
    condition: "Chronic Lumbar Radiculopathy (L4-L5 Disc Herniation)",
    reason: "Spine Care & Nerve Pain Follow-up",
    meds: [
      { name: "Gabapentin 300mg", dosage: "1 capsule", frequency: "TID with meals" },
      { name: "Thiocolchicoside 4mg", dosage: "1 tablet", frequency: "BD post meals" },
      { name: "Paracetamol 650mg", dosage: "1 tablet", frequency: "SOS for back ache" }
    ],
    context: "Assess radiation of pain down the leg, numbness in toes, walking tolerance, and absence of cauda equina red flags.",
    questions: [
      "Is the shooting pain or numbness still traveling down into your leg or foot?",
      "Have you experienced any loss of bladder or bowel sensation, or numbness in the groin area?",
      "How far are you able to walk comfortably before needing to sit down?"
    ],
    guidance: [
      "Any sudden loss of bladder/bowel control is an emergency (cauda equina) requiring immediate ER care.",
      "Avoid prolonged sitting and do gentle core-stabilization exercises as guided by PT.",
      "Apply moist heat to the lower back for 15 minutes before gentle stretching."
    ]
  },
  {
    condition: "Primary Hypogonadism & Metabolic Fatigue",
    reason: "Hormone Replacement & Vitality Check",
    meds: [
      { name: "Testosterone Gel 1%", dosage: "50mg (1 packet)", frequency: "OD applied to upper arms" },
      { name: "Zinc + Magnesium Complex", dosage: "1 tablet", frequency: "OD at bedtime" },
      { name: "Omega-3 Fish Oil 1000mg", dosage: "1 capsule", frequency: "BD with meals" }
    ],
    context: "Assess energy levels, application site skin reactions, mood stability, and routine hematocrit/PSA safety.",
    questions: [
      "How has your daytime energy and motivation been over the last two weeks?",
      "Are you applying your gel to clean, dry skin on the shoulders and washing hands after?",
      "Have you noticed any skin irritation or swelling around the application areas?"
    ],
    guidance: [
      "Allow the gel to dry completely for 5 minutes before putting on shirts.",
      "Avoid bathing or swimming for at least 2 hours after gel application.",
      "Routine blood check for hemoglobin, hematocrit, and PSA is due in 3 months."
    ]
  }
];

const NAMES_POOL = [
  { name: "Ananya Roy", gender: "Female", age: 36, city: "Kolkata, WB", blood: "O+" },
  { name: "Tariq Ansari", gender: "Male", age: 58, city: "Lucknow, UP", blood: "B+" },
  { name: "Aisha Khan", gender: "Female", age: 29, city: "Hyderabad, TS", blood: "A+" },
  { name: "Harish Reddy", gender: "Male", age: 63, city: "Bengaluru, KA", blood: "AB+" },
  { name: "Devendra Verma", gender: "Male", age: 71, city: "Jaipur, RJ", blood: "O-" },
  { name: "Eleanor Vance", gender: "Female", age: 54, city: "Portland, OR", blood: "A-" },
  { name: "Kunal Bansal", gender: "Male", age: 43, city: "Chandigarh, CH", blood: "B+" },
  { name: "Pooja Hegde", gender: "Female", age: 31, city: "Mangaluru, KA", blood: "O+" },
  { name: "Girish Nambiar", gender: "Male", age: 66, city: "Kochi, KL", blood: "A+" },
  { name: "Shalini Saxena", gender: "Female", age: 47, city: "Bhopal, MP", blood: "B-" },
  { name: "Manish Chawla", gender: "Male", age: 52, city: "Gurugram, HR", blood: "O+" },
  { name: "Rameshwar Sen", gender: "Male", age: 74, city: "Varanasi, UP", blood: "AB-" },
  { name: "Deepika Padukone", gender: "Female", age: 38, city: "Bengaluru, KA", blood: "O+" },
  { name: "Suresh Babu", gender: "Male", age: 61, city: "Visakhapatnam, AP", blood: "B+" },
  { name: "Farhan Qureshi", gender: "Male", age: 35, city: "Delhi, DL", blood: "A+" },
  { name: "Anita Bhatia", gender: "Female", age: 68, city: "Amritsar, PB", blood: "O+" },
  { name: "Prateek Aggarwal", gender: "Male", age: 27, city: "Noida, UP", blood: "B+" },
  { name: "Radhika Merchant", gender: "Female", age: 29, city: "Jamnagar, GJ", blood: "A+" },
  { name: "Ashok Sundaram", gender: "Male", age: 65, city: "Madurai, TN", blood: "AB+" },
  { name: "Tanvi Sharma", gender: "Female", age: 25, city: "Shimla, HP", blood: "O+" },
  { name: "Nitin Gadkari", gender: "Male", age: 67, city: "Nagpur, MH", blood: "B+" },
  { name: "Bhavana Menon", gender: "Female", age: 42, city: "Thrissur, KL", blood: "A-" },
  { name: "Kishore Kumar", gender: "Male", age: 59, city: "Indore, MP", blood: "O+" },
  { name: "Zoya Akhtar", gender: "Female", age: 50, city: "Mumbai, MH", blood: "B+" },
  { name: "Sanjay Dutt", gender: "Male", age: 64, city: "Mumbai, MH", blood: "O+" },
  { name: "Monika Belucci", gender: "Female", age: 57, city: "Rome, Italy", blood: "A+" },
  { name: "Alok Nath", gender: "Male", age: 69, city: "Kanpur, UP", blood: "B+" },
  { name: "Neha Dhupia", gender: "Female", age: 43, city: "New Delhi, DL", blood: "O+" },
  { name: "Chetan Bhagat", gender: "Male", age: 49, city: "Mumbai, MH", blood: "A+" },
  { name: "Swati Mohan", gender: "Female", age: 37, city: "Pasadena, CA", blood: "B+" },
  { name: "Rajat Kapoor", gender: "Male", age: 55, city: "Kolkata, WB", blood: "O-" },
  { name: "Geeta Phogat", gender: "Female", age: 33, city: "Bhiwani, HR", blood: "A+" },
  { name: "Abhinav Bindra", gender: "Male", age: 41, city: "Dehradun, UK", blood: "B+" },
  { name: "Pankaj Tripathi", gender: "Male", age: 47, city: "Patna, BR", blood: "O+" },
  { name: "Sania Mirza", gender: "Female", age: 37, city: "Hyderabad, TS", blood: "AB+" }
];

// Combine the first 15 curated profiles with 35 generated profiles to make 50
for (let i = 0; i < NAMES_POOL.length; i++) {
  const person = NAMES_POOL[i];
  const template = CONDITIONS_POOL[i % CONDITIONS_POOL.length];
  const patientIndex = i + 16;
  const idStr = patientIndex < 100 ? `pat_0${patientIndex}` : `pat_${patientIndex}`;
  const phoneSuffix = (1000 + i * 27).toString();

  PATIENTS_50.push({
    id: idStr,
    name: person.name,
    age: person.age,
    gender: person.gender,
    phone: `+9198${phoneSuffix}54`,
    mob_no: `+9198${phoneSuffix}54`,
    address: `Street ${10 + i}, Sector ${((i * 3) % 25) + 1}, ${person.city}`,
    blood_group: person.blood,
    current_health_condition: template.condition,
    feedback_given_last_time: `Follow prescribed medication doses strictly, monitor daily symptom logs, and reach out to the clinic if discomfort arises.`,
    current_medication: template.meds,
    previous_medical_history: [
      `History of ${template.condition.split('(')[0].trim()}`,
      "Routine annual blood panels within acceptable range",
      "No documented contraindications"
    ],
    allergies: i % 4 === 0 ? ["Penicillin"] : i % 7 === 0 ? ["Sulfa drugs"] : ["No known drug allergies (NKDA)"],
    emergency_contact: {
      name: `Contact for ${person.name.split(' ')[0]}`,
      relation: "Family",
      phone: `+9198${phoneSuffix}99`
    },
    last_visit_date: `2026-10-${((i % 18) + 10).toString().padStart(2, '0')}`,
    consultation_reason: template.reason,
    consultationContext: `${person.name} (${person.age}y ${person.gender}): ${template.context}`,
    required_questions: template.questions,
  });
}

// Normalize all patients to support both camelCase and snake_case properties
for (const p of PATIENTS_50) {
  p.requiredQuestions = p.requiredQuestions || p.required_questions || [];
  p.required_questions = p.required_questions || p.requiredQuestions || [];
  p.approvedGuidance = p.approvedGuidance || p.approved_guidance || [];
  p.approved_guidance = p.approved_guidance || p.approvedGuidance || [];
  p.consultationReason = p.consultationReason || p.consultation_reason || p.current_health_condition || '';
  p.consultation_reason = p.consultation_reason || p.consultationReason || '';
  p.consultationContext = p.consultationContext || p.consultation_context || '';
  p.consultation_context = p.consultation_context || p.consultationContext || '';
  p.currentMedication = p.currentMedication || p.current_medication || [];
  p.current_medication = p.current_medication || p.currentMedication || [];
  p.previousMedicalHistory = p.previousMedicalHistory || p.previous_medical_history || [];
  p.previous_medical_history = p.previous_medical_history || p.previousMedicalHistory || [];
  p.feedbackGivenLastTime = p.feedbackGivenLastTime || p.feedback_given_last_time || '';
  p.feedback_given_last_time = p.feedback_given_last_time || p.feedbackGivenLastTime || '';
  p.bloodGroup = p.bloodGroup || p.blood_group || '';
  p.blood_group = p.blood_group || p.bloodGroup || '';
  p.emergencyContact = p.emergencyContact || p.emergency_contact || {};
  p.emergency_contact = p.emergency_contact || p.emergencyContact || {};
  p.lastVisitDate = p.lastVisitDate || p.last_visit_date || '';
  p.last_visit_date = p.last_visit_date || p.lastVisitDate || '';
  p.currentHealthCondition = p.currentHealthCondition || p.current_health_condition || p.consultation_reason || '';
  p.current_health_condition = p.current_health_condition || p.currentHealthCondition || '';
}

module.exports = {
  PATIENTS_50
};
