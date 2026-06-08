const DIAGRAMS = [
  { id: 'flowchart', label: 'Flowchart', icon: 'Workflow', code: 'graph TD\n  A[Start] --> B{Is it working?}\n  B -->|Yes| C[Great!]\n  B -->|No| D[Fix it]\n  D --> A' },
  { id: 'class', label: 'Class', icon: 'Sitemap', code: 'classDiagram\n  class Animal {\n    +String name\n    +makeSound()\n  }\n  class Dog {\n    +breed\n    +makeSound()\n  }\n  class Cat {\n    +lives\n    +makeSound()\n  }\n  Animal <|-- Dog\n  Animal <|-- Cat\n  Animal : +eat()\n  Animal : +sleep()' },
  { id: 'sequence', label: 'Sequence', icon: 'ArrowRightLeft', code: 'sequenceDiagram\n  participant Alice\n  participant Bob\n  Alice->>John: Hello John, how are you?\n  John-->>Alice: Great!\n  Alice-)John: See you later!\n  Note over Alice,John: A friendly conversation' },
  { id: 'entity-relationship', label: 'ER Diagram', icon: 'Database', code: 'erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE-ITEM : contains\n  CUSTOMER {\n    string name\n    string email\n  }\n  ORDER {\n    int orderNumber\n    date placedAt\n  }' },
  { id: 'state', label: 'State', icon: 'CircleDot', code: 'stateDiagram-v2\n  [*] --> Still\n  Still --> [*]\n  Still --> Moving\n  Moving --> Still\n  Moving --> Crash\n  Crash --> [*]' },
  { id: 'info', label: 'Info', icon: 'Info', code: 'info\n  showInfo' },
  { id: 'gantt', label: 'Gantt', icon: 'ChartBar', code: 'gantt\n  title Project Timeline\n  dateFormat YYYY-MM-DD\n  axisFormat %b %d\n\n  section Planning\n  Requirements :a1, 2024-03-01, 7d\n  Design :a2, after a1, 5d\n\n  section Development\n  Frontend :a3, after a2, 10d\n  Backend :a4, after a2, 10d\n\n  section Testing\n  QA :a5, after a3, 5d\n  Deployment :a6, after a4 a5, 3d' },
  { id: 'kanban', label: 'Kanban', icon: 'Columns3', code: 'kanban\n  Todo [Create wireframes]\n  Todo [Set up database]\n  Doing [Develop API]\n  Doing [Build UI components]\n  Done [Project setup]\n  Done [Requirements review]' },
  { id: 'timeline', label: 'Timeline', icon: 'Timeline', code: 'timeline\n  title Company Milestones\n  2020 : Founded\n  2021 : First product launch\n  2022 : 100k users\n  2023 : Series A funding\n  2024 : International expansion' },
  { id: 'user-journey', label: 'User Journey', icon: 'Route', code: 'journey\n  title User Onboarding\n  section Sign Up\n    Create account: 5: User\n    Verify email: 3: User\n  section Setup\n    Complete profile: 4: User\n    First action: 5: User, System\n  section Success\n    Achieve goal: 5: User' },
  { id: 'requirement', label: 'Requirement', icon: 'CheckCircle', code: 'requirementDiagram\n  requirement Authentication {\n    id: 1\n    text: User must log in\n    risk: high\n    verifymethod: test\n  }\n  element LoginForm {\n    type: UI\n  }\n  LoginForm - satisfies -> Authentication' },
  { id: 'mindmap', label: 'Mindmap', icon: 'GitFork', code: 'mindmap\n  root((Project))\n    Frontend\n      React\n      TypeScript\n      CSS\n    Backend\n      Node.js\n      Database\n    DevOps\n      CI/CD\n      Docker\n      Cloud' },
  { id: 'architecture', label: 'Architecture', icon: 'Building2', code: 'architecture-beta\n  group api(cloud)[Cloud Services]\n  service db(database)[Database] in api\n  service srv(server)[Web Server] in api\n  service gw(globe)[Gateway] in api\n  db:R <--> L:srv\n  srv:T <--> B:gw' },
  { id: 'block', label: 'Block', icon: 'Grid3x3', code: 'block-beta\n  columns 3\n  A B C\n  D E F\n  G H I' },
  { id: 'c4', label: 'C4 Diagram', icon: 'Layers', code: 'C4Context\n  title System Context\n  Enterprise_Boundary(b0, "SystemScope") {\n    Person(user, "User", "A user of the system")\n    System(sys, "My System", "The main system")\n    System_Ext(external, "External API", "Third party service")\n  }\n  Rel(user, sys, "Uses")\n  Rel(sys, external, "Calls")' },
  { id: 'git', label: 'Git Graph', icon: 'GitBranch', code: 'gitGraph\n  commit\n  branch develop\n  checkout develop\n  commit\n  commit\n  checkout main\n  merge develop\n  commit\n  branch feature\n  checkout feature\n  commit\n  checkout main\n  merge feature' },
  { id: 'ishikawa', label: 'Ishikawa', icon: 'FishSymbol', code: 'ishikawa\n  title Fishbone Diagram\n  People: skill shortage, miscommunication\n  Process: lack of standards, approval delay\n  Technology: outdated tools, compatibility\n  Measurement: poor metrics, no feedback' },
  { id: 'packet', label: 'Packet', icon: 'Package', code: 'packet-beta\n0-3: "Version"\n4-7: "Header Length"\n8-15: "Total Length"\n16-23: "Source IP"\n24-31: "Dest IP"\n32-39: "Payload"' },
  { id: 'pie', label: 'Pie Chart', icon: 'PieChart', code: 'pie title Browser Market Share\n  "Chrome" : 65\n  "Safari" : 15\n  "Firefox" : 10\n  "Edge" : 7\n  "Other" : 3' },
  { id: 'quadrant', label: 'Quadrant', icon: 'Table2', code: 'quadrantChart\n  title Strategy Matrix\n  x-axis Low Priority --> High Priority\n  y-axis Low Effort --> High Effort\n  quadrant-1 "Quick Wins"\n  quadrant-2 "Major Projects"\n  quadrant-3 "Fill-Ins"\n  quadrant-4 "Avoid"\n  "Fix Bug": [0.8, 0.2]\n  "New Feature": [0.9, 0.8]\n  "Refactor": [0.3, 0.7]' },
  { id: 'radar', label: 'Radar', icon: 'Radar', code: 'radar-beta\n  title Skill Assessment\n  axis Communication, Coding, Design\n  curve you{4, 5, 3}' },
  { id: 'sankey', label: 'Sankey', icon: 'TrendingUp', code: 'sankey-beta\n  %% Sources, Targets, Values\n  Solar, Residential, 40\n  Solar, Commercial, 25\n  Wind, Residential, 30\n  Wind, Commercial, 20\n  Grid, Residential, 60\n  Grid, Commercial, 80' },
  { id: 'treeview', label: 'TreeView', icon: 'FolderTree', code: '%% TreeView-like with mindmap\nmindmap\n  root((File System))\n    Documents\n      Work\n        report.pdf\n        slides.pptx\n      Personal\n        photos\n        music\n    Downloads\n      tools\n      assets\n    Projects\n      web-app\n      mobile-app' },
  { id: 'treemap', label: 'Treemap', icon: 'LayoutTemplate', code: '%% Treemap-like with mindmap\nmindmap\n  root((Market))\n    Technology\n      Apple\n      Samsung\n      Google\n    Energy\n      Shell\n      BP\n    Finance\n      JPMorgan\n      Goldman' },
  { id: 'venn', label: 'Venn', icon: 'Circle', code: '%% Venn-style with flowchart\nflowchart TD\n  A((Skills))\n  B((Interests))\n  C((Opportunities))\n  A x--x B\n  B x--x C\n  A x--x C' },
  { id: 'eventmodeling', label: 'Event Modeling', icon: 'Timeline', code: 'eventmodeling\n\ntf 01 ui CartUI\ntf 02 cmd AddItem\ntf 03 evt ItemAdded' },
]

