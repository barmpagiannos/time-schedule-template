import os
from dotenv import load_dotenv
from flask import Flask, request, render_template
from google import genai
import json
import pandas as pd
from ortools.sat.python import cp_model

# --- ΦΟΡΤΩΣΗ API KEY ΑΠΟ ΤΟ .ENV ---
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("Προσοχή: Το GEMINI_API_KEY δεν βρέθηκε! Έλεγξε το αρχείο .env")

app = Flask(__name__)

# --- ΡΥΘΜΙΣΗ GEMINI API ---
client = genai.Client(api_key=api_key)

# --- SYSTEM PROMPT ---
SYSTEM_PROMPT = """
Είσαι ένας μεταφραστής περιορισμών χρονοπρογραμματισμού. 
Ο χρήστης θα σου δώσει ένα κείμενο στα ελληνικά. Πρέπει να εξάγεις ΜΟΝΟ ένα έγκυρο JSON αρχείο (χωρίς markdown, χωρίς επεξηγήσεις) με την εξής αυστηρή δομή:
{
  "metadata": {"num_days": 7, "num_shifts": 3, "nurses_per_shift": 2},
  "employees": [{"id": 0, "name": "Γιώργος"}, ...],
  "hard_constraints": {
    "max_shifts_per_day": 1, 
    "max_shifts_per_week": 5,
    "individual_constraints": [
      {"employee_id": 0, "forbidden_days": [2, 3], "max_weekly_shifts": 3}
    ]
  }
}
ΣΗΜΑΝΤΙΚΟ: Οι ημέρες (forbidden_days) ξεκινάνε από το 0. Η Δευτέρα/Ημέρα 1 είναι το 0, η Τρίτη το 1, η Τετάρτη το 2, κλπ. Το Σαββατοκύριακο (Σάββατο-Κυριακή) είναι το [5, 6].
Βρες πόσοι είναι οι υπάλληλοι, ονόμασέ τους και βγάλε τα νούμερα από το κείμενο. Επίστρεψε ΑΥΣΤΗΡΑ ΚΑΙ ΜΟΝΟ το JSON.
"""

