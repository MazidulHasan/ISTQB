# ISTQB CTFL v4.0.1 Syllabus Outline (Reference)

Hand-curated from the official syllabus PDF (`resources/ISTQB_CTFL_Syllabus_v4.0.1.pdf`, released 2024-09-15, 78 pages). This is the **authoritative structure and scope** for this whole study project — `syllabus/progress.md` and every `chapters/{chapter}/` folder are named after these section numbers.

If anything in the older helper book (`resources/Foundations-of-software-testing---ISTQB-Certification.pdf`) conflicts with this outline, this outline wins — the book targets an older syllabus edition.

K-levels: **K1** = Remember, **K2** = Understand, **K3** = Apply. All chapter content is at minimum K1 (recall/recognize a keyword or concept) even where not explicitly listed below; the specific K-level given is the ceiling to prepare for.

For full paragraph-level detail, search `resources/istqb-ctfl-syllabus-v4.0.1.extracted.txt` (plain-text extraction of the same PDF, page markers included) or the PDF itself.

---

## Chapter 1: Fundamentals of Testing — 180 minutes

**Keywords:** coverage, debugging, defect, error, failure, quality, quality assurance, root cause, test analysis, test basis, test case, test completion, test condition, test control, test data, test design, test execution, test implementation, test monitoring, test object, test objective, test planning, test procedure, test process, test result, testing, testware, traceability, validation, verification

| Section | Title | Learning Objectives |
|---|---|---|
| 1.1 | What is Testing? | FL-1.1.1 (K1) Identify typical test objectives · FL-1.1.2 (K2) Differentiate testing from debugging |
| 1.2 | Why is Testing Necessary? | FL-1.2.1 (K2) Exemplify why testing is necessary · FL-1.2.2 (K1) Recall the relation between testing and quality assurance · FL-1.2.3 (K2) Distinguish between root cause, error, defect, and failure |
| 1.3 | Testing Principles | FL-1.3.1 (K2) Explain the seven testing principles |
| 1.4 | Test Activities, Testware and Test Roles | FL-1.4.1 (K2) Explain the different test activities and related tasks · FL-1.4.2 (K2) Explain the impact of context on the test process · FL-1.4.3 (K2) Differentiate the testware that supports the test activities · FL-1.4.4 (K2) Explain the value of maintaining traceability · FL-1.4.5 (K2) Compare the different roles in testing |
| 1.5 | Essential Skills and Good Practices in Testing | FL-1.5.1 (K2) Give examples of the generic skills required for testing · FL-1.5.2 (K1) Recall the advantages of the whole team approach · FL-1.5.3 (K2) Distinguish the benefits and drawbacks of independence of testing |

> Note: v4.0.1 does **not** have separate "Psychology of Testing" or "Code of Ethics" sections (those existed in older CTFL editions, incl. the helper book). Psychology-of-testing content now lives inside 1.5, and there is no dedicated ethics section in the FL v4.0.1 syllabus body.

## Chapter 2: Testing Throughout the Software Development Lifecycle — 130 minutes

**Keywords:** acceptance testing, black-box testing, component integration testing, component testing, confirmation testing, functional testing, integration testing, maintenance testing, non-functional testing, regression testing, shift left, system integration testing, system testing, test level, test object, test type, white-box testing

| Section | Title | Learning Objectives |
|---|---|---|
| 2.1 | Testing in the Context of a Software Development Lifecycle (SDLC) | FL-2.1.1 (K2) Explain the impact of the chosen SDLC on testing · FL-2.1.2 (K1) Recall good testing practices that apply to all SDLCs · FL-2.1.3 (K1) Recall examples of test-first approaches to development · FL-2.1.4 (K2) Summarize how DevOps might impact testing · FL-2.1.5 (K2) Explain shift left · FL-2.1.6 (K2) Explain how retrospectives can be used for process improvement |
| 2.2 | Test Levels and Test Types | FL-2.2.1 (K2) Distinguish the different test levels · FL-2.2.2 (K2) Distinguish the different test types · FL-2.2.3 (K2) Distinguish confirmation testing from regression testing |
| 2.3 | Maintenance Testing | FL-2.3.1 (K2) Summarize maintenance testing and its triggers |

## Chapter 3: Static Testing — 80 minutes

**Keywords:** anomaly, dynamic testing, formal review, informal review, inspection, review, static analysis, static testing, technical review, walkthrough

| Section | Title | Learning Objectives |
|---|---|---|
| 3.1 | Static Testing Basics | FL-3.1.1 (K1) Recognize types of work products examinable by static testing · FL-3.1.2 (K2) Explain the value of static testing · FL-3.1.3 (K2) Compare and contrast static testing and dynamic testing |
| 3.2 | Feedback and Review Process | FL-3.2.1 (K1) Identify the benefits of early and frequent stakeholder feedback · FL-3.2.2 (K2) Summarize the activities of the review process · FL-3.2.3 (K1) Recall which responsibilities are assigned to the principal roles when performing reviews · FL-3.2.4 (K2) Compare and contrast the different review types · FL-3.2.5 (K1) Recall the factors that contribute to a successful review |

## Chapter 4: Test Analysis and Design — 390 minutes

