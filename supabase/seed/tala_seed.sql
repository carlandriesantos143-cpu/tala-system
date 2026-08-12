-- ============================================================
-- TALA — Seed data (real content) for Supabase
-- Generated for Barangay Malinta, Valenzuela City
-- REPLACES existing rows in: health_articles, emergency_contacts,
--   health_alerts, triage_config. Run in Supabase SQL Editor.
--
-- SAFETY: The triage_config is clinical decision-support content and
--   MUST be reviewed/approved by a licensed RHU physician or nurse
--   before real use. Verify all phone numbers locally before go-live.
--
-- Sources: WHO; Department of Health (Philippines) — Dengue 5S, IMCI,
--   NTP/DOTS, EPI, Pinggang Pinoy; Philippine Red Cross; official
--   Valenzuela City directories (valenzuela.gov.ph).
-- ============================================================

BEGIN;

-- 1) Clear old placeholder content --------------------------------
DELETE FROM health_articles;
DELETE FROM emergency_contacts;
DELETE FROM health_alerts;
DELETE FROM triage_config;

-- 2) Health articles ---------------------------------------------
-- created_by is set to an existing admin user (auth.users), in case
-- the column is NOT NULL. Adjust if your FK points elsewhere.
WITH creator AS (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
INSERT INTO health_articles (title, content, category, status, created_by)
SELECT v.title, v.content, v.category, 'Published', creator.id
FROM creator, (VALUES
  ('Dengue Prevention: The DOH 5S Strategy', 'Dengue is spread by the bite of an infected Aedes mosquito, which breeds in clean, stagnant water and bites mostly in the early morning and late afternoon. The Department of Health promotes the 5S Strategy to fight dengue:

1. Search and Destroy mosquito breeding sites — empty, clean, or cover water containers, old tires, cans, and flower vases weekly.
2. Self-protection measures — wear long sleeves and long pants, use mosquito repellent, and sleep under screens or nets.
3. Seek early consultation — go to the health center at the first sign of fever; do not self-medicate with aspirin or ibuprofen.
4. Support fogging or spraying — only in outbreak (hotspot) areas as advised by health authorities.
5. Sustain hydration — drink plenty of fluids when feverish.

Practice the ''4 o''clock habit'' of checking and clearing breeding sites daily. WARNING SIGNS that need immediate hospital care: severe abdominal pain, persistent vomiting, bleeding gums or nose, blood in vomit or stool, difficulty breathing, restlessness, or cold clammy skin.

Source: Department of Health (Philippines) — Dengue 5S Strategy.', 'Prevention'),
  ('Proper Handwashing to Prevent Disease', 'Handwashing with soap is one of the cheapest and most effective ways to prevent the spread of diarrhea, pneumonia, and other infections. Wash your hands for at least 20 seconds:

1. Wet hands with clean running water.
2. Apply soap and lather the backs of hands, between fingers, and under nails.
3. Scrub for at least 20 seconds.
4. Rinse well under running water.
5. Dry with a clean cloth or air dry.

Always wash your hands before eating or preparing food, before feeding a child, after using the toilet, after cleaning a child, and after coughing or sneezing. If soap and water are not available, use alcohol-based hand sanitizer.

Source: World Health Organization (WHO) — Hand Hygiene.', 'Prevention'),
  ('Oral Rehydration Solution (ORS) for Diarrhea', 'Most deaths from diarrhea are caused by dehydration (loss of water and salts from the body). Oral Rehydration Solution (ORS) replaces these safely and is available for free at health centers.

How to prepare: Dissolve one ORS sachet in 1 liter of clean drinking water. Do not add sugar. Use within 24 hours. If no sachet is available, an emergency home mix is 1 liter clean water + 6 level teaspoons sugar + 1/2 teaspoon salt.

How to give: Give a few sips every 1–2 minutes using a cup and spoon, even if the person vomits (wait 10 minutes, then continue more slowly). Give ORS after every loose stool. Keep breastfeeding infants. For children, also give zinc supplements for 10–14 days as advised by the health worker.

Refer urgently if the person cannot drink, is very sleepy or unconscious, has sunken eyes, has blood in the stool, or shows no improvement.

Source: WHO / DOH — Management of Diarrhoea and ORS.', 'First Aid'),
  ('Fever in Children: What to Watch For', 'Fever is common in children and is usually caused by infection. Most fevers can be managed at home, but some are warning signs of serious illness.

Home care: Give paracetamol at the correct dose for the child''s weight (as advised by a health worker). Do tepid sponging with lukewarm water — never cold water or alcohol. Offer plenty of fluids and continue feeding. Dress the child lightly.

Bring the child to a health facility immediately if there are any DANGER SIGNS: unable to drink or breastfeed, vomits everything, convulsions or fits, very sleepy or hard to wake, fast or difficult breathing, a stiff neck, a rash that does not fade when pressed, or fever in an infant under 3 months.

Do not give aspirin to children. Avoid antibiotics unless prescribed.

Source: WHO Integrated Management of Childhood Illness (IMCI).', 'First Aid'),
  ('Controlling Bleeding and Basic Wound Care', 'Quick action can stop bleeding and prevent infection.

For serious bleeding: Apply firm, direct pressure on the wound with a clean cloth or bandage. Keep pressing — do not lift the cloth to check. If a limb is bleeding, raise it above the level of the heart while keeping pressure. If blood soaks through, add another cloth on top; do not remove the first. Do NOT remove objects stuck in a wound — pad around them. Arrange transport to a health facility for heavy or spurting bleeding.

For minor cuts and scrapes: Wash your hands, then clean the wound with clean running water. Cover with a clean dressing. Watch for signs of infection over the next days — increasing pain, redness, swelling, pus, or fever — and seek care if these appear.

Anyone with a deep or dirty wound may need a tetanus vaccine. Ask at the health center.

Source: Philippine Red Cross / WHO First Aid guidance.', 'First Aid'),
  ('Understanding High Blood Pressure (Hypertension)', 'High blood pressure (hypertension) often has no symptoms, which is why it is called a ''silent killer.'' Over time it can lead to stroke, heart attack, and kidney disease. Blood pressure of 140/90 mmHg or higher on repeated readings is considered high.

How to control it:
- Reduce salt and salty processed food.
- Eat more vegetables and fruit; limit fatty and fried food.
- Be physically active most days (for example, brisk walking 30 minutes).
- Do not smoke; limit alcohol.
- Maintain a healthy weight and manage stress.
- If your doctor prescribes medicine, take it every day — even when you feel well. Do not stop without advice.

Have your blood pressure checked regularly at the health center. Seek urgent care for very high readings with severe headache, chest pain, blurred vision, or weakness on one side of the body.

Source: WHO / DOH — Hypertension.', 'Chronic'),
  ('Managing Diabetes Day to Day', 'Diabetes means the blood sugar level is too high. With good daily habits, people with diabetes can live long, healthy lives and avoid complications.

Daily management:
- Eat balanced meals at regular times; limit sugary drinks, sweets, and white rice portions.
- Stay physically active.
- Take medicines or insulin exactly as prescribed.
- Check feet daily for wounds or sores, since diabetes slows healing; wear proper footwear.
- Keep regular check-ups and monitor blood sugar as advised.

Know the danger signs. LOW blood sugar (shaking, sweating, confusion, hunger) — give sugar or sweet juice at once. HIGH blood sugar (excessive thirst, frequent urination, drowsiness, fruity breath) — seek care. Any non-healing wound, foot infection, or fainting needs prompt medical attention.

Source: WHO — Diabetes.', 'Chronic'),
  ('Tuberculosis (TB): Know the Signs', 'Tuberculosis (TB) is a bacterial infection that usually affects the lungs and spreads through the air when a person with TB coughs or sneezes. TB is curable and treatment is FREE at government health centers.

Suspect TB if a person has a cough lasting 2 weeks or more, especially with: coughing up blood, chest pain, unexplained weight loss, night sweats, fever, or fatigue. Refer them to the health center for sputum examination (GeneXpert) and chest X-ray.

Treatment follows DOTS (Directly Observed Treatment, Short-course) — the patient takes medicines daily for at least 6 months, observed by a health worker or trained treatment partner. It is very important to COMPLETE the full course even after feeling better; stopping early can cause drug-resistant TB.

To reduce spread: cover the mouth and nose when coughing, ensure good ventilation, and have close contacts screened.

Source: DOH National Tuberculosis Control Program / WHO.', 'Prevention'),
  ('Healthy Eating with Pinggang Pinoy', 'Pinggang Pinoy is the DOH and FNRI food guide that shows how much of each food group to eat at every meal, using a plate.

- Fill about half the plate with vegetables and fruit (''Glow'' foods) for vitamins and minerals.
- Fill about one-third with rice or other ''Go'' foods (energy).
- Include a serving of ''Grow'' foods — fish, lean meat, egg, beans, or milk (for growth and repair).
- Drink clean water instead of sugary drinks.

Other tips: breastfeed infants exclusively for the first 6 months, then add nutritious complementary foods. Limit salty, fatty, and sugary foods. Wash hands and keep food and water clean to prevent illness.

Source: DOH / FNRI — Pinggang Pinoy and Nutritional Guidelines for Filipinos.', 'Nutrition'),
  ('Danger Signs During Pregnancy', 'Every pregnant woman should attend prenatal check-ups and know the danger signs that require going to a health facility RIGHT AWAY:

- Vaginal bleeding.
- Severe headache with blurred vision.
- Swelling of the face and hands.
- Convulsions or fits.
- High fever.
- Severe abdominal pain.
- The baby stops moving or moves much less.
- Water breaks before labor, or foul-smelling discharge.
- Fast or difficult breathing.

These can be signs of pre-eclampsia, hemorrhage, or infection, which are dangerous for both mother and baby. Encourage facility-based delivery attended by a skilled birth attendant, and complete prenatal visits and the recommended tetanus vaccination.

Source: WHO — Pregnancy danger signs / DOH Safe Motherhood.', 'First Aid'),
  ('Immunization Protects Your Child', 'Vaccines are a safe, proven way to protect children from serious diseases such as tuberculosis, polio, measles, diphtheria, pertussis, tetanus, hepatitis B, and pneumonia. Routine childhood vaccines are provided FREE at government health centers under the DOH Expanded Program on Immunization (EPI).

Bring your child for all scheduled doses from birth through the first years of life, and keep the immunization card safe. A child is fully protected only after completing all the recommended doses on time. Mild fever or soreness after a vaccine is normal and usually settles within a day or two.

If a dose is missed, do not restart — visit the health center to catch up as soon as possible.

Source: DOH Expanded Program on Immunization (EPI) / WHO.', 'Prevention')
) AS v(title, content, category);

-- 3) Emergency contacts ------------------------------------------
INSERT INTO emergency_contacts (name, role, facility, phone, location, status, type) VALUES
  ('National Emergency Hotline', 'Police, fire, and medical — 24/7', 'Unified 911 (DILG)', '911', 'Nationwide', 'Active', 'Emergency'),
  ('Philippine Red Cross', 'Blood, ambulance, disaster response', 'Philippine Red Cross', '143', 'Nationwide', 'Active', 'Emergency'),
  ('NDRRMC Operations Center', 'National disaster response', 'NDRRMC', '(02) 8911-5061', 'Nationwide', 'Active', 'Government'),
  ('Valenzuela City DRRMO (Alert Center)', '24/7 emergency and rescue', 'Valenzuela City DRRMO', '(02) 8352-5000', 'Valenzuela City', 'Active', 'Emergency'),
  ('Valenzuela City Fire Station', 'Fire and rescue', 'Bureau of Fire Protection – Valenzuela', '(02) 8292-3519', 'Valenzuela City', 'Active', 'Emergency'),
  ('Valenzuela City Police Station', 'Main station', 'PNP Valenzuela', '(02) 8352-4000', 'Valenzuela City', 'Active', 'Government'),
  ('Valenzuela City Emergency Hospital', 'Emergency and inpatient care', 'Valenzuela City Emergency Hospital', '(02) 8352-6000', 'Valenzuela City', 'Active', 'Hospital'),
  ('Valenzuela Medical Center', 'Tertiary government hospital', 'Valenzuela Medical Center', '(02) 8294-7111', 'Valenzuela City', 'Active', 'Hospital'),
  ('Malinta Health Station', 'Barangay health station', 'St. Jude St., Malinta', '(02) 3445-1406', 'Barangay Malinta', 'Active', 'Health Center'),
  ('Pinalagad Health Station', 'Barangay health station', 'Pinalagad, Malinta', '(02) 8292-7297', 'Barangay Malinta', 'Active', 'Health Center');

-- 4) Community alerts --------------------------------------------
INSERT INTO health_alerts (title, description, priority, status, area, date, source) VALUES
  ('Dengue Season Advisory', 'Rainy season increases mosquito breeding and dengue cases. Practice the DOH 5S Strategy: Search and destroy breeding sites, Self-protection, Seek early consultation for fever, Support fogging in hotspots, and Sustain hydration. Seek care immediately for warning signs such as severe abdominal pain, persistent vomiting, or bleeding.', 'High', 'Active', 'Barangay Malinta', '2026-08-12', 'DOH / City Health Office'),
  ('Leptospirosis Warning — Avoid Floodwater', 'During heavy rain and flooding, avoid wading in floodwater, which may carry leptospira bacteria from animal urine. If contact is unavoidable, wear boots and wash immediately. Seek consultation for fever, muscle pain (especially calves), or yellowing of the eyes after flood exposure.', 'High', 'Active', 'Barangay Malinta', '2026-08-12', 'DOH'),
  ('Free Routine Immunization', 'Free childhood vaccines are available at the barangay health station under the DOH Expanded Program on Immunization. Bring your child and immunization card for scheduled doses. Consult the health worker to catch up on any missed vaccines.', 'Medium', 'Active', 'Barangay Malinta', '2026-08-12', 'City Health Office / DOH EPI');

-- 5) Triage configuration (DOH/WHO IMCI-aligned) -----------------
INSERT INTO triage_config (data) VALUES (
  '{"schemaVersion": 2, "disclaimer": "This triage tool is a decision-support aid for trained Barangay Health Workers (BHWs) only. It does not replace professional medical judgment. In any life-threatening situation, call emergency services immediately. Recommendations are based on DOH-approved community health protocols and WHO IMCI danger signs, and should be used together with proper training. This configuration must be reviewed and approved by the supervising Rural Health Unit physician or nurse before clinical use. Always refer patients to the nearest health facility when in doubt.", "ageGroups": [{"id": 1, "label": "Newborn", "rangeDesc": "0 – 28 days", "enabled": true}, {"id": 2, "label": "Infant", "rangeDesc": "1 – 11 months", "enabled": true}, {"id": 3, "label": "Young Child", "rangeDesc": "1 – 5 years", "enabled": true}, {"id": 4, "label": "Child", "rangeDesc": "6 – 12 years", "enabled": true}, {"id": 5, "label": "Adolescent", "rangeDesc": "13 – 17 years", "enabled": true}, {"id": 6, "label": "Adult", "rangeDesc": "18 – 59 years", "enabled": true}, {"id": 7, "label": "Elderly", "rangeDesc": "60 years and above", "enabled": true}], "userTypes": [{"id": 1, "label": "Barangay Health Worker", "description": "Community-based primary health worker with BHW certification", "enabled": true}, {"id": 2, "label": "Barangay Nutrition Scholar", "description": "Nutrition-focused community volunteer", "enabled": true}, {"id": 3, "label": "Midwife", "description": "Licensed midwife at health station or RHU", "enabled": false}, {"id": 4, "label": "Rural Health Physician", "description": "Doctor assigned to municipal health office", "enabled": false}], "redFlags": [{"id": 1, "symptom": "Unconscious or unresponsive", "severity": "Critical", "instruction": "Do not move. Call emergency services (911). Check airway and breathing."}, {"id": 2, "symptom": "Severe difficulty breathing or gasping", "severity": "Critical", "instruction": "Sit patient upright. Clear airway. Call emergency transport immediately."}, {"id": 3, "symptom": "Active seizure / convulsion", "severity": "Critical", "instruction": "Place on side. Do NOT restrain or put anything in mouth. Time the seizure. Call for help."}, {"id": 4, "symptom": "Severe bleeding that won''t stop", "severity": "Critical", "instruction": "Apply firm direct pressure with clean cloth. Elevate if limb. Arrange immediate transport."}, {"id": 5, "symptom": "Chest pain with sweating and arm/jaw pain", "severity": "Critical", "instruction": "Keep patient still and calm. Give aspirin if available and not allergic. Call emergency."}, {"id": 6, "symptom": "Signs of severe dehydration (sunken eyes, can''t drink, skin pinch very slow)", "severity": "High", "instruction": "Begin ORS immediately. Arrange transport to health facility for IV fluids."}, {"id": 7, "symptom": "High fever (>39°C) in child under 5 with danger signs", "severity": "High", "instruction": "Give paracetamol. Tepid sponging. Transport to hospital. Do not delay."}, {"id": 8, "symptom": "Sudden severe headache with stiff neck and fever", "severity": "High", "instruction": "Possible meningitis. Do not wait. Refer immediately to hospital."}, {"id": 9, "symptom": "Snake or animal bite with swelling or difficulty breathing", "severity": "High", "instruction": "Keep patient still. Do NOT apply tourniquet or suck venom. Transport to hospital with anti-venom."}, {"id": 10, "symptom": "Ingestion of poison or unknown substance", "severity": "High", "instruction": "Do NOT induce vomiting. Identify substance if possible. Call Poison Control or bring to ER immediately."}], "symptomClusters": [{"id": 1, "name": "Fever & Infection", "description": "Assessment questions for fever-related complaints", "questions": [{"id": 101, "question": "Temperature above 39°C (102.2°F)?", "yesBranch": {"label": "High Fever", "urgency": "Urgent", "action": "Give paracetamol. Tepid sponge. Refer to RHU if persists >24hrs or danger signs.", "target": {"type": "result", "urgency": "Urgent"}, "ageEscalations": [{"ageGroupIds": [1, 2], "urgency": "Emergency"}]}, "noBranch": {"label": "Check more", "urgency": "Non-Urgent", "action": "Proceed to check for rash or joint pain.", "target": {"type": "question", "questionId": 102}}}, {"id": 102, "question": "Fever with rash or joint pain?", "yesBranch": {"label": "Possible Dengue", "urgency": "Urgent", "action": "Perform tourniquet test. Avoid aspirin. Refer for CBC and dengue NS1.", "target": {"type": "result", "urgency": "Urgent"}}, "noBranch": {"label": "Check duration", "urgency": "Non-Urgent", "action": "Check if fever is prolonged.", "target": {"type": "question", "questionId": 103}}}, {"id": 103, "question": "Fever lasting more than 7 days?", "yesBranch": {"label": "Prolonged Fever", "urgency": "Urgent", "action": "Refer to RHU for blood culture, typhoid screening, and evaluation.", "target": {"type": "result", "urgency": "Urgent"}}, "noBranch": {"label": "Acute fever", "urgency": "Semi-Urgent", "action": "Continue monitoring. Give paracetamol. Return if worsening.", "target": {"type": "result", "urgency": "Semi-Urgent"}}}]}, {"id": 2, "name": "Respiratory", "description": "Assessment questions for breathing and cough complaints", "questions": [{"id": 201, "question": "Fast breathing for age group?", "yesBranch": {"label": "Possible Pneumonia", "urgency": "Urgent", "action": "Give first dose amoxicillin. Count respiratory rate. Refer to health facility.", "target": {"type": "result", "urgency": "Urgent"}}, "noBranch": {"label": "Check cough duration", "urgency": "Non-Urgent", "action": "Continue to check cough duration.", "target": {"type": "question", "questionId": 202}}}, {"id": 202, "question": "Cough lasting more than 2 weeks?", "yesBranch": {"label": "Possible TB", "urgency": "Urgent", "action": "Collect sputum sample. Refer for GeneXpert and chest X-ray. Isolate.", "target": {"type": "result", "urgency": "Urgent"}}, "noBranch": {"label": "Check wheezing", "urgency": "Non-Urgent", "action": "Check for wheezing symptoms.", "target": {"type": "question", "questionId": 203}}}, {"id": 203, "question": "Wheezing or chest tightness?", "yesBranch": {"label": "Possible Asthma", "urgency": "Semi-Urgent", "action": "Give salbutamol nebulization. Monitor 20 min. Refer if no improvement.", "target": {"type": "result", "urgency": "Semi-Urgent"}}, "noBranch": {"label": "No wheeze", "urgency": "Non-Urgent", "action": "Supportive treatment. Follow up if symptoms persist.", "target": {"type": "result", "urgency": "Non-Urgent"}}}]}, {"id": 3, "name": "Gastrointestinal", "description": "Assessment questions for diarrhea, vomiting, and abdominal pain", "questions": [{"id": 301, "question": "Blood in stool?", "yesBranch": {"label": "Dysentery", "urgency": "Urgent", "action": "Give ORS. Do NOT give anti-diarrheal. Collect stool sample. Refer for antibiotics.", "target": {"type": "result", "urgency": "Urgent"}}, "noBranch": {"label": "Check dehydration", "urgency": "Semi-Urgent", "action": "Check hydration level.", "target": {"type": "question", "questionId": 302}}}, {"id": 302, "question": "Signs of some dehydration (thirsty, restless, dry mouth)?", "yesBranch": {"label": "Moderate Dehydration", "urgency": "Semi-Urgent", "action": "ORS Plan B: 75ml/kg over 4 hours. Reassess after. Refer if worsening.", "target": {"type": "result", "urgency": "Semi-Urgent"}}, "noBranch": {"label": "No dehydration", "urgency": "Non-Urgent", "action": "ORS Plan A: after each loose stool. Continue feeding. Follow up daily.", "target": {"type": "result", "urgency": "Non-Urgent"}}}]}, {"id": 4, "name": "Maternal Health", "description": "Assessment questions for pregnant and postpartum patients", "ageGroupIds": [5, 6], "questions": [{"id": 401, "question": "Vaginal bleeding during pregnancy?", "yesBranch": {"label": "Obstetric Emergency", "urgency": "Emergency", "action": "Do NOT do internal exam. Position on left side. Arrange immediate hospital transfer.", "target": {"type": "result", "urgency": "Emergency"}}, "noBranch": {"label": "Check pre-eclampsia", "urgency": "Non-Urgent", "action": "Check for pre-eclampsia signs.", "target": {"type": "question", "questionId": 402}}}, {"id": 402, "question": "Severe headache with blurred vision and swelling (pre-eclampsia signs)?", "yesBranch": {"label": "Possible Pre-eclampsia", "urgency": "Emergency", "action": "Check BP if available. Keep patient calm and lying down. Urgent referral to hospital.", "target": {"type": "result", "urgency": "Emergency"}}, "noBranch": {"label": "Normal pregnancy complaint", "urgency": "Non-Urgent", "action": "Routine prenatal advice. Schedule next checkup.", "target": {"type": "result", "urgency": "Non-Urgent"}}}]}], "resultConfigs": [{"urgency": "Emergency", "title": "Emergency — Immediate Referral", "description": "Life-threatening conditions requiring immediate hospital transfer", "defaultAction": "Call emergency services or arrange fastest transport to nearest hospital. BHW to accompany patient. Provide first aid while waiting.", "escalationNote": "If no transport available, call Municipal Health Officer hotline immediately.", "color": "red", "timeframe": "Immediate", "followUp": "Continuous monitoring until hospital handoff"}, {"urgency": "Urgent", "title": "Urgent — Same-Day Referral", "description": "Serious conditions requiring medical evaluation within hours", "defaultAction": "Refer to Rural Health Unit or Municipal Health Center within 4 hours. Give first dose of appropriate medication if trained. Document vitals.", "escalationNote": "If condition worsens before transport, escalate to Emergency protocol.", "color": "orange", "timeframe": "Within 4 hours", "followUp": "Check status every 2 hours until seen by physician"}, {"urgency": "Semi-Urgent", "title": "Semi-Urgent — Scheduled Visit", "description": "Conditions needing professional evaluation within 1–3 days", "defaultAction": "Schedule visit to health facility within 72 hours. Provide home care instructions. BHW to follow up daily by visit or phone.", "escalationNote": "If symptoms worsen or new danger signs appear, escalate to Urgent.", "color": "amber", "timeframe": "Within 72 hours", "followUp": "Daily follow-up by BHW (visit or phone)"}, {"urgency": "Non-Urgent", "title": "Non-Urgent — Home Care", "description": "Minor conditions manageable with home care and BHW guidance", "defaultAction": "Provide health education and home care instructions. Ensure patient knows when to return. Schedule follow-up in 5–7 days.", "escalationNote": "If no improvement after 3 days or symptoms change, reassess from the beginning.", "color": "emerald", "timeframe": "5–7 days", "followUp": "Follow-up visit in 5–7 days"}]}'::jsonb
);

COMMIT;