def solve_with_ortools(data):
    num_days = data["metadata"].get("num_days", 7)
    num_shifts = data["metadata"].get("num_shifts", 3)
    nurses_per_shift = data["metadata"].get("nurses_per_shift", 2)
    employees = data.get("employees", [])
    num_nurses = len(employees)
    
    if num_nurses == 0:
        return None, None, "Δεν βρέθηκαν υπάλληλοι στο κείμενο."

    nurse_names = {emp["id"]: emp["name"] for emp in employees}
    
    model = cp_model.CpModel()
    shifts = {}

    for n in range(num_nurses):
        for d in range(num_days):
            for s in range(num_shifts):
                shifts[(n, d, s)] = model.NewBoolVar(f'shift_n{n}_d{d}_s{s}')

    # 1. Κάλυψη ανά βάρδια
    for d in range(num_days):
        for s in range(num_shifts):
            model.Add(sum(shifts[(n, d, s)] for n in range(num_nurses)) == nurses_per_shift)

    # 2. Το πολύ μία βάρδια την ημέρα
    max_daily = data.get("hard_constraints", {}).get("max_shifts_per_day", 1)
    for n in range(num_nurses):
        for d in range(num_days):
            model.Add(sum(shifts[(n, d, s)] for s in range(num_shifts)) <= max_daily)

    # 3. Μέγιστες βάρδιες την εβδομάδα
    max_weekly = data.get("hard_constraints", {}).get("max_shifts_per_week", 5)
    for n in range(num_nurses):
        model.Add(sum(shifts[(n, d, s)] for d in range(num_days) for s in range(num_shifts)) <= max_weekly)

    # 4. Κανόνας Κόπωσης: Όχι Πρωί μετά από Νύχτα
    for n in range(num_nurses):
        for d in range(num_days - 1):
            model.Add(shifts[(n, d, 2)] + shifts[(n, d + 1, 0)] <= 1)

    # 5. DYNAMIC INJECTION: Ειδικοί Περιορισμοί ανά Υπάλληλο
    individual_rules = data.get("hard_constraints", {}).get("individual_constraints", [])
    for rule in individual_rules:
        emp_id = rule.get("employee_id")
        
        if "forbidden_days" in rule:
            for day in rule["forbidden_days"]:
                if 0 <= day < num_days:
                    for s in range(num_shifts):
                        model.Add(shifts[(emp_id, day, s)] == 0)
        
        if "max_weekly_shifts" in rule:
            custom_max = rule["max_weekly_shifts"]
            model.Add(sum(shifts[(emp_id, d, s)] for d in range(num_days) for s in range(num_shifts)) <= custom_max)

    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        # --- ΠΙΝΑΚΑΣ 1: ΤΟ ΠΡΟΓΡΑΜΜΑ ---
        schedule_data = []
        for d in range(num_days):
            day_record = {"Ημέρα": f"Ημέρα {d+1}"}
            for s in range(num_shifts):
                working_nurses = [nurse_names[n] for n in range(num_nurses) if solver.Value(shifts[(n, d, s)])]
                shift_labels = ["Πρωινή", "Απογευματινή", "Νυχτερινή"]
                shift_name = shift_labels[s]
                day_record[shift_name] = ", ".join(working_nurses)
            schedule_data.append(day_record)
        
        df_schedule = pd.DataFrame(schedule_data)

        # --- ΠΙΝΑΚΑΣ 2: ΣΤΑΤΙΣΤΙΚΑ ΔΙΚΑΙΟΣΥΝΗΣ ---
        stats_data = []
        for n in range(num_nurses):
            morning_count = sum(1 for d in range(num_days) if solver.Value(shifts[(n, d, 0)]))
            evening_count = sum(1 for d in range(num_days) if solver.Value(shifts[(n, d, 1)]))
            night_count = sum(1 for d in range(num_days) if solver.Value(shifts[(n, d, 2)]))
            total_count = morning_count + evening_count + night_count
            
            stats_data.append({
                "Υπάλληλος": nurse_names[n],
                "Σύνολο Βαρδιών": total_count,
                "Πρωινές": morning_count,
                "Απογευματινές": evening_count,
                "Νυχτερινές": night_count
            })
            
        df_stats = pd.DataFrame(stats_data)

        return df_schedule, df_stats, None
    else:
        return None, None, "Το πρόβλημα είναι μαθηματικά αδύνατο με αυτούς τους κανόνες (π.χ. ζητήσατε πολλά ρεπό και δεν βγαίνουν οι βάρδιες)."

# --- FLASK ROUTES ---
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        user_input = request.form['user_input']
        
        try:
            prompt = SYSTEM_PROMPT + "\nΚείμενο χρήστη: " + user_input
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            
            json_text = response.text.strip()
            if json_text.startswith("```json"):
                json_text = json_text[7:-3].strip()
            elif json_text.startswith("```"):
                json_text = json_text[3:-3].strip()
                
            data = json.loads(json_text)
            
            # Αποθήκευση του JSON για έλεγχο
            with open('last_schedule_request.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            
            # Τώρα η συνάρτηση επιστρέφει 3 πράγματα
            df_schedule, df_stats, error = solve_with_ortools(data)
            
            if error:
                return render_template('index.html', error_message=error)
            
            table_html = df_schedule.to_html(classes='data main-table', index=False)
            stats_html = df_stats.to_html(classes='data stats-table', index=False)
            
            return render_template('index.html', table_html=table_html, stats_html=stats_html)
            
        except json.JSONDecodeError:
            return render_template('index.html', error_message="Το AI δεν μπόρεσε να δημιουργήσει σωστό JSON. Δοκιμάστε να γράψετε πιο ξεκάθαρα.")
        except Exception as e:
            return render_template('index.html', error_message=f"Προέκυψε σφάλμα: {str(e)}")

    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)