// 7 YouTube Video Training Companion for Apollo RCA & RealityCharting Methodology
// Features: Toolbar button (? Help-style), Floating Action Button,
// Slide-out Video Training Drawer, 7 Step Video Cards with responsive 16:9
// YouTube player embeds, duration badges, methodology summaries, and configurable URLs.

export const STORAGE_KEY = 'h2c-youtube-training-videos-v2';
export const LEGACY_STORAGE_KEY = 'h2c-youtube-training-videos-v1';
export const SYNC_VERSION = 'v18-20261108';
export const SYNC_KEY = 'h2c-yt-sync-ver';

export const OFFICIAL_CHANNEL_URL = 'https://www.youtube.com/@h2c_Learnings';

export const OFFICIAL_VIDEOS = {
  1: { id: 'IXXgr85wO74', duration: '55:50', tier: 'Full Masterclass' },
  2: { id: 'tCQuu_rvSJ8', duration: '20:22', tier: 'Deep Dive' },
  3: { id: '8y501jMIS7k', duration: '07:57', tier: 'Focused Guide' },
  4: { id: 'lppZuZFyHzM', duration: '06:59', tier: 'Essential Lab' },
  5: { id: 'yBVaGu31ik8', duration: '08:45', tier: 'Action Framework' },
  6: { id: 'lj2e9A-qmVA', duration: '08:19', tier: 'Culture & Alignment' },
  7: { id: '_w5WUcNRYWU', duration: '07:10', tier: 'Proactive Mastery' }
};