const TYPE_DETECTORS = [
  { regex: /^%%\s*Venn[\s\S]*?^flowchart\b/im, id: 'venn' },
  { regex: /^graph\s+(TB|BT|RL|LR|TD)\b/im, id: 'flowchart' },
  { regex: /^flowchart\s+(TB|BT|RL|LR|TD)\b/im, id: 'flowchart' },
  { regex: /^classDiagram\b/im, id: 'class' },
  { regex: /^sequenceDiagram\b/im, id: 'sequence' },
  { regex: /^erDiagram\b/im, id: 'entity-relationship' },
  { regex: /^stateDiagram\b/im, id: 'state' },
  { regex: /^gantt\b/im, id: 'gantt' },
  { regex: /^kanban\b/im, id: 'kanban' },
  { regex: /^timeline\b/im, id: 'timeline' },
  { regex: /^journey\b/im, id: 'user-journey' },
  { regex: /^requirementDiagram\b/im, id: 'requirement' },
  { regex: /^%%\s*TreeView[\s\S]*?^mindmap\b/im, id: 'treeview' },
  { regex: /^%%\s*Treemap[\s\S]*?^mindmap\b/im, id: 'treemap' },
  { regex: /^mindmap\b/im, id: 'mindmap' },
  { regex: /^architecture-beta\b/im, id: 'architecture' },
  { regex: /^block-beta\b/im, id: 'block' },
  { regex: /^C4Context\b/im, id: 'c4' },
  { regex: /^gitGraph\b/im, id: 'git' },
  { regex: /^ishikawa\b/im, id: 'ishikawa' },
  { regex: /^packet-beta\b/im, id: 'packet' },
  { regex: /^pie\b/im, id: 'pie' },
  { regex: /^quadrantChart\b/im, id: 'quadrant' },
  { regex: /^sankey-beta\b/im, id: 'sankey' },
  { regex: /^radar-beta\b/im, id: 'radar' },
  { regex: /^info\b/im, id: 'info' },
  { regex: /^eventmodeling\b/im, id: 'eventmodeling' },
]