**Keywords:** acceptance criteria, acceptance test-driven development, black-box test technique, boundary value analysis, branch coverage, checklist-based testing, collaboration-based test approach, coverage, coverage item, decision table testing, equivalence partitioning, error guessing, experience-based test technique, exploratory testing, state transition testing, statement coverage, test technique, white-box test technique

| Section | Title | Learning Objectives |
|---|---|---|
| 4.1 | Test Techniques Overview | FL-4.1.1 (K2) Distinguish black-box, white-box, and experience-based test techniques |
| 4.2 | Black-Box Test Techniques | FL-4.2.1 (K3) Use equivalence partitioning to derive test cases · FL-4.2.2 (K3) Use boundary value analysis to derive test cases · FL-4.2.3 (K3) Use decision table testing to derive test cases · FL-4.2.4 (K3) Use state transition testing to derive test cases |
| 4.3 | White-Box Test Techniques | FL-4.3.1 (K2) Explain statement testing · FL-4.3.2 (K2) Explain branch testing · FL-4.3.3 (K2) Explain the value of white-box testing |
| 4.4 | Experience-Based Test Techniques | FL-4.4.1 (K2) Explain error guessing · FL-4.4.2 (K2) Explain exploratory testing · FL-4.4.3 (K2) Explain checklist-based testing |
| 4.5 | Collaboration-Based Test Approaches | FL-4.5.1 (K2) Explain how to write user stories in collaboration with developers/business reps · FL-4.5.2 (K2) Classify the different options for writing acceptance criteria · FL-4.5.3 (K3) Use acceptance test-driven development (ATDD) to derive test cases |

> This is the largest and most heavily weighted chapter (390 of 1135 minutes, ~34%) — includes all K3 "apply/calculate" learning objectives except two in Chapter 5. Prioritize it.

## Chapter 5: Managing the Test Activities — 335 minutes

**Keywords:** defect management, defect report, entry criteria, exit criteria, product risk, project risk, risk, risk analysis, risk assessment, risk control, risk identification, risk level, risk management, risk mitigation, risk monitoring, risk-based testing, test approach, test completion report, test control, test monitoring, test plan, test planning, test progress report, test pyramid, test strategy, testing quadrants

| Section | Title | Learning Objectives |
|---|---|---|
| 5.1 | Test Planning | FL-5.1.1 (K2) Exemplify the purpose and content of a test plan · FL-5.1.2 (K1) Recognize how a tester adds value to iteration/release planning · FL-5.1.3 (K2) Compare and contrast entry criteria and exit criteria · FL-5.1.4 (K3) Use estimation techniques to calculate required test effort · FL-5.1.5 (K3) Apply test case prioritization · FL-5.1.6 (K1) Recall the concepts of the test pyramid · FL-5.1.7 (K2) Summarize the testing quadrants and their relationships with test levels/types |
| 5.2 | Risk Management | FL-5.2.1 (K1) Identify risk level using risk likelihood and risk impact · FL-5.2.2 (K2) Distinguish between project risks and product risks · FL-5.2.3 (K2) Explain how product risk analysis may influence thoroughness/test scope · FL-5.2.4 (K2) Explain what measures can be taken in response to analyzed product risks |
| 5.3 | Test Monitoring, Test Control and Test Completion | FL-5.3.1 (K1) Recall metrics used for testing · FL-5.3.2 (K2) Summarize the purposes, content, and audiences for test reports · FL-5.3.3 (K2) Exemplify how to communicate the status of testing |
| 5.4 | Configuration Management | FL-5.4.1 (K2) Summarize how configuration management supports testing |
| 5.5 | Defect Management | FL-5.5.1 (K3) Prepare a defect report |

## Chapter 6: Test Tools — 20 minutes

**Keywords:** test automation

| Section | Title | Learning Objectives |
|---|---|---|
| 6.1 | Tool Support for Testing | FL-6.1.1 (K2) Explain how different types of test tools support testing |
| 6.2 | Benefits and Risks of Test Automation | FL-6.2.1 (K1) Recall the benefits and risks of test automation |

> Shortest chapter (20 of 1135 minutes) but still fully examinable — do not skip it.

---

## Non-Examinable

Per syllabus section 0.6: the Introduction (chapter 0) and Appendices are **not examinable**. Chapters 1–6 are all examinable in full. Standards/books referenced in Chapter 7 (References) are not examinable beyond what the syllabus itself summarizes from them.

## Exam Weight (by chapter, minutes of instruction time)

| Chapter | Minutes | Share |
|---|---|---|
| 1. Fundamentals of Testing | 180 | 15.9% |
| 2. Testing Throughout the SDLC | 130 | 11.5% |
| 3. Static Testing | 80 | 7.0% |
| 4. Test Analysis and Design | 390 | 34.4% |
| 5. Managing the Test Activities | 335 | 29.5% |
| 6. Test Tools | 20 | 1.8% |
| **Total** | **1135** | 100% |

Instruction-time weighting is a reasonable proxy for exam emphasis, but treat it as a study-prioritization hint, not an official per-chapter question-count guarantee — always refer to ISTQB's own "Exam Structure" documents for the exact rules if precision matters.