export const VIDEO_MODULES = [
  {
    step: 1,
    episode: 'Episode 1 of 7',
    tier: 'Full Masterclass',
    badgeText: '55:50 • Full Masterclass',
    verified: true,
    part: 'Part 1: Foundations',
    title: 'Episode 1 of 7: Introduction & Fundamentals of Apollo Root Cause Analysis (The Root Cause Myth)',
    shortTitle: 'Introduction & Fundamentals',
    subtitle: 'The Root Cause Myth, causal principles, and foundational Apollo RCA thinking',
    duration: '55:50',
    defaultYtId: 'IXXgr85wO74', // Official Video 1: https://youtu.be/IXXgr85wO74
    targetId: 'section-define',
    bookRef: 'RC Introduction & Chs. 1–3 (pp. 13–69); AR Ch. 1 (pp. 5–34), Ch. 2 (pp. 35–54), Appendix (pp. 167–173)',
    summary: 'Dismantle the single root cause myth: problems are never caused by a single isolated event, but by a confluence of necessary and sufficient causes. Master how to establish a "common reality" through evidence-based relationships, why Fishbone and 5 Whys fail by categorizing instead of charting causes, and internalize the Four Fundamental Principles of Cause and Effect.',
    objectives: [
      'Explain "common reality" vs. conflicting individual perceptions (RC Intro, pp. 13–14).',
      'Identify the 3 strategies that set us up to fail: common sense, storytelling, and categorizing (RC Ch. 1, p. 16).',
      'Explain the root cause myth: root causes are secondary to and contingent upon chosen solutions (RC Ch. 1, p. 33).',
      'Evaluate RCA methods using Gano\'s 6 criteria and explain why categories are not causes (RC Ch. 2, pp. 38–45).',
      'State the Four Principles of Cause and Effect and define actions, conditions, and causal sets (RC Ch. 3, pp. 51–69).'
    ],
    keyPoints: [
      'Common Reality: "There is no single reality, but you will learn how to create a common reality by defining evidenced-based causal relationships" (RC Intro, p. 13). Conflicts stem from a clash of individual realities.',
      'Set Up to Fail: "We typically rely on what we believe to be common sense, storytelling, and categorizing to resolve our problems" (RC Ch. 1, p. 16). Linear thinking ("why, why, why") falsely assumes A caused B caused C.',
      'Root Cause Myth: "Root causes are secondary to and contingent upon the solutions, not the object of our search" (RC Ch. 1, p. 33). The number of causes doubles with each why.',
      'Categories vs. Causes: "Knowing the category provides no value whatsoever" (RC Ch. 2, p. 45). "Causes are to categories what cookies are to the cookie jar" (AR Appendix, p. 167).',
      'The Four Principles (RC Ch. 1, p. 34; AR Ch. 2, pp. 35–36): (1) Cause and effect are the same thing; (2) Causes and effects are part of an infinite continuum; (3) Each effect has at least two causes (action and condition); (4) An effect exists only if its causes exist at the same point in space and time.',
      'Causal Set & Point of Ignorance: An action interacts with a condition prior in time. "Our point of ignorance is where we can honestly admit we don\'t know why" (RC Ch. 3, p. 57).'
    ],
    bookExamples: [
      'Frank\'s Lighting Quality Circle: "I hear a problem and a solution in the same sentence" — outcome: no additional lights needed (AR Ch. 1, pp. 9–10).',
      'The Fire Root Cause: Ignition source vs. combustible material vs. oxygen — whichever cause your solution acts upon becomes "the" root cause (AR Ch. 1, pp. 16–17; RC Ch. 1, p. 33).',
      'Car Struck (Crash): Fishbone categorization vs. Realitychart causal paths (RC Ch. 2, pp. 43–45; AR Appendix, pp. 171–172).',
      'The Dropped Spoon: Gravity, high chair height, and letting go co-existing at the same time and space frame (RC Ch. 3, pp. 52–53, 60).',
      'The Injury Chain: Injury ← Fall ← Slipped ← Wet Surface ← Leaky Valve ← Seal Failure ← Not Maintained (RC Ch. 3, p. 54).'
    ],
    youtubeOutline: [
      '00:00 - Hook: Frank\'s lights quality circle (AR Ch. 1) & the high-chair spoon drop',
      '03:00 - Segment 1: No single reality, only a common reality (RC Intro, pp. 13–14)',
      '07:00 - Segment 2: The 3 failed strategies: common sense, storytelling, categorizing (RC Ch. 1, pp. 16–27)',
      '15:00 - Segment 3: The fire triangle & dismantling the root cause myth (RC Ch. 1, p. 33)',
      '25:00 - Segment 4: Why Fishbone & 5 Whys fail: Gano\'s 6 RCA criteria (RC Ch. 2, pp. 37–50)',
      '38:00 - Segment 5: The Four Principles of Cause and Effect & the Injury Chain (RC Ch. 3, pp. 51–69)',
      '50:00 - Segment 6: Action, Condition & Causal Sets on the sticky-note board',
      '54:00 - Close: Seven Steps roadmap, quiz card, and citation references'
    ],
    fullDescription: `Episode 1 of 7: Introduction & Fundamentals of Apollo Root Cause Analysis (The Root Cause Myth)
Series: Thinking in Causes — A YouTube Series on Dean L. Gano's RealityCharting® for h2c_Learnings
Duration: 55:50 | Official URL: https://youtu.be/IXXgr85wO74

📌 LESSON PLAN ALIGNMENT: PART 1 — FOUNDATIONS
Main Text: Dean L. Gano, RealityCharting® (2011), Introduction & Chs. 1–3, pp. 13–69.
Support Text: Dean L. Gano, Apollo Root Cause Analysis (2003), Ch. 1 (pp. 5–34), Ch. 2 (pp. 35–54), Appendix (pp. 167–173).

🎯 IN THIS EPISODE:
Why do recurring problems keep happening in organizations despite endless investigations? In this foundational masterclass, we dismantle the "Single Root Cause Myth" and uncover why conventional tools (Five Whys, Fishbone diagrams, and fill-in forms) fail by relying on storytelling and categorization. Learn how to establish a "common reality" through evidence-based causal relationships and master the Four Fundamental Principles of Cause and Effect.

⏱ CHAPTERS & TIMESTAMPS:
00:00 Hook: Frank's lights story & the dropped spoon
03:00 Segment 1: No single reality, only a common reality (RC Intro, pp. 13–14)
07:00 Segment 2: The 3 failed strategies: common sense, storytelling, categorizing (RC Ch. 1, pp. 16–27)
15:00 Segment 3: The fire triangle & dismantling the root cause myth (RC Ch. 1, p. 33)
25:00 Segment 4: Why Fishbone & 5 Whys fail: Gano's 6 RCA criteria (RC Ch. 2, pp. 37–50)
38:00 Segment 5: The Four Principles of Cause and Effect & the Injury Chain (RC Ch. 3, pp. 51–69)
50:00 Segment 6: Action, Condition & Causal Sets on the sticky-note board
54:00 Close: Seven Steps roadmap, quiz card, and citation references

🔑 CORE BOOK CONCEPTS & DIRECT QUOTES:
• Common Reality: "there is no single reality, but you will learn how to create a common reality by defining evidenced-based causal relationships" (RC, Intro, p. 13).
• Set Up to Fail: "We typically rely on what we believe to be common sense, storytelling, and categorizing to resolve our problems." (RC, Ch. 1, p. 16). Linear thinking falsely assumes A caused B caused C.
• Root Cause Myth: "root causes are secondary to and contingent upon the solutions, not the object of our search." (RC, Ch. 1, p. 33).
• Categories vs. Causes: "knowing the category provides no value whatsoever" (RC, Ch. 2, p. 45). "Causes are to categories what cookies are to the cookie jar" (AR, Appendix, p. 167).
• The Four Principles (RC, Ch. 1, p. 34; AR, Ch. 2, pp. 35–36):
  1. Cause and effect are the same thing.
  2. Causes and effects are part of an infinite continuum of causes.
  3. Each effect has at least two causes in the form of actions and conditions.
  4. An effect exists only if its causes exist at the same point in time and space.
• Causal Set: "Actions are causes that interact with conditions to cause an effect. Conditions are causes that exist in time prior to an action bringing them together to cause an effect." (RC, Ch. 3, p. 55).
• Point of Ignorance: "Our point of ignorance is where we can honestly admit we don't know why." (RC, Ch. 3, p. 57).

📖 CASE STUDIES DISCUSSED:
• Frank's lighting quality circle: "I hear a problem and a solution in the same sentence" — outcome: no additional lights needed (AR, Ch. 1, pp. 9–10)
• The open fire root cause: ignition source vs. combustible material vs. oxygen (AR, Ch. 1, pp. 16–17; RC, Ch. 1, p. 33)
• The arsonist story: leaving out oxygen and fuel (RC, Ch. 1, p. 24)
• Car Struck: fishbone vs. Realitychart (RC, Ch. 2, p. 45)
• The dropped spoon from the high chair (RC, Ch. 3, pp. 52–53)
• The injury chain (RC, Ch. 3, p. 54)

⚖️ LEGAL & TRADEMARK ATTRIBUTION:
"Apollo Root Cause Analysis", "Apollo RCA", "Reality Tree", and "RealityCharting®" are registered trademarks of Dean L. Gano and Apollonian Publications, LLC. This educational video series is an independent open-source learning project for h2c_Learnings and is not affiliated with, endorsed by, or sponsored by Dean L. Gano or Apollonian Publications. All references are made under Nominative Fair Use (15 U.S.C. § 1125). For certified enterprise training and official software, visit: https://realitycharting.com/home/

#RootCauseAnalysis #ApolloRCA #RealityCharting #ProblemSolving #Engineering #h2c_Learnings`
  },
  {
    step: 2,
    episode: 'Episode 2 of 7',
    tier: 'Deep Dive',
    badgeText: '20:22 • Deep Dive',
    verified: true,
    part: 'Part 2: Step 1, Define the Problem',
    title: 'Episode 2 of 7: Defining the Problem — The 4-Element Formula Without Placing Blame',
    shortTitle: 'Defining the Problem',
    subtitle: 'The 4-Element Formula (What, Where, When, Significance) without placing blame',
    duration: '20:22',
    defaultYtId: 'tCQuu_rvSJ8', // Official Video 2: https://youtu.be/tCQuu_rvSJ8
    targetId: 'section-define',
    bookRef: 'RC Ch. 4 (pp. 70–77); AR Ch. 3 (pp. 61–66)',
    summary: 'Master Step 1 of the Seven Steps: defining the problem using the 4-element formula without placing blame or asking "why". Learn why 95% of problem-solving efforts fail at the definition stage, how to craft a precise noun-verb primary effect, and why quantifying significance (cost, safety, frequency) is the most critical element that determines investigation depth.',
    objectives: [
      'Write a complete four-element problem definition (What, When, Where, Significance) (RC Ch. 4, p. 70).',
      'State the primary effect as an observed noun-verb outcome (2–4 words) without cause or blame (RC Ch. 4, p. 73).',
      'Apply the Zero Blame rule by eliminating "Who" and "Why" questions during definition (RC Ch. 4, pp. 70–75).',
      'Quantify significance specifically (cost, safety, frequency) to determine analysis depth (RC Ch. 4, pp. 73–74).'
    ],
    keyPoints: [
      'The 4 Elements: "A complete problem definition should include four elements: What is the problem? When did it happen? Where did it happen? What is the significance of the problem?" (RC Ch. 4, p. 70).',
      'No Who, No Why: "Who questions lead to placing blame and are generally a waste of time. Why questions are reserved for the analysis phase" (RC Ch. 4, p. 70). The only valid who question: "Who knows the answer to my other questions?" (p. 75).',
      'Primary Effect: "A noun-verb statement such as \'Clock Stopped,\' \'Arm Broken,\' \'System Failed\'" in 2 to 4 words (RC Ch. 4, p. 73).',
      'Significance: Usually "cost, safety, and frequency." It is "perhaps the most important element of defining the problem" because it determines the depth of analysis (RC Ch. 4, pp. 73–74). Be specific: "lost use of hand," not "injury" (p. 74).',
      'The 95% Failure Rule: Problem solvers fail to define the problem well "about 95% of the time" because they assume causes or embed solutions into the problem statement (RC Ch. 4, p. 72).'
    ],
    bookExamples: [
      'The Cartoon Meeting: Everyone arrives "knowing" the cause before examining facts (RC Ch. 4, pp. 71–72).',
      'The Broken Wrist: Once in 30 years of skiing vs. a pro football player\'s third break — significance decides depth (RC Ch. 4, p. 74).',
      'The Waste Spill & Secondary Containment (RC Ch. 4, p. 75).',
      'AR Clock Definition: "What: Clock stopped / When: 10:32, after it fell / Where: The swimming pool by the tennis courts / Significance: The swimmers cannot train effectively" (AR Ch. 3, p. 64).'
    ],
    youtubeOutline: [
      '00:00 - Hook: The cartoon meeting where everyone argues causes (RC Ch. 4, pp. 71–72)',
      '03:00 - Segment 1: The Four Elements: What, When, Where, Significance (RC Ch. 4, p. 70)',
      '07:30 - Segment 2: Eliminating "Who" and "Why" — why blame destroys investigations (RC Ch. 4, pp. 70–75)',
      '12:00 - Segment 3: Crafting the Primary Effect (Noun-Verb format; AR Ch. 3, p. 64)',
      '16:30 - Segment 4: Significance decides investigation depth (The Broken Wrist; RC Ch. 4, p. 74)',
      '20:00 - Close: Live rewrite exercise & comment challenge'
    ],
    fullDescription: `Episode 2 of 7: Defining the Problem — The 4-Element Formula Without Placing Blame
Series: Thinking in Causes — A YouTube Series on Dean L. Gano's RealityCharting® for h2c_Learnings
Duration: 20:22 | Official URL: https://youtu.be/tCQuu_rvSJ8

📌 LESSON PLAN ALIGNMENT: PART 2 — STEP 1, DEFINE THE PROBLEM
Main Text: Dean L. Gano, RealityCharting® (2011), Ch. 4, pp. 70–77.
Support Text: Dean L. Gano, Apollo Root Cause Analysis (2003), Ch. 3, pp. 61–66.

🎯 IN THIS EPISODE:
Why do organizations fail to define the problem well 95% of the time? In Step 1 of Gano's Seven Steps, learn the battle-tested 4-element formula: What (Primary Effect), When, Where, and Significance. Discover why "Who" and "Why" questions must be strictly banished from problem definitions, how to write crisp noun-verb statements in 2–4 words, and why quantifying significance is the single most important decision determining how deep your investigation should go.

⏱ CHAPTERS & TIMESTAMPS:
00:00 Hook: The cartoon meeting where everyone argues causes (RC Ch. 4, pp. 71–72)
03:00 Segment 1: The Four Elements: What, When, Where, Significance (RC Ch. 4, p. 70)
07:30 Segment 2: Eliminating "Who" and "Why" — why blame destroys investigations (RC Ch. 4, pp. 70–75)
12:00 Segment 3: Crafting the Primary Effect (Noun-Verb format; AR Ch. 3, p. 64)
16:30 Segment 4: Significance decides investigation depth (The Broken Wrist; RC Ch. 4, p. 74)
20:00 Close: Live rewrite exercise & comment challenge

🔑 CORE BOOK CONCEPTS & DIRECT QUOTES:
• Four Elements: "A complete problem definition should include four elements: What is the problem? When did it happen? Where did it happen? What is the significance of the problem?" (RC, Ch. 4, p. 70).
• No Who, No Why: "Who questions lead to placing blame and are generally a waste of time. Why questions are reserved for the analysis phase" (RC, Ch. 4, p. 70).
• The Permissible Who: "The only acceptable who question is, 'Who knows the answer to my other questions?'" (RC, Ch. 4, p. 75).
• Primary Effect: "a noun-verb statement such as 'Clock Stopped,' 'Arm Broken,' 'System Failed'" (RC, Ch. 4, p. 73).
• Significance: Usually "cost, safety, and frequency." It is "perhaps the most important element of defining the problem" (RC, Ch. 4, p. 73). Be specific: "lost use of hand," not "injury" (RC, Ch. 4, p. 74).
• The 95% Rule: We fail to define the problem well "about 95% of the time" (RC, Ch. 4, p. 72).

📖 CASE STUDIES DISCUSSED:
• The cartoon meeting with preconceptions (RC, Ch. 4, pp. 71–72)
• The broken wrist: skier vs. pro football player (RC, Ch. 4, p. 74)
• The waste spill and containment failure (RC, Ch. 4, p. 75)
• The fallen pool clock definition (AR, Ch. 3, p. 64)

⚖️ LEGAL & TRADEMARK ATTRIBUTION:
"Apollo Root Cause Analysis", "Apollo RCA", "Reality Tree", and "RealityCharting®" are registered trademarks of Dean L. Gano and Apollonian Publications, LLC. This educational video series is an independent open-source learning project for h2c_Learnings and is not affiliated with, endorsed by, or sponsored by Dean L. Gano or Apollonian Publications. All references are made under Nominative Fair Use (15 U.S.C. § 1125). For certified enterprise training and official software, visit: https://realitycharting.com/home/

#ProblemDefinition #RootCauseAnalysis #ApolloRCA #RealityCharting #ZeroBlame #h2c_Learnings`
  },
  {
    step: 3,
    episode: 'Episode 3 of 7',
    tier: 'Focused Guide',
    badgeText: '07:57 • Focused Guide',
    verified: true,
    part: 'Part 3: Steps 2–3, Causal Relationships and the RealityChart',
    title: 'Episode 3 of 7: Causal Relationships & The RealityChart (Actions, Conditions, and Stop Reasons)',
    shortTitle: 'Causal Relationships & RealityChart',
    subtitle: 'Actions, Conditions, Cause Sets, AND/OR logic gates, and Stop Reasons',
    duration: '07:57',
    defaultYtId: '8y501jMIS7k', // Official Video 3: https://youtu.be/8y501jMIS7k
    targetId: 'realitychart',
    bookRef: 'RC Chs. 5–6 (pp. 78–96); AR Ch. 3 (pp. 67–74, 81–87)',
    summary: 'Construct the Realitychart backwards from the primary effect using the 4-part process. Discover why distinguishing actions from conditions reveals what is missing, how to perform the Square One Loop, when to place a question mark ("?"), and how to legitimately terminate causal paths with the Four Stop Reasons.',
    objectives: [
      'Build a Realitychart using the 4-part process and "Caused By" statements (RC Ch. 5, p. 79).',
      'Pair action causes with condition causes at each causal step (RC Ch. 5, p. 83).',
      'Execute the Square One Loop to follow cause paths to the point of ignorance (RC Ch. 5, p. 87).',
      'Apply question marks ("?") for unknown causes and stop reasons for valid endpoints (RC Ch. 5, p. 89).',
      'Explain why there is no single correct chart for a given event (RC Ch. 6, p. 94).'
    ],
    keyPoints: [
      'The 4-Part Process: "1. For each primary effect, ask why. 2. Look for causes in actions and conditions. 3. Connect all causes with \'Caused By\' statements. 4. End each cause path with a question mark or a reason for stopping." (RC Ch. 5, p. 79; AR Ch. 3, p. 67).',
      'Actions vs. Conditions: "The only value of knowing if a cause is an action or a condition is that it tells us which one is missing" (RC Ch. 5, p. 83). "The best solutions are usually associated with conditional causes" (p. 86).',
      'Finding Missing Conditions: Add "exists" to the action\'s noun (RC Ch. 12, p. 151). Keep cause statements as noun-verb in 4 or fewer words (p. 171).',
      'The Square One Loop: "Following each cause path in a Realitychart until the collective point of ignorance is reached, and then starting over again with the primary effect (square one) and repeating the process" (RC Ch. 5, p. 87).',
      'The Four Stop Reasons (RC Ch. 5, p. 89): (1) Desired Condition; (2) Lack of Control; (3) New Primary Effect; (4) Other Cause Paths More Productive. "Only one in twenty people are capable of admitting they don\'t know the answer" (p. 89).',
      'No Single Correct Chart: "There is no single correct cause-and-effect chart for a given event. We are not trying to find the truth or the mythical root cause. We are trying to identify effective solutions." (RC Ch. 6, p. 94). Look for answers in people, procedures, and hardware; look for differences.'
    ],
    bookExamples: [
      'The Lost Game Realitychart: Opponents Scored More Points + Fewer Points Loses (STOP Desired Condition) ← Failed To Stop Goals (?) + Opponents Better Players (STOP Desired Condition / Other Paths More Productive) (RC Ch. 6, p. 92).',
      'Open fire with match strike, combustible material, oxygen (RC Ch. 5, p. 83).'
    ],
    youtubeOutline: [
      '00:00 - Hook: "Why did we lose the game?" Building the Lost Game chart (RC Ch. 6, p. 92)',
      '01:45 - Segment 1: The 4-Part Process and "Caused By" connections (RC Ch. 5, p. 79)',
      '03:30 - Segment 2: Action vs Condition pairing: The missing condition trick (add "exists") (RC Ch. 5, p. 83; Ch. 12, p. 151)',
      '05:15 - Segment 3: Square One Loop & The Four Stop Reasons (RC Ch. 5, pp. 87–89)',
      '06:45 - Segment 4: Why there is no "single correct chart" (RC Ch. 6, p. 94)',
      '07:20 - Close: Sticky-note Realitychart practice prompt'
    ],
    fullDescription: `Episode 3 of 7: Causal Relationships & The RealityChart (Actions, Conditions, and Stop Reasons)
Series: Thinking in Causes — A YouTube Series on Dean L. Gano's RealityCharting® for h2c_Learnings
Duration: 07:57 | Official URL: https://youtu.be/8y501jMIS7k

📌 LESSON PLAN ALIGNMENT: PART 3 — STEPS 2–3, CAUSAL RELATIONSHIPS AND THE REALITYCHART
Main Text: Dean L. Gano, RealityCharting® (2011), Chs. 5–6, pp. 78–96.
Support Text: Dean L. Gano, Apollo Root Cause Analysis (2003), Ch. 3, pp. 67–74, 81–87.

🎯 IN THIS EPISODE:
How do you build a graphical Realitychart that maps the full causal reality of an event? In Steps 2 & 3 of Gano's Seven Steps, master the 4-part process: asking why, pairing actions with conditions, connecting causes with "Caused By" statements, and closing cause paths. Discover the Square One Loop, the "exists" rule for discovering missing conditions, and how to properly terminate branches using the Four Stop Reasons without arguing over "one correct chart."

⏱ CHAPTERS & TIMESTAMPS:
00:00 Hook: "Why did we lose the game?" Building the Lost Game chart (RC Ch. 6, p. 92)
01:45 Segment 1: The 4-Part Process and "Caused By" connections (RC Ch. 5, p. 79)
03:30 Segment 2: Action vs Condition pairing: The missing condition trick (add "exists") (RC Ch. 5, p. 83; Ch. 12, p. 151)
05:15 Segment 3: Square One Loop & The Four Stop Reasons (RC Ch. 5, pp. 87–89)
06:45 Segment 4: Why there is no "single correct chart" (RC Ch. 6, p. 94)
07:20 Close: Sticky-note Realitychart practice prompt

🔑 CORE BOOK CONCEPTS & DIRECT QUOTES:
• The 4-Part Process: "1. For each primary effect, ask why. 2. Look for causes in actions and conditions. 3. Connect all causes with 'Caused By' statements. 4. End each cause path with a question mark or a reason for stopping." (RC, Ch. 5, p. 79).
• Actions vs. Conditions: "The only value of knowing if a cause is an action or a condition is that it tells us which one is missing" (RC, Ch. 5, p. 83). "The best solutions are usually associated with conditional causes" (RC, Ch. 5, p. 86).
• Square One Loop: "following each cause path in a Realitychart until the collective point of ignorance is reached, and then starting over again with the primary effect (square one) and repeating the process" (RC, Ch. 5, p. 87).
• Four Stop Reasons (RC, Ch. 5, p. 89): Desired Condition, Lack of Control, New Primary Effect, Other Cause Paths More Productive.
• Point of Ignorance: "Only one in twenty people are capable of admitting they don't know the answer" (RC, Ch. 5, p. 89).
• No Single Correct Chart: "there is no single correct cause-and-effect chart for a given event. We are not trying to find the truth or the mythical root cause. We are trying to identify effective solutions." (RC, Ch. 6, p. 94).
• Wording Hint: To find a missing condition, add "exists" to the action's noun (RC, Ch. 12, p. 151). Write cause statements in noun-verb format, four or fewer words (RC, Ch. 12, p. 171).

📖 CASE STUDIES DISCUSSED:
• The Lost Game Realitychart (RC, Ch. 6, p. 92)
• Open Fire causal sets with matches, fuel, oxygen (RC, Ch. 5, p. 83)

⚖️ LEGAL & TRADEMARK ATTRIBUTION:
"Apollo Root Cause Analysis", "Apollo RCA", "Reality Tree", and "RealityCharting®" are registered trademarks of Dean L. Gano and Apollonian Publications, LLC. This educational video series is an independent open-source learning project for h2c_Learnings and is not affiliated with, endorsed by, or sponsored by Dean L. Gano or Apollonian Publications. All references are made under Nominative Fair Use (15 U.S.C. § 1125). For certified enterprise training and official software, visit: https://realitycharting.com/home/

#RealityCharting #ApolloRCA #CausalRelationships #RealityTree #Engineering #h2c_Learnings`
  },
  {
    step: 4,
    episode: 'Episode 4 of 7',
    tier: 'Essential Lab',
    badgeText: '06:59 • Essential Lab',
    verified: true,
    part: 'Part 4: Steps 4–5, Evidence; Sufficient and Necessary',
    title: 'Episode 4 of 7: Evidence; Sufficient and Necessary — How to Test and Prove Causes',
    shortTitle: 'Evidence: Sufficient & Necessary',
    subtitle: 'Necessary & sufficient testing, 4 quality tiers, proving and corroborating causes',
    duration: '06:59',
    defaultYtId: 'lppZuZFyHzM', // Official Video 4: https://youtu.be/lppZuZFyHzM
    targetId: 'section-evidence',
    bookRef: 'RC Chs. 7–8 (pp. 97–111); AR Ch. 3 (pp. 74–81)',
    summary: 'Transform causal hypotheses into verified facts by anchoring causes to quality evidence. Understand Gano\'s 4 Evidence Quality Tiers (Sensed, Inferred, Intuited, Emotional), test every causal set for Sufficiency ("Does this effect always occur?") and Necessity ("The Remove-It Test"), and apply Carl Sagan\'s Baloney Detection Kit to avoid mistaking correlation for causation.',
    objectives: [
      'Define evidence as data void of opinion and emotion (RC Ch. 7, p. 97).',
      'Rank evidence across the 4 Quality Tiers: Sensed, Inferred, Intuited, Emotional (RC Ch. 7, pp. 97–102).',
      'Define "Fact" as a cause supported by evidence (RC Ch. 7, p. 102).',
      'Test causal sets for Sufficiency using time/space co-existence (RC Ch. 8, p. 104).',
      'Test causes for Necessity using the Remove-It Test (RC Ch. 8, p. 108).',
      'Differentiate correlation from causation using Sagan\'s Baloney Detection Kit (RC Ch. 8, pp. 109–111).'
    ],
    keyPoints: [
      'Evidence Defined: Evidence "is defined as data that supports our conclusions, but to be effective it must be void of opinion and emotions" (RC Ch. 7, p. 97).',
      'The 4 Evidence Quality Tiers (RC Ch. 7, pp. 97–102): (1) Sensed (highest; sight, sound, smell, touch, taste); (2) Inferred (sensor logs, gauges, records); (3) Intuited (expert judgment, belief); (4) Emotional (lowest; feelings, rumors).',
      'Fact: "Fact: A cause supported by evidence" (RC Ch. 7, p. 102). Without evidence, a cause remains a hypothesis ("?").',
      'The Sufficiency Test: "Does this effect always occur when the stated causes come together at the same point in space and time?" (RC Ch. 8, p. 104).',
      'The Necessity Test (Remove-It Test): "If you remove this cause, will the effect still exist?" (RC Ch. 8, p. 108).',
      'Correlation vs. Causation: "Correlations do not constitute a causal relationship, only evidence-based causal relationships do" (RC Ch. 8, p. 109). Adapt Carl Sagan\'s "Baloney Detection Kit" (pp. 110–111).'
    ],
    bookExamples: [
      'Pot Boiled Over: Sensed evidence ("saw red hot burner"; RC Ch. 7, p. 99; AR Ch. 3, p. 75).',
      'Fuel Tank Exploded: Inferred evidence from temperature recorder chart (RC Ch. 7, pp. 100–101).',
      'Small Profit: Intuited evidence (RC Ch. 7, p. 101).',
      'Fell 15 Feet: Emotional evidence from agitated witnesses (RC Ch. 7, p. 102).',
      'Broken Leg (First, Second, and Third Look): Identifying 3 hidden causal sets between "Jumped Off Roof" and "Broken Leg" (RC Ch. 8, pp. 105–107).'
    ],
    youtubeOutline: [
      '00:00 - Hook: The pot that boiled over — "How do you KNOW?" (RC Ch. 7, p. 99)',
      '01:30 - Segment 1: The 4 Evidence Quality Tiers: Sensed to Emotional (RC Ch. 7, pp. 97–102)',
      '03:15 - Segment 2: Testing for Sufficiency & The Remove-It Test for Necessity (RC Ch. 8, pp. 104–108)',
      '04:45 - Segment 3: Broken Leg (Three Looks): Finding the missing causes (RC Ch. 8, pp. 105–107)',
      '05:50 - Segment 4: Correlation vs Causation & Sagan\'s Baloney Detection Kit (RC Ch. 8, pp. 109–111)',
      '06:30 - Close: Evidence ranking checklist and quiz'
    ],
    fullDescription: `Episode 4 of 7: Evidence; Sufficient and Necessary — How to Test and Prove Causes
Series: Thinking in Causes — A YouTube Series on Dean L. Gano's RealityCharting® for h2c_Learnings
Duration: 06:59 | Official URL: https://youtu.be/lppZuZFyHzM

📌 LESSON PLAN ALIGNMENT: PART 4 — STEPS 4–5, EVIDENCE; SUFFICIENT AND NECESSARY
Main Text: Dean L. Gano, RealityCharting® (2011), Chs. 7–8, pp. 97–111.
Support Text: Dean L. Gano, Apollo Root Cause Analysis (2003), Ch. 3, pp. 74–81.

🎯 IN THIS EPISODE:
How do you prove that your causes are real and avoid jumping to ungrounded conclusions? In Steps 4 & 5 of Gano's Seven Steps, learn how to anchor every cause to verifiable evidence across the 4 Evidence Quality Tiers (Sensed, Inferred, Intuited, and Emotional). Master the Sufficiency Test ("Does the effect always occur?") and the Necessity Test ("The Remove-It Test"), and apply Carl Sagan's Baloney Detection Kit to dismantle deceptive correlations.

⏱ CHAPTERS & TIMESTAMPS:
00:00 Hook: The pot that boiled over — "How do you KNOW?" (RC Ch. 7, p. 99)
01:30 Segment 1: The 4 Evidence Quality Tiers: Sensed to Emotional (RC Ch. 7, pp. 97–102)
03:15 Segment 2: Testing for Sufficiency & The Remove-It Test for Necessity (RC Ch. 8, pp. 104–108)
04:45 Segment 3: Broken Leg (Three Looks): Finding the missing causes (RC Ch. 8, pp. 105–107)
05:50 Segment 4: Correlation vs Causation & Sagan's Baloney Detection Kit (RC Ch. 8, pp. 109–111)
06:30 Close: Evidence ranking checklist and quiz

🔑 CORE BOOK CONCEPTS & DIRECT QUOTES:
• Evidence Defined: Evidence "is defined as data that supports our conclusions, but to be effective it must be void of opinion and emotions." (RC, Ch. 7, p. 97).
• 4 Evidence Types: "Starting at the highest quality, evidence types are sensed, inferred, intuited, and emotional." (RC, Ch. 7, p. 97).
• Sensed Evidence: "Sensed evidence is the highest quality of evidence and consists of knowing by way of sight, sound, smell, touch, or taste." (RC, Ch. 7, p. 98).
• Fact: "Fact: A cause supported by evidence." (RC, Ch. 7, p. 102).
• Sufficiency: "Does this effect always occur when the stated causes come together at the same point in space and time?" (RC, Ch. 8, p. 104).
• Necessity (Remove-It Test): "If you remove this cause, will the effect still exist?" (RC, Ch. 8, p. 108).
• Correlation: "Correlations do not constitute a causal relationship, only evidence-based causal relationships do." (RC, Ch. 8, p. 109).

📖 CASE STUDIES DISCUSSED:
• Pot Boiled Over: red-hot burner observation (RC, Ch. 7, p. 99; AR, Ch. 3, p. 75)
• Fuel Tank Exploded: temperature recorder chart data (RC, Ch. 7, pp. 100–101)
• Broken Leg (Three Looks): discovering intermediate causal sets (RC, Ch. 8, pp. 105–107)

⚖️ LEGAL & TRADEMARK ATTRIBUTION:
"Apollo Root Cause Analysis", "Apollo RCA", "Reality Tree", and "RealityCharting®" are registered trademarks of Dean L. Gano and Apollonian Publications, LLC. This educational video series is an independent open-source learning project for h2c_Learnings and is not affiliated with, endorsed by, or sponsored by Dean L. Gano or Apollonian Publications. All references are made under Nominative Fair Use (15 U.S.C. § 1125). For certified enterprise training and official software, visit: https://realitycharting.com/home/

#EvidenceBased #RootCauseAnalysis #ApolloRCA #RealityCharting #QualityControl #h2c_Learnings`
  },
  {
    step: 5,
    episode: 'Episode 5 of 7',
    tier: 'Action Framework',
    badgeText: '08:45 • Action Framework',
    verified: true,
    part: 'Part 5: Steps 6–7, Solutions, Implement and Track',
    title: 'Episode 5 of 7: Effective Solutions, Implementation, and Tracking (Preventing Recurrence)',
    shortTitle: 'Effective Solutions & Tracking',
    subtitle: 'Targeted corrective actions, 4 prevention criteria, owner tracking, and ROI verification',
    duration: '08:45',
    defaultYtId: 'yBVaGu31ik8', // Official Video 5: https://youtu.be/yBVaGu31ik8
    targetId: 'section-solutions',
    bookRef: 'RC Chs. 9–10 (pp. 112–131); AR Ch. 4 (pp. 89–108), Ch. 5 (pp. 109–130)',
    summary: 'Discover why root causes are defined by the solutions we attach to them, not discovered through independent search. Learn how to challenge causes from right to left, screen ideas against the 4 Solution Criteria, run blameless Rapid Response brainstorming, dismantle ineffective "re" traps (retrain, rewrite), and build a living tracking log with weekly reviews to guarantee recurrence prevention.',
    objectives: [
      'Explain why root causes come from solutions: "they are the ones to which we attach solutions" (RC Ch. 9, p. 112).',
      'Generate solutions by systematically challenging causes on the right side of the chart (RC Ch. 9, p. 114).',
      'Screen solutions against the Four Criteria: prevent recurrence, within control, meet goals, no unacceptable problems (RC Ch. 9, p. 116).',
      'Dismantle favorite solutions and "re" traps: retrain, rewrite, punish, warning sign (RC Ch. 9, pp. 119–120).',
      'Apply Rapid Response brainstorming rules and structure Step 7 corrective-action tracking (RC Ch. 9, p. 124; Ch. 10, pp. 128–131).'
    ],
    keyPoints: [
      'Root Causes Come From Solutions: "If we must retain the notion of \'root causes,\' then they are the ones to which we attach solutions" (RC Ch. 9, p. 112). They are secondary and contingent upon chosen actions.',
      'Solution Defined: "Solution: An action taken upon a cause to affect a desired condition" (RC Ch. 9, p. 113; AR Ch. 4, p. 90).',
      'Challenge Every Cause: "Start on the right side of the Realitychart and begin challenging the causes" (RC Ch. 9, p. 114).',
      'The 4 Solution Criteria (RC Ch. 9, p. 116): (1) Prevent recurrence, to include similar occurrences at different locations; (2) Be within your control; (3) Meet your goals and objectives; (4) Not cause other unacceptable problems (not cost too much).',
      'Avoid "Re" Traps & Favorites: Avoid "re" solutions such as retrain or rewrite procedures, and favorite solutions such as "punish" and "put up a warning sign" (RC Ch. 9, pp. 119–120).',
      'Rapid Response Rules: Rule #1: Speak only when it is your turn; Rule #2: Do not explain your ideas; Rule #3: One solution at a time (RC Ch. 9, p. 124).',
      'Step 7 Implementation: "Success is not coming up with a good idea, it is bringing it to fruition in a way that provides the value" (RC Ch. 10, p. 128). Keep a corrective-action log reviewed weekly and trend causes (pp. 129–131).'
    ],
    bookExamples: [
      'AR Elevator Near-Miss Report: Potential electrical contact on elevator car top during maintenance; corrective actions targeted "Lockout Incomplete" and procedure review (AR Ch. 5, p. 123).',
      'The Fire Root Cause Re-examined: Quenching heat vs. removing fuel vs. blocking oxygen — choice of solution dictates the root cause (RC Ch. 9, p. 113).'
    ],
    youtubeOutline: [
      '00:00 - Introduction: Steps 6 & 7 of RealityCharting',
      '00:58 - The Paradigm Shift: Root Causes Are Defined by Solutions',
      '02:10 - How to Challenge Causes (Working from Right to Left)',
      '03:25 - The 4 Criteria for Screening Effective Solutions',
      '04:45 - Why "Retraining" and "Punishment" Fail',
      '05:55 - Rapid Response Rules & Solution Generation',
      '06:50 - Step 7: Implementation, Action Tracking & Review Logs',
      '07:40 - Summary, Web App Demonstration & What\'s Next in Episode 6'
    ],
    fullDescription: `Episode 5 of 7: Effective Solutions, Implementation, and Tracking (Preventing Recurrence)
Series: Thinking in Causes — A YouTube Series on Dean L. Gano's RealityCharting® for h2c_Learnings
Duration: 08:45 | Official URL: https://youtu.be/yBVaGu31ik8

📌 LESSON PLAN ALIGNMENT: PART 5 — STEPS 6–7, SOLUTIONS, IMPLEMENT AND TRACK
Main Text: Dean L. Gano, RealityCharting® (2011), Chs. 9–10, pp. 112–131.
Support Text: Dean L. Gano, Apollo Root Cause Analysis (2003), Ch. 4 (pp. 89–108), Ch. 5 (pp. 109–130).

🎯 IN THIS EPISODE:
Why do most corrective action plans fail to prevent recurrence? In Steps 6 & 7 of Gano's Seven Steps, understand the profound paradigm shift: root causes are not uncovered by search, but are defined by the solutions we attach to causes. Learn how to challenge causes from right to left, screen candidate fixes against the 4 Solution Criteria, conduct rapid blameless brainstorming, eliminate lazy "re" solutions (retrain, rewrite), and run a living corrective-action tracking log.

⏱ CHAPTERS & TIMESTAMPS:
00:00 Introduction: Steps 6 & 7 of RealityCharting
00:58 The Paradigm Shift: Root Causes Are Defined by Solutions
02:10 How to Challenge Causes (Working from Right to Left)
03:25 The 4 Criteria for Screening Effective Solutions
04:45 Why "Retraining" and "Punishment" Fail
05:55 Rapid Response Rules & Solution Generation
06:50 Step 7: Implementation, Action Tracking & Review Logs
07:40 Summary, Web App Demonstration & What's Next in Episode 6

🔑 CORE BOOK CONCEPTS & DIRECT QUOTES:
• Root Causes From Solutions: "If we must retain the notion of 'root causes,' then they are the ones to which we attach solutions." (RC, Ch. 9, p. 112).
• Solution Defined: "Solution: An action taken upon a cause to affect a desired condition." (RC, Ch. 9, p. 113; AR, Ch. 4, p. 90).
• Challenge Every Cause: "Start on the right side of the Realitychart and begin challenging the causes" (RC, Ch. 9, p. 114).
• The 4 Criteria (RC, Ch. 9, p. 116):
  1. Prevent recurrence, to include similar occurrences at different locations.
  2. Be within your control.
  3. Meet your goals and objectives.
  4. Not cause other unacceptable problems, to include not costing too much.
• Favorite Solutions Trap: Avoid "re" solutions such as retrain, and favorite solutions such as "punish" and "put up a warning sign" (RC, Ch. 9, pp. 119–120).
• Rapid Response Rules: "Rule #1: Speak only when it is your turn." "Rule #2: Do not explain your ideas." "Rule #3: One solution at a time." (RC, Ch. 9, p. 124).
• Step 7 Value: "Success is not coming up with a good idea, it is bringing it to fruition in a way that provides the value." (RC, Ch. 10, p. 128). Review action logs weekly and trend causes (pp. 129–131).

📖 CASE STUDIES DISCUSSED:
• The elevator near-miss electrical contact report (AR, Ch. 5, p. 123)
• Fire suppression: water vs. foam vs. fuel shutoff (RC, Ch. 9, p. 113)

⚖️ LEGAL & TRADEMARK ATTRIBUTION:
"Apollo Root Cause Analysis", "Apollo RCA", "Reality Tree", and "RealityCharting®" are registered trademarks of Dean L. Gano and Apollonian Publications, LLC. This educational video series is an independent open-source learning project for h2c_Learnings and is not affiliated with, endorsed by, or sponsored by Dean L. Gano or Apollonian Publications. All references are made under Nominative Fair Use (15 U.S.C. § 1125). For certified enterprise training and official software, visit: https://realitycharting.com/home/

#CorrectiveActions #RootCauseAnalysis #ApolloRCA #RealityCharting #ContinuousImprovement #h2c_Learnings`
  },
  {
    step: 6,
    episode: 'Episode 6 of 7',
    tier: 'Culture & Alignment',
    badgeText: '08:19 • Culture & Alignment',
    verified: true,
    part: 'Part 6: Culture and Facilitation, Light',
    title: 'Episode 6 of 7: Culture and Facilitation — Fix the Cause, Not the Blame',
    shortTitle: 'Culture & Facilitation',
    subtitle: 'Facilitating blameless investigations, team alignment, and overcoming organizational resistance',
    duration: '08:19',
    defaultYtId: 'lj2e9A-qmVA', // Official Video 6: https://youtu.be/lj2e9A-qmVA
    targetId: 'section-timeline',
    bookRef: 'RC Chs. 11–12 (pp. 132–174); AR Ch. 1 (p. 15), Chs. 5–6 (pp. 109–134)',
    summary: 'Transform organizational culture by replacing fear and finger-pointing with blameless causal inquiry. Understand the role of the skilled facilitator, pack an evidence go-bag, conduct non-antagonistic interviews ("Please help me understand what happened"), steer clear of group traps (Consensus, Groupthink, treating time as a cause), and embrace Dean Gano\'s rallying principle: "Fix the cause, not the blame."',
    objectives: [
      'Explain why blame-free questioning matters and why individuals are set up to fail by task conditions (RC Ch. 12, pp. 155–159).',
      'List what to preserve after an event using an investigator go-bag and evidence checklist (RC Ch. 12, pp. 146–148).',
      'Identify and overcome the three group traps: Consensus, Groupthink, and Time as a Cause (RC Ch. 12, pp. 161–167).',
      'Explain the facilitator role and why team sizes should remain under eight members (RC Ch. 12, pp. 144–148).',
      'Internalize the cultural transformation where "a sense of freedom replaces the fear of failure" (RC Ch. 11, p. 138).'
    ],
    keyPoints: [
      'The Facilitator Role: "A group without a leader is a mob, and a problem-solving team without a skilled facilitator is just another group" (RC Ch. 12, p. 144). Keep team sizes to "fewer than eight" members (p. 148).',
      'Preserving Evidence: "Do not discard anything" (RC Ch. 12, p. 146). Preserve environment, people, and process controls using a go-bag and checklist immediately.',
      'Non-Antagonistic Interviews: "An antagonistic interview is worse than none at all" (RC Ch. 12, p. 155). Open with: "Please help me understand what happened" (p. 157).',
      'People and Conditions: "More often than not, the individual has been set up to fail by the conditions of the task" (RC Ch. 12, p. 159). "Never ask, \'Who did this?\'" (p. 170).',
      'The Three Group Traps (RC Ch. 12, pp. 162–167): (1) Consensus: "Consensus is an agreement to take a risk together, nothing more" (p. 162); (2) Groupthink: systematic collective errors (p. 162); (3) Time as Cause: "Things happen in time not because of time" (p. 167).',
      'Culture of Freedom: Internalizing causal principles creates an environment where "A sense of freedom replaces the fear of failure" (RC Ch. 11, p. 138). AR slogan: "Fix the cause not the blame" (AR Ch. 1, p. 15).'
    ],
    bookExamples: [
      'The 1926 Steering Knuckles: Faulty temperature gauges all made by the same company — validate inferred evidence (RC Ch. 12, p. 146).',
      'The Rusted Fire Hydrant: Bent wrench and corroded valve that everyone walked past and "saw nothing" of (RC Ch. 11, pp. 135–138).',
      'The Reliability Engineer whose equipment failed 35 times across its lifetime (RC Ch. 11, p. 139).'
    ],
    youtubeOutline: [
      '00:00 - Introduction: Culture & Facilitation in Root Cause Analysis',
      '01:05 - Evidence Preservation: Preparing Your Go-Bag & Securing the Scene',
      '02:25 - The Blame-Free Interview: "Please Help Me Understand What Happened"',
      '03:45 - Why Workers Are Set Up to Fail: Task Conditions vs. Human Error',
      '05:00 - Investigation Traps: The Danger of Consensus & Groupthink',
      '06:15 - Why Time Is Not a Cause: Events Happen in Time, Not Because of Time',
      '07:15 - Lessons from Experience: The 1926 Steering Knuckles & Inferred Evidence',
      '08:10 - Summary, Web App Demonstration & What\'s Ahead in Episode 7'
    ],
    fullDescription: `Episode 6 of 7: Culture and Facilitation — Fix the Cause, Not the Blame
Series: Thinking in Causes — A YouTube Series on Dean L. Gano's RealityCharting® for h2c_Learnings
Duration: 08:19 | Official URL: https://youtu.be/lj2e9A-qmVA

📌 LESSON PLAN ALIGNMENT: PART 6 — CULTURE AND FACILITATION, LIGHT
Main Text: Dean L. Gano, RealityCharting® (2011), Chs. 11–12, pp. 132–174.
Support Text: Dean L. Gano, Apollo Root Cause Analysis (2003), Ch. 1 (p. 15), Chs. 5–6 (pp. 109–134).

🎯 IN THIS EPISODE:
Why do so many RCA meetings degenerate into finger-pointing, defensiveness, and consensus politics? In this masterclass on facilitation and culture, learn how to build an organizational environment focused on fixing causes rather than assigning human blame. Discover how to pack an evidence go-bag, run non-antagonistic interviews that open with "Please help me understand what happened," dismantle groupthink and consensus traps, and replace the fear of failure with genuine freedom.

⏱ CHAPTERS & TIMESTAMPS:
00:00 Introduction: Culture & Facilitation in Root Cause Analysis
01:05 Evidence Preservation: Preparing Your Go-Bag & Securing the Scene
02:25 The Blame-Free Interview: "Please Help Me Understand What Happened"
03:45 Why Workers Are Set Up to Fail: Task Conditions vs. Human Error
05:00 Investigation Traps: The Danger of Consensus & Groupthink
06:15 Why Time Is Not a Cause: Events Happen in Time, Not Because of Time
07:15 Lessons from Experience: The 1926 Steering Knuckles & Inferred Evidence
08:10 Summary, Web App Demonstration & What's Ahead in Episode 7

🔑 CORE BOOK CONCEPTS & DIRECT QUOTES:
• The Facilitator: "A group without a leader is a mob, and a problem-solving team without a skilled facilitator is just another group." (RC, Ch. 12, p. 144).
• Preserve Evidence: "Do not discard anything" (RC, Ch. 12, p. 146). Preserve the environment, the people, and the process controls (pp. 146–148).
• Blameless Interviews: "An antagonistic interview is worse than none at all" (RC, Ch. 12, p. 155). Open with "Please help me understand what happened" (RC, Ch. 12, p. 157).
• Task Conditions: "More often than not, the individual has been set up to fail by the conditions of the task" (RC, Ch. 12, p. 159). "Never ask, 'Who did this?'" (p. 170).
• Group Traps:
  - Consensus: "Consensus is an agreement to take a risk together, nothing more" (RC, Ch. 12, p. 162).
  - Groupthink: "systematic errors made by groups when making collective decisions" (RC, Ch. 12, p. 162).
  - Time as Cause: "Things happen in time not because of time" (RC, Ch. 12, p. 167).
• Cultural Freedom: "A sense of freedom replaces the fear of failure." (RC, Ch. 11, p. 138). AR slogan: "fix the cause not the blame" (AR, Ch. 1, p. 15).

📖 CASE STUDIES DISCUSSED:
• The 1926 steering knuckles and single-supplier gauge defect (RC, Ch. 12, p. 146)
• The rusted fire hydrant with the bent wrench (RC, Ch. 11, pp. 135–138)
• The 35-time failed equipment reliability case (RC, Ch. 11, p. 139)

⚖️ LEGAL & TRADEMARK ATTRIBUTION:
"Apollo Root Cause Analysis", "Apollo RCA", "Reality Tree", and "RealityCharting®" are registered trademarks of Dean L. Gano and Apollonian Publications, LLC. This educational video series is an independent open-source learning project for h2c_Learnings and is not affiliated with, endorsed by, or sponsored by Dean L. Gano or Apollonian Publications. All references are made under Nominative Fair Use (15 U.S.C. § 1125). For certified enterprise training and official software, visit: https://realitycharting.com/home/

#Facilitation #PsychologicalSafety #RootCauseAnalysis #ApolloRCA #RealityCharting #ZeroBlame #h2c_Learnings`
  },
  {
    step: 7,
    episode: 'Episode 7 of 7',
    tier: 'Proactive Mastery',
    badgeText: '07:10 • Proactive Mastery',
    verified: true,
    part: 'Part 7: Success and a New Way of Thinking',
    title: 'Episode 7 of 7: Success and a New Way of Thinking (Why Success Is Planned)',
    shortTitle: 'Success & A New Way of Thinking',
    subtitle: 'Proactive problem-solving, planning success, and institutionalizing Apollo RCA mastery',
    duration: '07:10',
    defaultYtId: '_w5WUcNRYWU', // Official Video 7: https://youtu.be/_w5WUcNRYWU
    targetId: 'section-track',
    bookRef: 'RC Chs. 13–14 (pp. 175–194)',
    summary: 'Elevate root cause analysis from incident post-mortems into a proactive strategy for personal and organizational success. Learn how to chart successes ("Success is planned and failure is not"), decouple colliding systems in time and space, apply solutions to conditions rather than human actions, and embrace Gano\'s vision for a mind permanently expanded by causal thinking.',
    objectives: [
      'Explain why "success is planned and failure is not" (RC Ch. 13, p. 189).',
      'Chart a success using Realitycharting to document reproducible victories (RC Ch. 11, p. 134; Ch. 13, p. 189).',
      'Analyze serendipity as the intersection of asking why, knowledge, and tenacity (RC Ch. 13, p. 178).',
      'Decouple systems in time and space by applying solutions to conditional causes (RC Ch. 13, pp. 180–181).',
      'Transition from ancient caveman storytelling to modern evidence-based causal thinking (RC Ch. 14, pp. 191–194).'
    ],
    keyPoints: [
      'Success is Planned: "Success is planned and failure is not" (RC Ch. 13, p. 189). Success and failure share identical causal mechanisms; charts can "document the causes of your successes" (RC Ch. 11, p. 134).',
      'Serendipity Anatomy: Serendipity requires "the intelligence to ask why, the knowledge to find the answers, and the tenacity to do something with the newfound knowledge" (RC Ch. 13, p. 178).',
      'Decoupling Systems in Time & Space: Safe and desired outcomes occur when we "make sure certain systems do not share any causes" (RC Ch. 13, p. 180). Apply solutions "to conditional causes rather than action causes" (p. 181).',
      'A Mind Expanded: Epigraph: "A mind once expanded never regains the same shape" (RC Ch. 14, p. 191). "Effective solutions for everyday problems are guaranteed every time if you choose to implement these tools" (p. 191). Average conventional problem-solving effectiveness is "about 30%" (p. 192).',
      'Leave Stories to Entertainment: "We should leave stories to the world of entertainment and adopt causal thinking" (RC Ch. 14, p. 193). "We can take the man out of the cave, but it has been virtually impossible to take the cave out of the man" (p. 193).'
    ],
    bookExamples: [
      'Percy Spencer\'s Melted Candy Bar: Radar magnetron research serendipity that led directly to the invention of the microwave oven (RC Ch. 13, pp. 177–178).',
      'Person Drowned: How the Person system and River system collided through the action cause "Fell Out Of Boat" (RC Ch. 13, pp. 179–180).',
      'High-Reliability Operations: Documenting 30-day zero-stoppage equipment runs as repeatable causal successes (RC Ch. 11, p. 134; Ch. 13, p. 189).'
    ],
    youtubeOutline: [
      '00:00 - Introduction: Thinking in Causes & The Series Finale',
      '00:55 - Serendipity & The Melted Candy Bar (Percy Spencer Case)',
      '02:05 - Intersecting Systems: How Independent Causes Meet in Time & Space',
      '03:15 - Breaking System Overlaps: Acting on Conditional Causes',
      '04:20 - Why Success Is Planned: Charting Positive Outcomes',
      '05:30 - Chapter 14: Moving Past Storytelling to Causal Thinking',
      '06:25 - Series Recap, Web App Companion & Final Takeaway'
    ],
    fullDescription: `Episode 7 of 7: Success and a New Way of Thinking (Why Success Is Planned)
Series: Thinking in Causes — A YouTube Series on Dean L. Gano's RealityCharting® for h2c_Learnings
Duration: 07:10 | Official URL: https://youtu.be/_w5WUcNRYWU

📌 LESSON PLAN ALIGNMENT: PART 7 — SUCCESS AND A NEW WAY OF THINKING
Main Text: Dean L. Gano, RealityCharting® (2011), Chs. 13–14, pp. 175–194.

🎯 IN THIS EPISODE:
Why do we only investigate failures when we could be charting and replicating our greatest successes? In the capstone episode of Thinking in Causes, learn how Apollo RCA and Realitycharting elevate problem solving into a life-changing framework for personal and operational excellence. Discover why success is always planned, how to keep hazardous systems from colliding in time and space, why the best solutions target conditions, and how to permanently replace caveman storytelling with scientific causal thinking.

⏱ CHAPTERS & TIMESTAMPS:
00:00 Introduction: Thinking in Causes & The Series Finale
00:55 Serendipity & The Melted Candy Bar (Percy Spencer Case)
02:05 Intersecting Systems: How Independent Causes Meet in Time & Space
03:15 Breaking System Overlaps: Acting on Conditional Causes
04:20 Why Success Is Planned: Charting Positive Outcomes
05:30 Chapter 14: Moving Past Storytelling to Causal Thinking
06:25 Series Recap, Web App Companion & Final Takeaway

🔑 CORE BOOK CONCEPTS & DIRECT QUOTES:
• Serendipity: Serendipity needs "the intelligence to ask why, the knowledge to find the answers, and the tenacity to do something with the newfound knowledge" (RC, Ch. 13, p. 178).
• Decoupling Systems: We can "make sure certain systems do not share any causes as a way of ensuring a safe and desired outcome" (RC, Ch. 13, p. 180). Apply solutions "to conditional causes rather than action causes" (RC, Ch. 13, p. 181).
• Success is Planned: "success is planned and failure is not" (RC, Ch. 13, p. 189). Charts can "document the causes of your successes" (RC, Ch. 11, p. 134).
• A Mind Expanded: "A mind once expanded never regains the same shape." (RC, Ch. 14, p. 191).
• Guaranteed Results: "Effective solutions for everyday problems are guaranteed every time if you choose to implement these tools." (RC, Ch. 14, p. 191). Conventional effectiveness is "about 30%" (p. 192).
• Leave Stories to Entertainment: "we should leave stories to the world of entertainment and adopt causal thinking" (RC, Ch. 14, p. 193).
• The Caveman Dilemma: "We can take the man out of the cave, but it has been virtually impossible to take the cave out of the man" (RC, Ch. 14, p. 193).

📖 CASE STUDIES DISCUSSED:
• Percy Spencer's melted candy bar and the microwave (RC, Ch. 13, pp. 177–178)
• Person Drowned: River system and Person system collision (RC, Ch. 13, pp. 179–180)
• Documenting 30 days of error-free conveyor operation (RC, Ch. 11, p. 134)

⚖️ LEGAL & TRADEMARK ATTRIBUTION:
"Apollo Root Cause Analysis", "Apollo RCA", "Reality Tree", and "RealityCharting®" are registered trademarks of Dean L. Gano and Apollonian Publications, LLC. This educational video series is an independent open-source learning project for h2c_Learnings and is not affiliated with, endorsed by, or sponsored by Dean L. Gano or Apollonian Publications. All references are made under Nominative Fair Use (15 U.S.C. § 1125). For certified enterprise training and official software, visit: https://realitycharting.com/home/

#SuccessPlanning #RootCauseAnalysis #ApolloRCA #RealityCharting #ContinuousImprovement #h2c_Learnings`
  }
];

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clearNode(el) {
  if (!el) return;
  if (typeof el.replaceChildren === 'function') {
    el.replaceChildren();
    return;
  }
  if (Array.isArray(el.children)) {
    el.children.slice().forEach((child) => child.remove?.());
    el.children.length = 0;
  }
}

