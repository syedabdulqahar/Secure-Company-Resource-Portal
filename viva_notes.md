# CUST CS3723 Database Security - Viva Preparation Notes (Roman Urdu)

Yeh file aapke viva ki tayari ke liye banayi gayi hai. Isme system ke RBAC aur ABAC ke rules ko asaan Roman Urdu mein samjhaya gaya hai takay aap kal viva mein achi tarah explain kar sakein.

---

## 1. Access Control ke 2 Layers (RBAC + ABAC)

Is project mein kisi bhi resource (file/data) ko access karne ke liye **do stage verification** hoti hai:

1. **RBAC Layer**: Yeh check karta hai ke aapka **Role** kya kar sakta hai (Read, Write, Update, Delete).
2. **ABAC Layer**: Yeh check karta hai ke aapke **Attributes** (Department, Clearance Level, Location, Time) policy ke mutabiq hain ya nahi.

_Note: **Admin** par ABAC ke rules apply nahi hote, woh directly bypass ho jata hai aur sab kuch access kar sakta hai._

---

## 2. RBAC Layer (Kon kya action le sakta hai?)

System mein 4 roles hain, aur har ek ke paas specific permissions hain:

| Role         | Permissions                         | Description (Urdu)                                                                                |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Admin**    | `READ`, `WRITE`, `UPDATE`, `DELETE` | Sab kuch kar sakta hai. User add/remove/suspend kar sakta hai.                                    |
| **Manager**  | `READ`, `WRITE`, `UPDATE`           | Apne department ke resources ko read, create aur edit kar sakta hai. Delete nahi kar sakta.       |
| **Employee** | `READ`                              | Sirf read-only access hoti hai. Kuch create ya edit nahi kar sakta.                               |
| **Auditor**  | `READ` (Logs Only)                  | Kisi bhi resource ka original data nahi dekh sakta, sirf Audit Logs aur Dashboard dekh sakta hai. |

---

## 3. ABAC Layer (Contextual Rules)

Agar RBAC allow kar bhi de, to ABAC ke yeh **5 rules** check hote hain (Admin ke ilawa sab par):

1. **Department Match (`department = resource_department`)**:
   - User ka department aur Resource ka department bilkul same hona chahiye.
   - _Example_: IT Manager HR ke document ko nahi dekh sakta.
2. **Clearance Level (`clearance_level >= resource_classification`)**:
   - User ka Clearance level resource ke Classification level se barabar ya zyada hona chahiye.
   - _Example_: Agar Resource level 4 (Confidential) hai, to Clearance level 2 wala employee use nahi dekh sakta.
3. **Location Block (`location != Remote` -> DENY)**:
   - Agar koi user **Remote** (ghar se) kaam kar raha hai, to system use directly block (DENY) kar dega, chahe baqi saare rules pass ho rahe hon.
4. **Time Window (`time BETWEEN 08:00-18:00`)**:
   - Resources sirf office timings (Subah 8 se Shaam 6) ke darmiyan access ho sakti hain.
5. **Office Location ALLOW (`location = Office`)**:
   - Office se access karne wale users ko ALLOW kiya jata hai.

---

## 4. Expected Viva Questions & Answers (Scenarios)

### Q1: Agar ek IT Employee remote location se login kare, kya woh IT configuration file dekh sakega?

- **Ans**: **Nahi.** IT Employee ka department to match ho jayega, lekin ABAC ki location policy (`location != Remote` -> DENY) use access karne se rok degi.

### Q2: HR Employee (Clearance Level 2) kya "HR Performance Reviews" (Classification 4) dekh sakta hai?

- **Ans**: **Nahi.** Department to dono ka HR hai (match ho gaya), lekin employee ka clearance level (2) resource ke classification level (4) se kam hai, isliye ABAC clearance rule fail ho jayega.

### Q3: Manager aur Employee ke resource access mein kya farq hai?

- **Ans**: **RBAC ka farq hai.** Employee sirf `READ` kar sakta hai. Manager ke paas `WRITE` aur `UPDATE` permissions hoti hain, isliye Manager naye resources create bhi kar sakta hai aur purani files ko edit bhi kar sakta hai (agar ABAC rules allow karein).

### Q4: Auditor ka kya role hai is system mein?

- **Ans**: Auditor ko database security monitoring ke liye rakha gaya hai. Woh resources ka confidential data nahi dekh sakta, lekin system ke **Audit Logs** (kis ne kab access kiya, kab block hua) aur **Dashboard metrics** dekh sakta hai.

### Q5: Admin ka ABAC rule kya hai?

- **Ans**: Admin ke liye ABAC evaluate nahi hota. Code mein Admin bypass laga hua hai (`isAdmin(user) -> return true`), isliye Admin har department aur har clearance level ki file dekh sakta hai.

### Q6: User Suspension (Lockout) kaise kaam karta hai?

- **Ans**: Admin kisi bhi user ko **Suspend** kar sakta hai. Jab user suspend hota hai to database mein uska status `'Suspended'` ho jata hai. Login ke waqt check hota hai, aur agar status suspended ho to login fail ho jata hai aur audit logs mein `'ACCOUNT_SUSPENDED'` ka deny log save ho jata hai.