export default DIAGRAMS
export { TYPE_DETECTORS }

export const DEFAULT_THEME_COLORS = {
  primaryColor: '#6366f1',
  secondaryColor: '#eef2ff',
  lineColor: '#495057',
  primaryBorderColor: '#ffffff',
  primaryTextColor: '#212529',
}

export const PALETTE_PRESETS = {
  indigo:  { primaryColor: '#6366f1', secondaryColor: '#eef2ff', lineColor: '#495057', primaryBorderColor: '#ffffff', primaryTextColor: '#212529' },
  emerald: { primaryColor: '#10b981', secondaryColor: '#d1fae5', lineColor: '#374151', primaryBorderColor: '#ffffff', primaryTextColor: '#111827' },
  rose:    { primaryColor: '#f43f5e', secondaryColor: '#ffe4e6', lineColor: '#6b7280', primaryBorderColor: '#ffffff', primaryTextColor: '#1f2937' },
  amber:   { primaryColor: '#f59e0b', secondaryColor: '#fef3c7', lineColor: '#525252', primaryBorderColor: '#ffffff', primaryTextColor: '#171717' },
  teal:    { primaryColor: '#14b8a6', secondaryColor: '#ccfbf1', lineColor: '#334155', primaryBorderColor: '#ffffff', primaryTextColor: '#0f172a' },
}

export const DEFAULT_CONFIG = `{
  "theme": "default",
  "themeVariables": {}
}`