/** Sanitized DOM fill. Drops scripts and inline event handlers. */
function adoptSafe(parent, html) {
  clearNode(parent);
  const source = String(html ?? '');
  if (typeof DOMParser === 'function') {
    const doc = new DOMParser().parseFromString('<div id="h2c-safe-root">' + source + '</div>', 'text/html');
    const clean = (node) => {
      if (!node || node.nodeType !== 1) return;
      const tag = node.tagName;
      if (tag === 'SCRIPT' || tag === 'OBJECT' || tag === 'EMBED' || tag === 'LINK' || tag === 'META') {
        node.remove();
        return;
      }
      [...node.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on') || name === 'srcdoc') node.removeAttribute(attr.name);
        if ((name === 'href' || name === 'src' || name === 'xlink:href') && /^\s*javascript:/i.test(attr.value)) node.removeAttribute(attr.name);
      });
      [...node.children].forEach(clean);
    };
    const root = doc.getElementById('h2c-safe-root') || doc.body;
    [...root.children].forEach(clean);
    while (root.firstChild) parent.append(root.firstChild);
    return;
  }
  const tags = [...source.matchAll(/<([a-z0-9]+)\b([^>]*)>/gi)];
  for (const tag of tags) {
    const attrs = tag[2] || '';
    const classMatch = attrs.match(/class="([^"]*)"/);
    const idMatch = attrs.match(/id="([^"]*)"/);
    if (!classMatch && !idMatch) continue;
    const el = document.createElement(tag[1]);
    if (classMatch) el.className = classMatch[1];
    if (idMatch) el.setAttribute('id', idMatch[1]);
    const dataStep = attrs.match(/data-step="([^"]*)"/);
    const dataTarget = attrs.match(/data-target="([^"]*)"/);
    if (dataStep) el.setAttribute('data-step', dataStep[1]);
    if (dataTarget) el.setAttribute('data-target', dataTarget[1]);
    parent.append(el);
  }
}

