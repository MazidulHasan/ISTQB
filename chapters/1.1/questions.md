# 1.1 What is Testing? — Practice Questions

Scope: FL-1.1.1 (Test Objectives, K1) and FL-1.1.2 (Testing and Debugging, K2). See [concepts.md](concepts.md) for the full explanations these questions draw on.

Each question includes the full answer and explanation inline — this file is a revision document, not a live quiz. For an interactive session where answers are withheld until you respond, use `/practice 1.1 <mode>` instead.

Weakness table below is updated as you use `/practice` and report which of these you got wrong via `/clarify`.

---

### Question 1 — Type A: Direct Definition

**Difficulty:** 🟢 Level 1

**Question:** According to the ISTQB syllabus, software testing is best described as:

A. The execution of software to check that it produces the correct output
B. A set of activities to discover defects and evaluate the quality of software work products
C. The process of finding and fixing defects in source code
D. A quality assurance process focused on improving development procedures

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
This is the ISTQB definition almost verbatim: testing is a *set of activities* — not a single activity — aimed at discovering defects and evaluating quality. It deliberately covers more than execution.

**Option-by-Option Analysis**
- A: Incorrect. Describes only dynamic testing / test execution, which is one activity within testing, not the whole of testing. This is the "testing = only execution" misconception the syllabus explicitly warns about.
- B: Correct — matches the official definition.
- C: Incorrect. "Finding and fixing" conflates testing (finding, evaluating) with debugging (fixing). Testing does not fix defects.
- D: Incorrect. This describes quality assurance (QA), a process-oriented, preventive activity — not testing, which is product-oriented and corrective in focus (see Section 1.2.2, forward reference).

**How This Could Be Asked Differently**
Official Concept: Testing (the activity)
The exam may say: "the process of activities used to assess and improve confidence in a work product's quality," "a lifecycle-wide set of activities including planning, analysis, design, execution and evaluation."
Do Not Confuse With: Test execution (just one activity within testing); Debugging (fixing, not finding/evaluating); Quality Assurance (process-oriented and preventive, not product-oriented and corrective).

---

### Question 2 — Type B: Scenario-Based

**Difficulty:** 🟡 Level 2

**Question:** A business analyst reads through a newly written set of user stories for an online banking app, before any code exists, and identifies that one story doesn't specify what should happen if a transfer amount exceeds the daily limit. What is this activity best classified as?

A. Debugging, because a problem was identified
B. Testing, specifically static testing
C. Not testing, since no software was executed
D. Quality assurance, since it improves the requirements process

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
Testing includes examining any work product — including user stories — without executing code. This is static testing: a defect (an incomplete/ambiguous requirement) was found directly, without running anything.

**Option-by-Option Analysis**
- A: Incorrect. Debugging is about locating and fixing a defect already confirmed to exist in code, typically done by a developer after a failure or a found defect. Here, a defect is being *found*, not diagnosed/fixed in code — that's testing's job.
- B: Correct. Reviewing a work product (user stories) to find defects, with no execution involved, is precisely static testing.
- C: Incorrect. This is the classic misconception the syllabus explicitly rules out — testing is not limited to execution. Static testing is testing.
- D: Incorrect (tempting distractor). This activity is product-oriented (evaluating a specific test object — the user stories) and corrective (finding a specific defect), which is the hallmark of testing, not QA. QA would instead look at *why* the requirements process allowed this ambiguity through and improve the process itself.

**Distractor Analysis**
Option D is a well-built distractor because reviews genuinely do feed into process improvement, and testing/QA are commonly (and incorrectly) used interchangeably in casual speech. The distinction hinges on product-oriented vs. process-oriented — see the Testing vs. QA comparison in the forward reference (Section 1.2.2); for now, remember: examining *this specific work product* to find *this specific problem* = testing.

**How This Could Be Asked Differently**
Official Concept: Static Testing
The exam may say: "examining a document/work product without executing it," "identifying an issue in a requirement before coding begins."
Do Not Confuse With: Dynamic testing (requires execution); Debugging (fixing a confirmed code defect); QA (process-level, not product-level).

---

### Question 3 — Type C: Comparison

