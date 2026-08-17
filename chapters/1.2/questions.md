# 1.2 Why is Testing Necessary? - Practice Questions

Scope: FL-1.2.1 (Why testing is necessary, K2), FL-1.2.2 (Testing and QA, K1), and FL-1.2.3 (Root cause, error, defect, failure, K2). See [concepts.md](concepts.md) for the explanations these questions draw on.

Each question includes the full answer and explanation inline for revision. In the generated HTML page, answers are collapsed so you can try each question first without a timer.

---

### Question 1 - Type A: Direct Definition

**Difficulty:** Level 1

**Question:** Which statement BEST describes the relationship between testing and quality assurance in ISTQB CTFL v4.0.1?

A. Testing and quality assurance are different names for the same activity
B. Testing is product-oriented and corrective, while quality assurance is process-oriented and preventive
C. Quality assurance is a testing activity performed only after test execution
D. Testing is process-oriented, while quality assurance is product-oriented

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
ISTQB distinguishes testing from QA. Testing focuses on evaluating the product or work product and finding defects, so it is product-oriented and corrective. QA focuses on improving processes so defects are less likely to be introduced, so it is process-oriented and preventive.

**Option-by-Option Analysis**
- A: Incorrect. People often use the terms interchangeably, but ISTQB says they are not the same.
- B: Correct. This is the key distinction.
- C: Incorrect. QA is broader than testing and is not limited to after execution.
- D: Incorrect. This reverses the official distinction.

**How This Could Be Asked Differently**
The exam may say "testing is a major form of quality control" or "QA focuses on process improvement."

**Do Not Confuse With**
Quality control checks products. Quality assurance improves processes.

---

### Question 2 - Type B: Scenario-Based

**Difficulty:** Level 2

**Question:** A tester executes a payment test and observes that the application charges customers twice for the same order. What is the observed double charge best classified as?

A. Error
B. Defect
C. Failure
D. Root cause

**Result**

Correct Answer: **C**

**Why the Correct Answer Is Correct**
The observed incorrect behavior during execution is a failure. The underlying problem in the code, design, or requirements would be a defect, but the visible effect experienced during execution is the failure.

**Option-by-Option Analysis**
- A: Incorrect. An error is a human mistake, such as a developer misunderstanding a payment rule.
- B: Incorrect. A defect is the flaw in a work product that may cause the failure.
- C: Correct. The application visibly behaves incorrectly during execution.
- D: Incorrect. A root cause is the deeper reason the problem occurred, such as unclear payment-rule ownership.

**Distractor Analysis**
Option B is tempting because failures often come from defects. But the question asks about what is observed during execution.

**How This Could Be Asked Differently**
The exam may say "wrong output," "crash," "unexpected behavior," or "system does not do what it should."

---

### Question 3 - Type C: Comparison

**Difficulty:** Level 2

**Question:** A developer misunderstands a requirement and writes a wrong validation rule in the code. Later, a user sees that valid registrations are rejected. Which option correctly maps the terms?

A. Error: wrong code; Defect: user sees rejection; Failure: developer misunderstood
B. Error: developer misunderstood; Defect: wrong validation rule in code; Failure: valid registrations are rejected
C. Error: valid registrations are rejected; Defect: developer misunderstood; Failure: wrong validation rule
D. Error: user reports the problem; Defect: tester repeats the test; Failure: developer fixes the code

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
The human misunderstanding is the error. The wrong rule in the code is the defect. The visible rejection of valid registrations during execution is the failure.

**Option-by-Option Analysis**
- A: Incorrect. It confuses defect, failure, and error.
- B: Correct. It follows the error -> defect -> failure chain.
- C: Incorrect. It assigns the visible behavior to error and the human mistake to defect.
- D: Incorrect. It describes reporting, retesting, and debugging activities, not the correct term mapping.

**How This Could Be Asked Differently**
The exam may give a short story and ask which part is the mistake, bug, observed failure, or underlying cause.

**Do Not Confuse With**
Root cause. The root cause may be deeper, such as poor requirements communication or lack of training.

---

### Question 4 - Type D: BEST / Primary Contribution

**Difficulty:** Level 2

**Question:** A project manager reviews test results showing that all high-risk safety tests passed, two medium-risk usability defects remain, and one legal compliance test is blocked. What is the MAIN contribution of testing in this situation?

A. Testing has guaranteed that the system is ready for release
B. Testing has provided information to support a project or release decision
C. Testing has performed quality assurance by improving the team's process
D. Testing has removed all remaining defects from the test object

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
Testing provides information about quality and risk so stakeholders can make decisions. The test results do not guarantee readiness and do not remove defects by themselves.

**Option-by-Option Analysis**
- A: Incorrect. Testing cannot guarantee release readiness or absence of defects.
- B: Correct. The scenario is about using test results for decision-making.
- C: Incorrect. QA may use test results for process feedback, but the direct contribution here is release information.
- D: Incorrect. Testing detects and reports defects; debugging removes defects.