function whenHydrated(run) {
  const start = Date.now();
  const tick = () => {
    const tsr = globalThis.$_TSR;
    if (tsr && !tsr.hydrated && Date.now() - start < 4000) {
      setTimeout(tick, 40);
      return;
    }
    run();
  };
  if (typeof document === 'undefined') return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick, { once: true });
  else tick();
}

export function sanitizeVideoId(id, fallback = '') {
  if (typeof id === 'string') {
    const trimmed = id.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    if (trimmed.startsWith('PLACEHOLDER') && /^[a-zA-Z0-9_-]+$/.test(trimmed)) return trimmed;
  }
  return fallback;
}

export function syncOfficialVideos(force = false) {
  if (typeof localStorage === 'undefined') {
    const defaults = {};
    VIDEO_MODULES.forEach(m => defaults[m.step] = m.defaultYtId);
    return defaults;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    let data = raw ? JSON.parse(raw) : {};
    const lastVer = localStorage.getItem(SYNC_KEY);

    if (force || lastVer !== SYNC_VERSION) {
      // Auto-migrate: ensure verified official videos 1-4 take precedence
      Object.entries(OFFICIAL_VIDEOS).forEach(([stepStr, info]) => {
        const step = Number(stepStr);
        if (force || !data[step] || data[step].startsWith('PLACEHOLDER') || data[step] === 'dQw4w9WgXcQ') {
          data[step] = info.id;
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(SYNC_KEY, SYNC_VERSION);
    }
    // Sanitize
    VIDEO_MODULES.forEach(m => {
      const val = data[m.step];
      if (!val || val === 'dQw4w9WgXcQ' || (typeof val === 'string' && val.startsWith('PLACEHOLDER') && !m.defaultYtId.startsWith('PLACEHOLDER'))) {
        data[m.step] = m.defaultYtId;
      } else {
        data[m.step] = sanitizeVideoId(val, m.defaultYtId);
      }
    });
    return data;
  } catch (err) {
    console.warn('Storage sync error:', err);
    const defaults = {};
    VIDEO_MODULES.forEach(m => defaults[m.step] = m.defaultYtId);
    return defaults;
  }
}

export function getStoredVideos() {
  return syncOfficialVideos(false);
}

export function saveVideoId(stepNum, ytId) {
  try {
    const data = getStoredVideos();
    const clean = parseYouTubeId(ytId) || sanitizeVideoId(ytId, null);
    if (clean) {
      data[stepNum] = clean;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
      }
      return clean;
    }
  } catch {}
  return null;
}

const css = typeof document !== 'undefined' ? document.createElement('style') : null;
if (css)
css.textContent = `
/* Floating Video Academy Button */
.h2cv-fab {
  position: fixed;
  left: 104px;
  bottom: 16px;
  z-index: 9998;
  background: linear-gradient(180deg, #b91c1c 0%, #991b1b 100%);
  color: #ffffff;
  border: 2px solid #ef4444;
  border-radius: 999px;
  padding: 10px 16px;
  font: 700 13px system-ui, -apple-system, sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(185, 28, 28, 0.45);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.h2cv-fab:hover {
  background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(185, 28, 28, 0.55);
}
.h2cv-fab:focus-visible, .h2cv-tb:focus-visible, .h2cv-x:focus-visible, .h2cv-sync-btn:focus-visible {
  outline: 3px solid #f6dd7a;
  outline-offset: 2px;
}

/* Toolbar Video Button */
.h2cv-tb {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1.5px solid #dc2626;
  color: #b91c1c;
  font-weight: 700;
  font-size: 13.5px;
  border-radius: 6px;
  padding: 0 14px;
  height: 44px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.h2cv-tb:hover {
  background: #fef2f2;
  border-color: #b91c1c;
  color: #991b1b;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.18);
}

/* Slide-out Panel Overlay & Container */
.h2cv-back {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  z-index: 9998;
  animation: h2cv-fade-in 0.2s ease-out;
}
@keyframes h2cv-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.h2cv-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(680px, 100vw);
  background: #fffdfa;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  border-left: 4px solid #dc2626;
  box-shadow: -10px 0 35px rgba(0, 0, 0, 0.4);
  font: 14px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #14261c;
  animation: h2cv-slide-in 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  -webkit-overflow-scrolling: touch;
}
@keyframes h2cv-slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Drawer Header */
.h2cv-head {
  background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 60%, #450a0a 100%);
  color: #ffffff;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 2px solid #ef4444;
  position: sticky;
  top: 0;
  z-index: 10;
}
.h2cv-head-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.h2cv-head-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.h2cv-head h2 {
  margin: 0;
  font: 700 17px system-ui, sans-serif;
  color: #ffffff;
  letter-spacing: -0.01em;
}
.h2cv-head p {
  margin: 2px 0 0;
  font-size: 11.5px;
  color: #fca5a5;
  line-height: 1.35;
}
.h2cv-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.h2cv-head-yt-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.16);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  color: #ffffff;
  border-radius: 999px;
  padding: 5px 12px;
  font: 700 12px system-ui, sans-serif;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.h2cv-head-yt-btn:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: #ffffff;
  transform: translateY(-1px);
}
.h2cv-x {
  background: #ffffff;
  color: #991b1b;
  border: 0;
  border-radius: 6px;
  padding: 6px 12px;
  font-weight: 800;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.h2cv-x:hover {
  background: #fee2e2;
  transform: scale(1.05);
}

/* Sync & Status Banner */
.h2cv-sync-bar {
  background: linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%);
  border-bottom: 1.5px solid #a7f3d0;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  position: sticky;
  top: 64px;
  z-index: 9;
}
.h2cv-sync-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #065f46;
}
.h2cv-sync-status-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #10b981;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
}
.h2cv-sync-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.h2cv-sync-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #047857;
  color: #ffffff;
  border: 0;
  border-radius: 6px;
  padding: 4px 11px;
  font: 700 11.5px system-ui;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(4, 120, 87, 0.25);
}
.h2cv-sync-btn:hover {
  background: #065f46;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(4, 120, 87, 0.35);
}
.h2cv-channel-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  border-radius: 6px;
  padding: 4px 10px;
  font: 700 11.5px system-ui;
  text-decoration: none;
  transition: all 0.15s ease;
}
.h2cv-channel-btn:hover {
  background: #fef2f2;
  border-color: #dc2626;
}

/* Floating in-drawer sync toast */
.h2cv-sync-toast {
  position: absolute;
  top: 110px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  background: #064e3b;
  color: #a7f3d0;
  border: 1.5px solid #10b981;
  border-radius: 8px;
  padding: 8px 16px;
  font: 700 12.5px system-ui;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  gap: 8px;
  animation: h2cv-toast-pop 0.25s ease-out;
}
@keyframes h2cv-toast-pop {
  from { opacity: 0; transform: translate(-50%, -8px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

/* Step Filter Tabs */
.h2cv-tabs {
  display: flex;
  gap: 6px;
  padding: 10px 14px;
  background: #fbf7ee;
  border-bottom: 1px solid #e6d7a8;
  overflow-x: auto;
  white-space: nowrap;
  position: sticky;
  top: 104px;
  z-index: 8;
}
.h2cv-tab-btn {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid #d4c595;
  background: #ffffff;
  font: 700 12px system-ui;
  color: #043d2e;
  cursor: pointer;
  transition: all 0.15s ease;
}
.h2cv-tab-btn:hover {
  background: #f5eed6;
  border-color: #8c6a1a;
}
.h2cv-tab-btn.active {
  background: #dc2626;
  color: #ffffff;
  border-color: #b91c1c;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.25);
}

/* Scrollable Body */
.h2cv-body {
  overflow-y: auto;
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Video Module Card */
.h2cv-card {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-margin-top: 160px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.h2cv-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}
.h2cv-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.h2cv-step-pill {
  background: #dc2626;
  color: #ffffff;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 6px;
}
.h2cv-part-pill {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
  font-weight: 700;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
}

/* High-contrast glowing duration badge (Header) */
.h2cv-duration-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 700;
  font-size: 11.5px;
  letter-spacing: 0.02em;
  padding: 4px 11px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
}
.h2cv-duration-badge.verified {
  background: linear-gradient(135deg, #022c22 0%, #064e3b 100%);
  color: #6ee7b7;
  border: 1.5px solid #059669;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.h2cv-duration-badge.upcoming {
  background: linear-gradient(135deg, #27272a 0%, #18181b 100%);
  color: #fbbf24;
  border: 1.5px solid #71717a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
.h2cv-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
  display: inline-block;
  animation: h2cv-pulse 2s infinite ease-in-out;
}
@keyframes h2cv-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.8); }
}

.h2cv-card-title {
  margin: 6px 0 2px;
  font: 700 16px/1.3 Georgia, serif;
  color: #111827;
}
.h2cv-card-sub {
  margin: 0;
  font-size: 12.5px;
  color: #6b7280;
}

/* 16:9 Video Player Container */
.h2cv-player-box {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #0f172a;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
}
.h2cv-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #1e293b 0%, #090d16 100%);
  color: #ffffff;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  position: relative;
  user-select: none;
}
.h2cv-play-btn {
  width: 68px;
  height: 48px;
  background: #dc2626;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.6);
  transition: transform 0.2s ease, background 0.2s ease;
  margin-bottom: 8px;
}
.h2cv-screen:hover .h2cv-play-btn {
  transform: scale(1.12);
  background: #ef4444;
}
.h2cv-play-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 0 10px 18px;
  border-color: transparent transparent transparent #ffffff;
  margin-left: 4px;
}
.h2cv-screen-title {
  font: 700 13px system-ui;
  color: #f3f4f6;
  margin-bottom: 4px;
}
.h2cv-screen-hint {
  font-size: 11px;
  color: #9ca3af;
}

/* Thumbnail Overlay Duration Badge */
.h2cv-screen-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(15, 23, 42, 0.94);
  color: #ffffff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.03em;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: 2;
}
.h2cv-screen-duration.verified {
  background: rgba(4, 45, 36, 0.94);
  color: #6ee7b7;
  border-color: rgba(52, 211, 153, 0.6);
  box-shadow: 0 0 14px rgba(16, 185, 129, 0.4), 0 3px 10px rgba(0, 0, 0, 0.7);
}
.h2cv-screen-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 6px #34d399;
  display: inline-block;
}

/* Summary & Key Points */
.h2cv-summary-box {
  background: #fbf7ee;
  border: 1px solid #e6d7a8;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12.5px;
  color: #374151;
}

/* Lesson Plan Outlines & Details */
.h2cv-lesson-details {
  margin-top: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  color: #334155;
  transition: all 0.2s ease;
}
.h2cv-lesson-details[open] {
  border-color: #c9a227;
  background: #fffdfa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.h2cv-lesson-summary {
  cursor: pointer;
  font-weight: 700;
  color: #854d0e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  outline: none;
}
.h2cv-lesson-summary:hover {
  color: #b45309;
}
.h2cv-lesson-body {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.h2cv-lesson-section-title {
  font-weight: 700;
  color: #1e3a8a;
  font-size: 11.5px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.h2cv-copy-desc-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  padding: 5px 10px;
  font: 700 11px system-ui;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
}
.h2cv-copy-desc-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}
.h2cv-copy-desc-btn.copied {
  background: #ecfdf5 !important;
  border-color: #10b981 !important;
  color: #047857 !important;
}

.h2cv-key-points {
  margin: 6px 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  color: #4b5563;
}

/* Card Actions */
.h2cv-card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px solid #f3f4f6;
}
.h2cv-jump-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #043d2e;
  color: #f1d16b;
  border: 1px solid #c9a227;
  border-radius: 6px;
  padding: 6px 12px;
  font: 700 12px system-ui;
  cursor: pointer;
  transition: all 0.15s ease;
}
.h2cv-jump-btn:hover {
  background: #0a5c45;
  color: #ffffff;
}
.h2cv-yt-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fff5f5;
  border: 1px solid #fca5a5;
  color: #dc2626;
  border-radius: 6px;
  padding: 6px 10px;
  font: 700 11.5px system-ui;
  text-decoration: none;
  transition: all 0.15s ease;
}
.h2cv-yt-link-btn:hover {
  background: #fee2e2;
  border-color: #ef4444;
}
.h2cv-edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 10px;
  font: 600 11.5px system-ui;
  cursor: pointer;
  transition: all 0.15s ease;
}
.h2cv-edit-btn:hover {
  color: #111827;
  border-color: #9ca3af;
}

/* Footer in Panel */
.h2cv-foot {
  background: #fbf7ee;
  border-top: 2px solid #e6d7a8;
  padding: 12px 18px;
  font-size: 12px;
  color: #4b5a53;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.h2cv-foot-yt-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #b91c1c;
  font-weight: 700;
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 6px;
  background: #fff5f5;
  border: 1px solid #fecaca;
  transition: all 0.15s ease;
}
.h2cv-foot-yt-link:hover {
  background: #fee2e2;
  color: #991b1b;
}`;

let panel, back, fab, lastFocus;

export function closeVideoDrawer() {
  panel?.remove();
  back?.remove();
  panel = back = null;
  lastFocus?.focus();
}

export function parseYouTubeId(input) {
  if (!input || typeof input !== 'string') return null;
  input = input.trim();
  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  // youtu.be/ID
  const m1 = input.match(/^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:[?&#].*)?$/i);
  if (m1) return m1[1];

  // (www.)youtube.com or (www.)youtube-nocookie.com /watch?v=ID or /embed/ or /shorts/ or /live/
  const m2 = input.match(/^(?:https?:\/\/)?(?:www\.)?youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})|(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11}))(?:[?&#].*)?$/i);
  if (m2) return m2[1] || m2[2];

  return null;
}

export function openVideoDrawer(targetStep = null) {
  if (typeof document === 'undefined') return;
  if (panel) {
    if (targetStep) scrollToStep(targetStep);
    return;
  }
  lastFocus = document.activeElement;

  back = document.createElement('div');
  back.className = 'h2cv-back';
  back.onclick = closeVideoDrawer;

  panel = document.createElement('aside');
  panel.className = 'h2cv-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Official Apollo RCA Methodology Training Video Series');

  // Header
  const head = document.createElement('div');
  head.className = 'h2cv-head';
  adoptSafe(head, `
    <div class="h2cv-head-title">
      <div class="h2cv-head-icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff"><path d="M21.58 7.19a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.68.49a2.7 2.7 0 0 0-1.9 1.9A28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .42 4.81 2.7 2.7 0 0 0 1.9 1.9C6 19.2 12 19.2 12 19.2s6 0 7.68-.49a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.42-4.81ZM9.8 15.33V8.67L15.6 12l-5.8 3.33Z"/></svg>
      </div>
      <div>
        <h2>Apollo RCA Methodology Video Series</h2>
        <p>Official 7-Episode Training Series • Dean L. Gano's RealityCharting&reg; for @h2c_Learnings</p>
      </div>
    </div>
    <div class="h2cv-head-actions">
      <a href="${OFFICIAL_CHANNEL_URL}" target="_blank" rel="noopener noreferrer" class="h2cv-head-yt-btn" title="Open @h2c_Learnings YouTube channel in new tab">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true"><path d="M21.58 7.19a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.68.49a2.7 2.7 0 0 0-1.9 1.9A28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .42 4.81 2.7 2.7 0 0 0 1.9 1.9C6 19.2 12 19.2 12 19.2s6 0 7.68-.49a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.42-4.81ZM9.8 15.33V8.67L15.6 12l-5.8 3.33Z"/></svg>
        <span>@h2c_Learnings ↗</span>
      </a>
      <button type="button" class="h2cv-x" aria-label="Close video training drawer">Close ✕</button>
    </div>
  `);
  const closeBtn = head.querySelector('.h2cv-x');
  closeBtn.onclick = closeVideoDrawer;

  // Sync & Status Bar
  const syncBar = document.createElement('div');
  syncBar.className = 'h2cv-sync-bar';
  adoptSafe(syncBar, `
    <div class="h2cv-sync-status">
      <span class="h2cv-sync-status-icon">✓</span>
      <span>Live Official YouTube Durations Active (v16)</span>
    </div>
    <div class="h2cv-sync-actions">
      <button type="button" class="h2cv-sync-btn" title="Force sync and verify official video IDs and durations">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
        <span>Sync Official Durations</span>
      </button>
      <a href="${OFFICIAL_CHANNEL_URL}" target="_blank" rel="noopener noreferrer" class="h2cv-channel-btn" title="Visit official YouTube channel">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#dc2626" aria-hidden="true"><path d="M21.58 7.19a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.68.49a2.7 2.7 0 0 0-1.9 1.9A28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .42 4.81 2.7 2.7 0 0 0 1.9 1.9C6 19.2 12 19.2 12 19.2s6 0 7.68-.49a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.42-4.81ZM9.8 15.33V8.67L15.6 12l-5.8 3.33Z"/></svg>
        <span>Channel</span> ↗
      </a>
    </div>
  `);

  function showSyncToast(message) {
    const existing = panel.querySelector('.h2cv-sync-toast');
    existing?.remove();
    const toast = document.createElement('div');
    toast.className = 'h2cv-sync-toast';
    toast.setAttribute('role', 'status');
    adoptSafe(toast, `<span style="color: #34d399;">✓</span> <span>${message}</span>`);
    panel.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  const syncBtn = syncBar.querySelector('.h2cv-sync-btn');
  syncBtn.onclick = () => {
    syncOfficialVideos(true);
    renderCards(currentFilter);
    showSyncToast('Official YouTube Durations & IDs Synchronized!');
  };

  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'h2cv-tabs';
  
  let currentFilter = targetStep;

  const allTab = document.createElement('button');
  allTab.type = 'button';
  allTab.className = 'h2cv-tab-btn' + (!targetStep ? ' active' : '');
  allTab.textContent = 'All 7 Episodes';
  allTab.onclick = () => filterStep(null);
  tabs.appendChild(allTab);

  VIDEO_MODULES.forEach(mod => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'h2cv-tab-btn' + (targetStep === mod.step ? ' active' : '');
    btn.textContent = `Ep ${mod.step}`;
    btn.title = mod.title;
    btn.onclick = () => filterStep(mod.step);
    tabs.appendChild(btn);
  });

  // Body
  const body = document.createElement('div');
  body.className = 'h2cv-body';

  function renderCards(filterNum = null) {
    clearNode(body);
    const stored = getStoredVideos();
    const list = filterNum ? VIDEO_MODULES.filter(m => m.step === filterNum) : VIDEO_MODULES;

    list.forEach(mod => {
      const card = document.createElement('article');
      card.className = 'h2cv-card';
      card.id = `h2cv-step-card-${mod.step}`;

      const ytId = stored[mod.step] || mod.defaultYtId;
      const isPlaceholder = ytId.startsWith('PLACEHOLDER') || ytId === 'dQw4w9WgXcQ';

      const jumpLabels = {
        1: '🎯 Jump to Problem Definition in Workspace &rarr;',
        2: '🎯 Jump to Problem Definition in Workspace &rarr;',
        3: '🎯 Jump to Reality Tree in Workspace &rarr;',
        4: '🎯 Jump to Evidence Tiers in Workspace &rarr;',
        5: '🎯 Jump to Solutions Action Matrix &rarr;',
        6: '🎯 Jump to Timeline & Event Sequencing &rarr;',
        7: '🎯 Jump to Tracking & Reports &rarr;'
      };

      adoptSafe(card, `
        <div class="h2cv-card-header">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="h2cv-step-pill">${mod.episode}</span>
            <span class="h2cv-part-pill">${escapeHtml(mod.part ? mod.part.split(':')[0] : 'Lesson')}</span>
          </div>
          <span class="h2cv-duration-badge ${mod.verified ? 'verified' : 'upcoming'}" title="${mod.verified ? 'Verified with official YouTube channel' : 'Upcoming video release'}">
            ${mod.verified ? '<span class="h2cv-live-dot" aria-hidden="true"></span>' : '⏱'}
            <span>${escapeHtml(mod.badgeText || (mod.duration + ' • ' + (mod.tier || 'Guide')))}</span>
          </span>
        </div>
        <div>
          <h3 class="h2cv-card-title">${escapeHtml(mod.title)}</h3>
          <p class="h2cv-card-sub">${escapeHtml(mod.subtitle)}</p>
        </div>

        <div class="h2cv-player-box" id="h2cv-player-box-${mod.step}">
          <div class="h2cv-screen" role="button" tabindex="0" aria-label="Play video for ${escapeHtml(mod.title)}">
            <div class="h2cv-play-btn">
              <div class="h2cv-play-arrow"></div>
            </div>
            <div class="h2cv-screen-title">${escapeHtml(mod.title)}</div>
            <div class="h2cv-screen-hint">${isPlaceholder ? '▶ Click to preview / configure YouTube link' : '▶ Click to play official YouTube video'}</div>
            <div class="h2cv-screen-duration ${mod.verified ? 'verified' : ''}">
              ${mod.verified ? '<span class="h2cv-screen-dot" aria-hidden="true"></span>' : ''}
              <span>${escapeHtml(mod.duration)}</span>
            </div>
          </div>
        </div>

        <div class="h2cv-summary-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 4px;">
            <strong style="color: #92400e; font-size: 12px; display: inline-flex; align-items: center; gap: 4px;">
              <span>📌</span> ${escapeHtml(mod.part || 'Lesson Plan Focus')}:
            </strong>
            <span style="font-size: 10.5px; background: #fef3c7; color: #92400e; padding: 1px 6px; border-radius: 4px; font-weight: 600;">${escapeHtml(mod.bookRef ? mod.bookRef.split(';')[0] : '')}</span>
          </div>
          <div style="font-size: 12.5px; line-height: 1.45; color: #374151;">${escapeHtml(mod.summary)}</div>
          <ul class="h2cv-key-points">
            ${mod.keyPoints.map(kp => `<li>• ${escapeHtml(kp)}</li>`).join('')}
          </ul>

          <details class="h2cv-lesson-details">
            <summary class="h2cv-lesson-summary">
              <span>📘 Full Lesson Plan & YouTube Episode Outline</span>
              <span style="font-size: 11px; font-weight: 500; color: #a16207;">Expand Outlines ▾</span>
            </summary>
            <div class="h2cv-lesson-body">
              <div>
                <div class="h2cv-lesson-section-title">
                  <span>📖</span> <strong>Book Unit References:</strong>
                </div>
                <div style="font-size: 11.5px; color: #475569; padding-left: 20px;">
                  ${escapeHtml(mod.bookRef)}
                </div>
              </div>

              ${mod.objectives && mod.objectives.length ? `
              <div>
                <div class="h2cv-lesson-section-title">
                  <span>🎯</span> <strong>Student / Learner Objectives:</strong>
                </div>
                <ul style="margin: 2px 0 0; padding-left: 28px; font-size: 11.5px; color: #475569; display: flex; flex-direction: column; gap: 2px;">
                  ${mod.objectives.map(obj => `<li>${escapeHtml(obj)}</li>`).join('')}
                </ul>
              </div>` : ''}

              ${mod.bookExamples && mod.bookExamples.length ? `
              <div>
                <div class="h2cv-lesson-section-title">
                  <span>🔍</span> <strong>Gano's Book Case Studies:</strong>
                </div>
                <ul style="margin: 2px 0 0; padding-left: 28px; font-size: 11.5px; color: #475569; display: flex; flex-direction: column; gap: 2px;">
                  ${mod.bookExamples.map(ex => `<li>${escapeHtml(ex)}</li>`).join('')}
                </ul>
              </div>` : ''}

              ${mod.youtubeOutline && mod.youtubeOutline.length ? `
              <div>
                <div class="h2cv-lesson-section-title">
                  <span>⏱</span> <strong>YouTube Video Segments:</strong>
                </div>
                <ul style="margin: 2px 0 0; padding-left: 28px; font-size: 11px; color: #475569; font-family: ui-monospace, SFMono-Regular, monospace; display: flex; flex-direction: column; gap: 2px;">
                  ${mod.youtubeOutline.map(seg => `<li>${escapeHtml(seg)}</li>`).join('')}
                </ul>
              </div>` : ''}

              <div style="margin-top: 4px; padding-top: 6px; border-top: 1px dashed #e2e8f0; display: flex; justify-content: flex-end;">
                <button type="button" class="h2cv-copy-desc-btn" data-step="${mod.step}">
                  📋 Copy Full YouTube Description
                </button>
              </div>
            </div>
          </details>
        </div>

        <div class="h2cv-card-actions">
          <button type="button" class="h2cv-jump-btn" data-target="${mod.targetId}">
            ${jumpLabels[mod.step] || `🎯 Jump to Step ${mod.step} in Workspace &rarr;`}
          </button>
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <a href="https://youtu.be/${encodeURIComponent(ytId)}" target="_blank" rel="noopener noreferrer" class="h2cv-yt-link-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#dc2626" aria-hidden="true"><path d="M21.58 7.19a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.68.49a2.7 2.7 0 0 0-1.9 1.9A28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .42 4.81 2.7 2.7 0 0 0 1.9 1.9C6 19.2 12 19.2 12 19.2s6 0 7.68-.49a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.42-4.81ZM9.8 15.33V8.67L15.6 12l-5.8 3.33Z"/></svg>
              Watch on YouTube &rarr;
            </a>
            <button type="button" class="h2cv-edit-btn" data-step="${mod.step}">
              ✏️ Edit URL
            </button>
          </div>
        </div>
      `);

      // Copy YouTube Description handler
      const copyBtn = card.querySelector('.h2cv-copy-desc-btn');
      if (copyBtn) {
        copyBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(mod.fullDescription);
            copyBtn.classList.add('copied');
            copyBtn.textContent = '✓ Copied to Clipboard!';
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              copyBtn.textContent = '📋 Copy Full YouTube Description';
            }, 2500);
          } catch {
            const ta = document.createElement('textarea');
            ta.value = mod.fullDescription;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            copyBtn.classList.add('copied');
            copyBtn.textContent = '✓ Copied to Clipboard!';
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              copyBtn.textContent = '📋 Copy Full YouTube Description';
            }, 2500);
          }
        };
      }

      // Play button click & keyboard handler (Strict Lazy Loading - NO iframe until interaction)
      const screen = card.querySelector('.h2cv-screen');
      const startPlayback = () => {
        const box = card.querySelector(`#h2cv-player-box-${mod.step}`);
        if (!box) return;
        const currentId = getStoredVideos()[mod.step] || mod.defaultYtId;
        const safeId = encodeURIComponent(sanitizeVideoId(currentId, mod.defaultYtId));
        const safeTitle = escapeHtml(mod.title);
        adoptSafe(box, `
          <iframe 
            src="https://www.youtube-nocookie.com/embed/${safeId}?autoplay=1&rel=0&modestbranding=1" 
            title="${safeTitle}" 
            style="width: 100%; height: 100%; border: 0;" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            loading="lazy">
          </iframe>
        `);
      };
      screen.onclick = startPlayback;
      screen.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startPlayback();
        }
      };

      // Jump to step
      const jumpBtn = card.querySelector('.h2cv-jump-btn');
      jumpBtn.onclick = () => {
        closeVideoDrawer();
        const el = document.getElementById(mod.targetId) || 
          document.querySelector(`[data-step="${mod.step}"]`) ||
          document.querySelector('h2');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      // Edit YouTube ID
      const editBtn = card.querySelector('.h2cv-edit-btn');
      editBtn.onclick = () => {
        const current = getStoredVideos()[mod.step] || '';
        const input = prompt(
          `Enter the YouTube Video URL or 11-character Video ID for Episode ${mod.step} ("${mod.shortTitle}"):\n(e.g., https://youtu.be/dQw4w9WgXcQ or dQw4w9WgXcQ)`,
          current
        );
        if (input !== null) {
          const parsed = parseYouTubeId(input);
          if (parsed) {
            saveVideoId(mod.step, parsed);
            renderCards(filterNum);
            alert(`Episode ${mod.step} video updated to YouTube ID: ${parsed}`);
          } else if (input.trim() === '') {
            saveVideoId(mod.step, mod.defaultYtId);
            renderCards(filterNum);
          } else {
            alert('Could not recognize a valid YouTube Video ID or URL. Please check the link and try again.');
          }
        }
      };

      body.appendChild(card);
    });
  }

  function filterStep(num) {
    currentFilter = num;
    [...tabs.querySelectorAll('.h2cv-tab-btn')].forEach((btn, idx) => {
      if (num === null && idx === 0) btn.classList.add('active');
      else if (num !== null && idx === num) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    renderCards(num);
  }

  function scrollToStep(stepNum) {
    filterStep(stepNum);
    setTimeout(() => {
      const card = body.querySelector(`#h2cv-step-card-${stepNum}`);
      card?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  renderCards(targetStep);

  // Footer
  const foot = document.createElement('div');
  foot.className = 'h2cv-foot';
  adoptSafe(foot, `
    <div style="display: flex; align-items: center; gap: 6px;">
      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
      <span>7 Video Modules • Apollo RCA &amp; RealityCharting Academy</span>
    </div>
    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <a href="${OFFICIAL_CHANNEL_URL}" target="_blank" rel="noopener noreferrer" class="h2cv-foot-yt-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#dc2626" aria-hidden="true"><path d="M21.58 7.19a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.68.49a2.7 2.7 0 0 0-1.9 1.9A28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .42 4.81 2.7 2.7 0 0 0 1.9 1.9C6 19.2 12 19.2 12 19.2s6 0 7.68-.49a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.42-4.81ZM9.8 15.33V8.67L15.6 12l-5.8 3.33Z"/></svg>
        <span>@h2c_Learnings YouTube</span> ↗
      </a>
      <span style="color: #cbd5e1;">•</span>
      <a href="https://realitycharting.com/home/" target="_blank" rel="noopener noreferrer" style="color: #991b1b; font-weight: 700; text-decoration: underline;">
        Official RealityCharting&reg; ↗
      </a>
    </div>
  `);

  panel.append(head, syncBar, tabs, body, foot);
  document.body.append(back, panel);
  closeBtn.focus();

  // Escape & Accessible Tab Trap
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoDrawer();
    if (e.key === 'Tab') {
      const focusables = [...panel.querySelectorAll('button, input, a[href], details summary, [tabindex="0"]')].filter(el => !el.disabled && el.offsetParent !== null);
      if (!focusables.length) return;
      const i = focusables.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0 || i === -1)) {
        e.preventDefault();
        focusables.at(-1)?.focus();
      } else if (!e.shiftKey && i === focusables.length - 1) {
        e.preventDefault();
        focusables[0]?.focus();
      }
    }
  });

  if (targetStep) {
    scrollToStep(targetStep);
  }
}