**Difficulty:** 🟡 Level 2

**Question:** A tester finds that a password-reset feature crashes the app when a 300-character password is submitted. A developer then spends time in a debugger tracing exactly which line of code causes the crash, and fixes it. Which statement correctly matches each role to their activity?

A. Both the tester and the developer are debugging
B. The tester is testing (dynamic testing, which triggered the failure); the developer is debugging (diagnosing and fixing the defect)
C. The tester is debugging; the developer is testing
D. Both the tester and the developer are testing

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
The tester executed the software and triggered a failure — that's dynamic testing. The developer then located the defect causing that failure and fixed it — that's debugging (reproduction/diagnosis/fixing). This is the canonical division of labor the syllabus describes.

**Option-by-Option Analysis**
- A: Incorrect. The tester never located or fixed anything in the code — they only ran a test that exposed a problem. That's testing, not debugging.
- B: Correct.
- C: Incorrect — reversed. The tester's action (running a test, observing a crash) is testing; the developer's action (tracing code to the root cause and fixing it) is debugging.
- D: Incorrect. The developer's activity is specifically about locating/removing a known problem in code, which is debugging, not testing — even though code is being examined/run during the process.

**Common Confusion Note**
If you got this wrong by picking A or D, you're likely conflating "code is being worked with" with "this is one single activity." Ask instead: is the goal to find out *if* there's a problem (testing) or to find *exactly where* a known problem is and remove it (debugging)?

---

### Question 4 — Type D: Tricky Wording (BEST)

**Difficulty:** 🔴 Level 3

**Question:** A team ships a feature that fully satisfies every acceptance criterion written in the requirements document. After release, a significant number of real users struggle to use the feature and complain it doesn't do what they expected. Which statement BEST explains this outcome?