**Distractor Analysis**
Option A is an absolute-word trap. "Guaranteed" is too strong for testing.

---

### Question 5 - Type E: Negative Question

**Difficulty:** Level 2

**Question:** Which of the following is NOT a reason testing may be necessary?

A. To detect defects cost-effectively
B. To provide information for release decisions
C. To prove that the software has no remaining defects
D. To help meet contractual, legal, or regulatory requirements

**Result**

Correct Answer: **C**

**Why the Correct Answer Is Correct**
Testing cannot prove that no defects remain. It can detect defects, provide confidence, reduce risk, support decisions, and help demonstrate compliance with required checks.

**Option-by-Option Analysis**
- A: This is a valid reason testing is necessary.
- B: This is a valid contribution of testing.
- C: Correct. This is not a valid testing objective or reason.
- D: This is a valid reason, especially in regulated domains.

**Exam Trap Note**
For NOT questions, look for the false statement. A, B, and D are true.

---

### Question 6 - Type F: Multiple-Statement

**Difficulty:** Level 2

**Question:** Consider these statements:

I. A defect may exist in a requirements document before any code is written.  
II. Every defect always causes a failure whenever the software is executed.  

Which option is correct?

A. Only I is correct
B. Only II is correct
C. Both I and II are correct
D. Neither I nor II is correct

**Result**

Correct Answer: **A**

**Why the Correct Answer Is Correct**
Statement I is true because defects can exist in requirements, designs, test scripts, code, build files, or other work products. Statement II is false because some defects only fail under specific conditions, and some may never be observed as failures.

**Option-by-Option Analysis**
- A: Correct. I is true and II is false.
- B: Incorrect. II is false.
- C: Incorrect. Not every defect always causes a failure.
- D: Incorrect. I is true.

**How This Could Be Asked Differently**
The exam may say "Can non-code work products contain defects?" or "Can a bug remain dormant?"

---

### Question 7 - Type G: Synonym / Alternative Wording

**Difficulty:** Level 2

**Question:** A team performs root cause analysis after several similar defects are found in tax calculations. Which outcome would BEST match the purpose of root cause analysis?

A. Identifying the exact test case that detected each failure
B. Finding the fundamental reason the similar defects were introduced so future ones can be prevented or reduced
C. Proving that the tax calculation feature now has no defects
D. Re-running the failed tests after developers fix the code

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
Root cause analysis looks for the fundamental reason a problem occurred. Addressing the root cause can prevent similar defects or reduce their frequency.

**Option-by-Option Analysis**
- A: Incorrect. This may help traceability, but it is not the purpose of root cause analysis.
- B: Correct. It focuses on the deeper reason and prevention.
- C: Incorrect. Testing cannot prove there are no defects.
- D: Incorrect. This describes confirmation testing, not root cause analysis.

**How This Could Be Asked Differently**
The exam may use "underlying cause," "fundamental reason," "why similar failures keep happening," or "prevent recurrence."

---

### Question 8 - Type B/D: Scenario with BEST Answer

**Difficulty:** Level 2

**Question:** A hospital appointment system passes all tests against its written requirements. After release, doctors complain that the workflow is too slow for emergency situations. Which statement BEST explains why testing was still necessary, and what it revealed?

A. Testing was unnecessary because the written requirements were satisfied
B. Testing can help evaluate whether stakeholder needs are considered, not only whether the product matches written requirements
C. Testing proved that quality assurance failed completely
D. Testing should have focused only on debugging the code

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
Testing can provide indirect representation of users and evaluate quality from the stakeholder perspective. Passing written requirements does not always mean the product satisfies real user needs.

**Option-by-Option Analysis**
- A: Incorrect. Requirements may be incomplete or wrong, so testing is still valuable.
- B: Correct. This captures user/stakeholder needs and validation-oriented thinking.
- C: Incorrect. The scenario does not prove QA failed completely.
- D: Incorrect. Debugging fixes known defects; the issue here may be a requirements or validation gap.

**Do Not Confuse With**
Verification checks against the specification. Validation checks whether stakeholder needs are met.

---

## Weakness Table

Update this after `/practice 1.2` sessions or after reviewing incorrect answers.

| Topic | Questions Attempted | Correct | Incorrect | Confidence | Status |
|---|---|---|---|---|---|
| Why testing is necessary | 0 | 0 | 0 | - | Not yet practiced |
| Testing vs QA | 0 | 0 | 0 | - | Not yet practiced |
| Quality control relationship | 0 | 0 | 0 | - | Not yet practiced |
| Error vs defect vs failure | 0 | 0 | 0 | - | Not yet practiced |
| Root cause analysis | 0 | 0 | 0 | - | Not yet practiced |

## Question Rotation Log

Types used so far: A (Q1), B (Q2, Q8), C (Q3), D (Q4, Q8), E (Q5), F (Q6), G (Q7). Calculation questions are not applicable to section 1.2.