export function mountVideoButtons() {
  if (!document.body) return;

  // 1. Floating FAB (above ? Help)
  if (!fab || !fab.isConnected) {
    fab = document.createElement('button');
    fab.className = 'no-print h2cv-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Open 7-Step Methodology Training Videos');
    adoptSafe(fab, `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true"><path d="M21.58 7.19a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.68.49a2.7 2.7 0 0 0-1.9 1.9A28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .42 4.81 2.7 2.7 0 0 0 1.9 1.9C6 19.2 12 19.2 12 19.2s6 0 7.68-.49a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.42-4.81ZM9.8 15.33V8.67L15.6 12l-5.8 3.33Z"/></svg>
      <span>▶ 7 Videos</span>
    `);
    fab.onclick = () => openVideoDrawer();
    document.body.append(fab);
  }

  // 2. Toolbar Button next to ? Help
  const helpBtn = document.querySelector('.h2ch-tb') || 
    [...document.querySelectorAll('button')].find(b => /^\s*\?\s*Help\s*$/.test(b.textContent));
  if (helpBtn && !document.querySelector('.h2cv-tb')) {
    const tbBtn = document.createElement('button');
    tbBtn.className = 'no-print h2cv-tb';
    tbBtn.type = 'button';
    tbBtn.setAttribute('aria-label', 'Open 7-Step Methodology Training Videos');
    adoptSafe(tbBtn, `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc2626" aria-hidden="true"><path d="M21.58 7.19a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.68.49a2.7 2.7 0 0 0-1.9 1.9A28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .42 4.81 2.7 2.7 0 0 0 1.9 1.9C6 19.2 12 19.2 12 19.2s6 0 7.68-.49a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.42-4.81ZM9.8 15.33V8.67L15.6 12l-5.8 3.33Z"/></svg>
      <span>▶ 7 Videos (Training)</span>
    `);
    tbBtn.onclick = () => openVideoDrawer();
    helpBtn.parentNode.insertBefore(tbBtn, helpBtn.nextSibling);
  }
}

export function initVideos() {
  if (typeof document === 'undefined') return;
  if (!document.head.contains(css)) document.head.append(css);
  window.h2cOpenVideoDrawer = openVideoDrawer;
  mountVideoButtons();

  if (document.body) {
    new MutationObserver(() => {
      mountVideoButtons();
    }).observe(document.body, { childList: true, subtree: true });
  }
}

// Auto-run if loaded
if (typeof document !== 'undefined') {
  whenHydrated(() => setTimeout(initVideos, 60));
}