A. The feature failed testing because defects were found in production
B. The feature passed verification but failed validation — the specification did not fully capture real user needs
C. The QA process was skipped, since QA would have caught this
D. The testers did not perform enough dynamic testing before release

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
This is exactly the verification/validation gap: the product was verified (it matches the written spec) but not validated (it doesn't match what users actually needed) — because the spec itself was incomplete or mistaken about user needs, not because testing failed to execute enough checks.

**Option-by-Option Analysis**
- A: Incorrect. Nothing here indicates a *defect* (the software did what the spec said) — it indicates a validation gap, a different problem than "the software doesn't do what was specified."
- B: Correct — precisely names the verification/validation distinction and identifies the root issue (the spec, not the testing execution).
- C: Incorrect. This is a tempting but unsupported leap — the scenario says nothing about whether QA process steps were skipped; it's not the most direct explanation of the observed outcome.
- D: Incorrect. More dynamic testing against the *same, incomplete* specification would not have caught a validation gap — dynamic testing against the spec would still have passed. This distractor assumes the problem is testing thoroughness, when it's actually a requirements/validation issue.

**Why the Qualifier Word Matters**
"BEST explains" means you must choose the option that most precisely and completely accounts for the described outcome — not merely a plausible-sounding option. C and D are both superficially plausible but require assumptions the scenario doesn't support, and don't correctly diagnose the actual mechanism (verification passing, validation failing).

**How This Could Be Asked Differently**
Official Concept: Validation vs. Verification
The exam may say: "the product met every documented requirement, but users still weren't satisfied," "the specification was correct on paper but incomplete in practice."
Do Not Confuse With: A defect / failure (verification failure) — this scenario is specifically about a validation gap, where verification actually succeeded.

---

### Question 5 — Type E: Negative (EXCEPT)

**Difficulty:** 🟡 Level 2

**Question:** All of the following are recognized ISTQB test objectives EXCEPT:

A. Building confidence in the quality of the test object
B. Verifying that a test object complies with contractual, legal, and regulatory requirements
C. Guaranteeing that the software contains zero defects
D. Providing information to stakeholders to allow them to make informed decisions

**Result**

Correct Answer: **C**

**Why the Correct Answer Is Correct**
"Guaranteeing zero defects" is not a recognized test objective — and it isn't achievable. It contradicts one of the core testing principles (testing shows the presence of defects, not their absence). Every other option is a verbatim/paraphrased official test objective.

**Option-by-Option Analysis**
- A: This IS an official test objective — not the answer to this NOT/EXCEPT question.
- B: This IS an official test objective — not the answer.
- C: Correct answer — this is NOT a real test objective, and it's actually impossible to achieve; testing can only reduce risk and build confidence, never *guarantee* defect-free software.
- D: This IS an official test objective — not the answer.

**Exam Trap Note**
NOT/EXCEPT questions are frequently missed not because the content is hard, but because test-takers forget the question is inverted under time pressure and pick the *first true statement* they recognize (here, A, B, or D) instead of hunting for the false one. Always re-read the question stem after evaluating each option: "am I looking for true or false here?"

---

### Question 6 — Type F: Multiple-Statement

**Difficulty:** 🔴 Level 3

**Question:** Consider the following two statements about static testing:

I. Static testing can identify defects without executing the software.
II. Static testing can cause a failure if the reviewed document contains a serious error.

Which is correct?

A. Only I is correct
B. Only II is correct
C. Both I and II are correct
D. Neither I nor II is correct

**Result**

Correct Answer: **A**

**Why the Correct Answer Is Correct**
Statement I is directly from the syllabus: static testing finds defects directly, without executing anything. Statement II is false: by definition, a failure only occurs when software is *executed* and behaves incorrectly. Static testing never executes anything, so it can never cause a failure — no matter how serious the underlying defect is.

**Option-by-Option Analysis**
- A: Correct — I true, II false.
- B: Incorrect, since I is actually true (this is one of the section's central points).
- C: Incorrect — II is false regardless of the defect's severity; "causing a failure" requires execution, which static testing never does.
- D: Incorrect, since I is true.

**Distractor Analysis**
Statement II is designed to sound plausible because "serious error" primes you to think "surely that could cause a crash" — but the trap is conflating the *defect itself being serious* with the *act of finding it* causing a failure. Reviewing a document, however severe the defect found, is still just reading — nothing is running, so nothing can fail.

---

### Question 7 — Type G: Synonym / Alternative Wording

**Difficulty:** 🟡 Level 2

**Question:** A tester re-runs the exact same test case that previously failed, immediately after the developer reports the underlying code has been fixed, to check whether it now passes. What is this activity called, and is it testing or debugging?

A. Debugging — it's re-checking the developer's fix
B. Confirmation testing — a testing activity performed after debugging is complete
C. Regression testing — checking that unrelated areas still work
D. Static testing — since the code isn't newly executed

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
Re-executing a previously failed test case specifically to check whether a reported fix resolved it is the definition of confirmation testing (full treatment in Section 2.2.3) — and it is a testing activity, performed by the tester, after the developer's debugging work is done.

**Option-by-Option Analysis**
- A: Incorrect. The debugging (locating and fixing the defect in code) was already done by the developer before this step. This step only checks the *result* of that debugging — that's testing.
- B: Correct.
- C: Incorrect but a very common trap — regression testing checks whether the fix caused *new* problems in *other, unrelated* areas, not whether the *original* failed test now passes. This question describes re-running the *same* test, which is confirmation testing.
- D: Incorrect. Re-running a test case means executing the software again — this is dynamic testing, not static.

**How This Could Be Asked Differently**
Official Concept: Confirmation Testing
The exam may say: "re-testing," "checking whether a specific defect has been corrected," "executing the failed test again after the fix."
Do Not Confuse With: Regression testing (checks for unintended side effects elsewhere, not whether the original defect is fixed). This exact confusion is one of the most common ISTQB exam traps — see Section 2.2.3 when you study it for the full comparison.

---

### Question 8 — Type A/D combined: Direct Definition with a MOST-appropriate qualifier

**Difficulty:** 🟢 Level 1

**Question:** Which of the following is the MOST appropriate description of why test objectives can differ between projects?

A. Test objectives are fixed by the ISTQB syllabus and do not vary
B. Test objectives depend on context: the work product, test level, risk, SDLC model, and business factors
C. Test objectives only depend on which programming language is used
D. Test objectives are determined solely by the test manager's personal preference

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
The syllabus explicitly states test objectives vary depending on context — including the work product under test, the test level, risk, the SDLC being followed, and business factors like time-to-market or contractual needs.

**Option-by-Option Analysis**
- A: Incorrect. The syllabus lists typical objectives, but explicitly says they vary by context — they aren't fixed per project.
- B: Correct.
- C: Incorrect. Programming language is not one of the context factors the syllabus lists; this is a plausible-sounding but unsupported distractor.
- D: Incorrect. While a test manager's judgment plays into decisions, "solely personal preference" overstates and misattributes what's actually a context-driven, multi-factor decision.

---

## Weakness Table

Update this after each `/practice 1.1` session or when reviewing answers above.

| Topic | Questions Attempted | Correct | Incorrect | Confidence | Status |
|---|---|---|---|---|---|
| Test objectives (recall) | 0 | 0 | 0 | — | Not yet practiced |
| Testing vs. Debugging | 0 | 0 | 0 | — | Not yet practiced |
| Verification vs. Validation | 0 | 0 | 0 | — | Not yet practiced |
| Static vs. Dynamic testing (intro level) | 0 | 0 | 0 | — | Not yet practiced |
| Confirmation testing vs. Regression testing (forward-reference confusion) | 0 | 0 | 0 | — | Not yet practiced |

## Question Rotation Log

Types used so far: A (Q1, Q8), B (Q2), C (Q3), D (Q4), E (Q5), F (Q6), G (Q7). Not yet used for this chapter: H (calculation — not applicable to 1.1), I (mixed mock — will appear once more chapters exist).

---

## Practice Session - 2026-08-17 - Medium

These questions were added for `/practice 1.1 medium`. In the live chat session, answer them before reading the explanations below.

### Question 9 - Type B: Scenario-Based

**Difficulty:** Level 2

**Question:** A test analyst reviews an API design document and notices that the error response for expired authentication tokens is not defined. Which statement BEST describes this activity?

A. It is debugging, because the analyst found the cause of a future failure  
B. It is testing, because a work product is being evaluated to find defects  
C. It is not testing, because the API has not been executed  
D. It is validation only, because users may care about authentication behavior  

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
Testing is a set of activities used to discover defects and evaluate the quality of test objects. A test object can be a document, design, requirement, user story, or code. Here, the API design document is the test object, and the missing error response is a defect in that work product. Because no software is executed, this is static testing.

**Option-by-Option Analysis**
- A: Incorrect. Debugging means locating and fixing the cause of a known defect or failure in code. The analyst is not diagnosing or fixing code.
- B: Correct. The analyst is evaluating a work product and finding a defect, which is testing.
- C: Incorrect. This is the classic trap: testing is not limited to executing software. Static testing is still testing.
- D: Incorrect. The scenario may later relate to user expectations, but the direct activity described is evaluating a design work product for a missing specification.

**How This Could Be Asked Differently**
The exam may say "reviewing a design," "checking a requirements artifact," or "inspecting a non-executable work product." These all still describe testing when the goal is to find defects or evaluate quality.

**Do Not Confuse With**
Debugging: fixing or diagnosing a known problem in code. Static testing: finding issues without executing the software.

---

### Question 10 - Type D: BEST / Primary Objective

**Difficulty:** Level 2

**Question:** A team performs a focused round of tests on a payment feature before release because a failed payment could lead to regulatory penalties and financial loss. What is the PRIMARY test objective in this scenario?

A. Reducing the risk level of inadequate software quality  
B. Guaranteeing that no defects remain in the payment feature  
C. Debugging the payment feature before release  
D. Replacing the need for legal and regulatory review  

**Result**

Correct Answer: **A**

**Why the Correct Answer Is Correct**
One typical test objective is reducing the risk level of inadequate software quality. The scenario emphasizes the impact of a quality problem: regulatory penalties and financial loss. Testing cannot remove all risk, but it can reduce risk and provide information about whether the remaining risk is acceptable.

**Option-by-Option Analysis**
- A: Correct. The risk focus in the scenario points directly to this objective.
- B: Incorrect. Testing cannot guarantee that no defects remain.
- C: Incorrect. Debugging may happen after failures or defects are found, but the testing objective is not debugging.
- D: Incorrect. Testing may verify compliance-related behavior, but it does not replace legal, regulatory, or contractual review.

**Distractor Analysis**
Option B uses an absolute word, "guaranteeing," which is usually suspicious in testing questions. Option D sounds business-relevant, but it overstates what testing can do.

**How This Could Be Asked Differently**
The exam may use phrases such as "reduce exposure," "lower the chance or impact of poor quality," or "support a release decision for a high-risk area."

---

### Question 11 - Type C: Comparison

**Difficulty:** Level 2

**Question:** During system testing, a tester executes a test case and observes that the system displays the wrong tax amount. A developer later traces the calculation logic, finds an incorrect rounding rule, changes the code, and commits the fix. Which option correctly classifies the activities?

A. The tester performed debugging; the developer performed testing  
B. The tester performed dynamic testing; the developer performed debugging  
C. Both performed testing because both worked with the software  
D. Both performed debugging because a defect was involved  

**Result**

Correct Answer: **B**

**Why the Correct Answer Is Correct**
The tester executed the software and observed a failure, so the tester performed dynamic testing. The developer then located the underlying defect and fixed it, so the developer performed debugging.

**Option-by-Option Analysis**
- A: Incorrect. The classifications are reversed.
- B: Correct. Testing revealed the failure; debugging diagnosed and fixed the cause.
- C: Incorrect. Working with software does not automatically mean testing. The developer's purpose was to locate and remove a known defect.
- D: Incorrect. A defect being involved does not make every related activity debugging.

**How This Could Be Asked Differently**
The exam may describe "executing a test and observing incorrect behavior" for testing, and "tracing code to find the cause" for debugging.

**Do Not Confuse With**
Confirmation testing comes after debugging, when the fixed software is tested again to check that the original failure no longer occurs.

---

### Question 12 - Type E: Negative Question

**Difficulty:** Level 2

**Question:** Which of the following is NOT a typical test objective in ISTQB CTFL v4.0.1?

A. Providing information to stakeholders so they can make informed decisions  
B. Validating whether the test object works as expected by stakeholders  
C. Ensuring required coverage of a test object  
D. Proving that the development process follows the best possible method  

**Result**

Correct Answer: **D**

**Why the Correct Answer Is Correct**
Testing has typical objectives such as providing decision-making information, validating stakeholder expectations, and ensuring required coverage. "Proving that the development process follows the best possible method" is not one of the listed test objectives. It also sounds more like process assessment or quality assurance than testing.

**Option-by-Option Analysis**
- A: This is a typical test objective, so it is not the answer to this negative question.
- B: This is a typical test objective, so it is not the answer.
- C: This is a typical test objective, so it is not the answer.
- D: Correct. It is not a typical test objective.

**Exam Trap Note**
For NOT questions, mark the question as inverted before evaluating the options. Three options may be true, and the answer is the one that is not true.

---

### Question 13 - Type F: Multiple-Statement

**Difficulty:** Level 2

**Question:** Consider these statements about testing and debugging:

I. Testing can reveal failures, but debugging identifies and removes the defect that caused a known failure.  
II. After a developer fixes a defect, re-running the previously failed test is still debugging because it checks the fix.  

Which option is correct?

A. Only I is correct  
B. Only II is correct  
C. Both I and II are correct  
D. Neither I nor II is correct  

**Result**

Correct Answer: **A**

**Why the Correct Answer Is Correct**
Statement I correctly distinguishes testing from debugging. Statement II is false because re-running a previously failed test after a fix is confirmation testing, which is a testing activity. Debugging is the developer's activity of diagnosing and fixing the defect.

**Option-by-Option Analysis**
- A: Correct. I is true and II is false.
- B: Incorrect. II is false because checking a fix by re-running a test is testing, not debugging.
- C: Incorrect. II makes a common but important classification error.
- D: Incorrect. I is correct.

**How This Could Be Asked Differently**
The exam may use "re-testing," "checking whether the original problem has been fixed," or "running the failed test again after correction." These describe confirmation testing, not debugging.

**Do Not Confuse With**
Regression testing checks whether the change broke something else. Confirmation testing checks whether the original defect was fixed. Both are testing activities.
 
