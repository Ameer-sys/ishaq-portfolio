window.portfolioData = {
  projects: [
    {
      title: "PillPal",
      shortDescription:
        "A smart medication reminder system pairing a five-compartment pillbox with a real-time management dashboard.",
      fullDescription:
        "Built with Bheesha during the Akatos Arena and Builders Club Waterloo two-week builder sprint. I designed the modular Onshape enclosure and helped deliver a functioning hardware and software prototype within the sprint.",
      technologies: [
        "ESP32",
        "Arduino / C++",
        "Firebase",
        "Firestore",
        "JavaScript",
        "REST APIs",
        "IoT",
        "Onshape",
        "3D Printing",
      ],
      role: "Co-builder and co-founder",
      date: "Akatos Arena - May 2026",
      category: "featured",
      featured: true,
      projectStatus: "Working prototype / finalist",
      visual: "pillpal",
      githubUrl: "https://github.com/Ameer-sys/PillPal",
      liveUrl: "https://ameer-sys.github.io/PillPal/",
      keyFeatures: [
        "Visual, vibration, and audio medication reminders",
        "Magnetic reed-switch detection for opened compartments",
        "Scheduled, taken, and missed-dose tracking",
        "Real-time device and dashboard synchronization",
        "Velocity Cornerstone finalist",
      ],
    },
    {
      title: "Precision Agriculture Sprayer Drone",
      shortDescription:
        "A functional remote-controlled spraying drone prototype built to explore more targeted treatment in precision agriculture.",
      fullDescription:
        "The current prototype uses a Pixhawk and ArduPilot flight system, ELRS control, FPV, brushless motors, ESCs, a LiPo power system, and a custom 12V diaphragm-pump spraying setup. Autonomous navigation and plant detection remain part of the future roadmap, not the current build.",
      technologies: [
        "Drone",
        "ArduPilot",
        "Pixhawk",
        "ELRS",
        "FPV",
        "Embedded Systems",
        "Hardware",
        "Robotics",
      ],
      role: "Hardware and embedded systems developer",
      date: "Prototype demonstrated in 2026",
      category: "featured",
      featured: true,
      projectStatus: "Prototype / active development",
      visual: "drone",
      keyFeatures: [
        "Flight-tested remote-controlled platform",
        "Custom pump and liquid spraying hardware",
        "Integrated flight controller, radio, FPV, and power systems",
        "Roadmap: sensing, computer vision, and targeted autonomy",
      ],
    },
    {
      title: "BlockBuilt",
      shortDescription:
        "A customizable 90-day fitness challenge app with persistent progress, daily check-ins, and a voxel-inspired mobile experience.",
      fullDescription:
        "An actively developed React Native application with authentication, protected routes, multi-step onboarding, database-backed challenges, a 90-day calendar, XP logic, and resilient loading and error states. Advanced workout building and notifications remain future work.",
      technologies: [
        "React Native",
        "Expo",
        "TypeScript",
        "Expo Router",
        "Supabase",
        "PostgreSQL",
        "TanStack Query",
        "Jest",
      ],
      role: "Full-stack mobile developer",
      date: "Active build - 2026",
      category: "featured",
      featured: true,
      projectStatus: "In development",
      visual: "blockbuilt",
      keyFeatures: [
        "Authentication, persistent sessions, and protected routes",
        "Multi-step onboarding and database-backed challenges",
        "90-day calendar, daily check-ins, and XP logic",
        "Supabase Row Level Security and persistent user data",
      ],
    },
    {
      title: "LegalAI",
      shortDescription:
        "An AI-powered information assistant for navigating Ontario landlord and tenant resources.",
      fullDescription:
        "Built during ConHacks 2025 using legal-document processing, JSON-based datasets, information retrieval, and LLM-powered responses. I focused primarily on frontend and application development while collaborating on the prototype and presentation. It is an information tool, not legal advice.",
      technologies: ["Python", "Streamlit", "Flask", "Docker", "Semantic Retrieval", "AI API"],
      role: "Frontend and application developer",
      date: "ConHacks 2025",
      category: "featured",
      featured: true,
      projectStatus: "Completed hackathon project",
      visual: "legalai",
      keyFeatures: [
        "Ontario landlord and tenant information focus",
        "Structured and unstructured legal-document processing",
        "Information retrieval and LLM-powered responses",
        "Team-built and presented under hackathon constraints",
      ],
    },
    {
      title: "Distributed Robot Control System",
      shortDescription:
        "A containerized C++ web server for remote robot commands and real-time communication across distributed components.",
      fullDescription:
        "Designed during a COIL project using Crow, Docker, TCP, and UDP, with a simple web interface for issuing commands and monitoring responses.",
      technologies: ["C++", "Crow", "Docker", "TCP", "UDP", "Distributed Systems"],
      role: "Developer",
      date: "February 2026 - April 2026",
      category: "additional",
      featured: false,
      projectStatus: "Completed COIL project",
      visual: "robot",
      githubUrl: "https://github.com/Ameer-sys/COIL-Project",
      keyFeatures: [
        "Containerized Crow web server",
        "TCP and UDP communication",
        "Command interface and response monitoring",
      ],
    },
    {
      title: "RadarCare",
      shortDescription:
        "An experimental privacy-preserving fall-detection system using mmWave radar instead of a camera.",
      fullDescription:
        "Current work covers radar integration research, dataset processing, Python pipeline development, and movement-classification experiments. The system is not clinically validated and does not claim medical accuracy.",
      technologies: ["Python", "ESP32", "mmWave Radar", "IWR6843AOP", "Machine Learning"],
      role: "Embedded and ML developer",
      date: "Active build - 2026",
      category: "additional",
      featured: false,
      projectStatus: "In progress",
      visual: "radarcare",
      keyFeatures: [
        "Camera-free presence and movement sensing",
        "Python data processing pipeline",
        "Activity-classification experiments",
      ],
    },
    {
      title: "DoxyQ",
      shortDescription:
        "An AI-assisted developer tool for turning existing source code into useful Doxygen-style documentation.",
      fullDescription:
        "The current direction includes repository ingestion, source analysis, Doxygen-compatible comments, and generated HTML documentation workflows.",
      technologies: ["Python", "LLMs", "GitHub", "Repository Analysis", "Doxygen"],
      role: "Developer",
      date: "Active build - 2026",
      category: "additional",
      featured: false,
      projectStatus: "In progress",
      visual: "doxyq",
      keyFeatures: [
        "Repository and source-code analysis",
        "Documentation generation workflows",
        "Doxygen-compatible output direction",
      ],
    },
    {
      title: "Naftelia",
      shortDescription:
        "Voyage intelligence combining marine conditions, route reasoning, mapping, and offline planning.",
      fullDescription:
        "A decision-support platform for sailors, fishers, and vessel operators, built during ConHacks 2026 with marine data and low-connectivity workflows.",
      technologies: ["Python", "Flask", "NOAA", "Gemini", "Leaflet", "Auth0", "SQLite"],
      role: "Developer",
      date: "ConHacks - April 2026",
      category: "additional",
      featured: false,
      projectStatus: "Hackathon prototype",
      visual: "naftelia",
      githubUrl: "https://github.com/Ameer-sys/Naftelia",
      keyFeatures: [
        "NOAA marine forecasts, tides, and observations",
        "AI-assisted voyage reasoning",
        "Interactive routes and offline voyage packs",
      ],
    },
    {
      title: "DriveTracker",
      shortDescription:
        "A mobile driving analytics app that turns GPS-based trip data into scores, trends, and visual feedback.",
      fullDescription:
        "Built with React Native, Expo, and Supabase, including SQL-backed trip storage, retrieval, scoring logic, and performance-history views.",
      technologies: ["React Native", "Expo", "JavaScript", "Supabase", "PostgreSQL", "GPS"],
      role: "Developer",
      date: "October 2025 - December 2025",
      category: "additional",
      featured: false,
      projectStatus: "Prototype",
      visual: "drivetracker",
      githubUrl: "https://github.com/Ameer-sys/drivetracker",
      keyFeatures: ["GPS-based driving data", "Driving score calculations", "Performance trends"],
    },
    {
      title: "Smadium",
      shortDescription:
        "A cross-platform smart stadium management system for live monitoring, facility control, and auditing.",
      fullDescription:
        "An academic desktop system simulating environmental sensors, crowd safety, facility controls, energy monitoring, and role-based operations.",
      technologies: [".NET 9", "C# 12", "Avalonia UI", "MVVM", "MySQL"],
      role: "Developer",
      date: "Academic project",
      category: "additional",
      featured: false,
      projectStatus: "Completed academic project",
      visual: "smadium",
      keyFeatures: ["Three-layer architecture", "Role-based access", "Sensor simulation"],
    },
  ],
  community: [
    {
      organization: "eCampusOntario",
      title: "Board of Directors - Student Representative",
      location: "Ontario, Canada",
      date: "April 2026 - Present",
      description:
        "Serve as a student representative on the eCampusOntario Board of Directors, contribute a college-student perspective to digital-learning discussions, and participate in strategic conversations about innovation, accessibility, and technology-enabled education in Ontario.",
    },
    {
      organization: "IT Club - Conestoga College",
      title: "President",
      date: "September 2025 - Present",
      description:
        "Lead the club and executive team after previously serving as Secretary. Help organize technical workshops, student events, campus engagement, promotional planning, volunteer communication, and collaboration with other campus groups.",
    },
    {
      organization: "GDG Waterloo",
      title: "Community member and volunteer",
      date: "March 2026 - Present",
      description:
        "Support workshops and technical events, collaborate with organizers and speakers, assist learners where appropriate, and encourage student participation in the developer community.",
    },
    {
      organization: "HackCanada",
      title: "Volunteer",
      date: "March 2026",
      description:
        "Supported the hackathon community and event experience as a volunteer, helping the event run smoothly for participants and organizers.",
    },
    {
      organization: "ConHacks",
      title: "Hackathon Participant",
      date: "2025 & 2026",
      description:
        "Participated in ConHacks twice, building LegalAI in 2025 and Naftelia in 2026 while collaborating with teams to design, build, and present functional hackathon prototypes.",
    },
  ],
  skills: [
    {
      category: "Languages",
      items: [
        { name: "C", icon: "c/c-original.svg", note: "Systems foundations and memory-aware programming." },
        { name: "C++", icon: "cplusplus/cplusplus-original.svg", note: "OOP, networking, embedded work, and algorithms." },
        { name: "C#", icon: "csharp/csharp-original.svg", note: "Desktop systems and structured application architecture." },
        { name: "Python", icon: "python/python-original.svg", note: "APIs, data pipelines, AI tools, and scripting." },
        { name: "Java", icon: "java/java-original.svg", note: "Object-oriented programming and coursework." },
        { name: "JavaScript", icon: "javascript/javascript-original.svg", note: "Web interfaces, mobile apps, and interactions." },
        { name: "TypeScript", icon: "typescript/typescript-original.svg", note: "Typed mobile applications and reusable UI." },
        { name: "SQL", icon: "mysql/mysql-original.svg", note: "Relational data design, queries, and persistence." },
        { name: "R", icon: "r/r-original.svg", note: "Statistical computing and data coursework." },
      ],
    },
    {
      category: "Frontend / Mobile",
      items: [
        { name: "HTML", icon: "html5/html5-original.svg", note: "Semantic, accessible page structure." },
        { name: "CSS", icon: "css3/css3-original.svg", note: "Responsive layouts, theming, and motion." },
        { name: "React", icon: "react/react-original.svg", note: "Component-driven dashboards and interfaces." },
        { name: "React Native", icon: "react/react-original.svg", note: "Cross-platform mobile applications." },
        { name: "Expo", icon: "expo/expo-original.svg", note: "Mobile development, routing, and testing workflows." },
        { name: "Streamlit", glyph: "ST", note: "Interactive interfaces for Python applications." },
        { name: "Avalonia UI", glyph: "AU", note: "Cross-platform desktop interfaces using MVVM." },
      ],
    },
    {
      category: "Backend / Databases",
      items: [
        { name: "Flask", icon: "flask/flask-original.svg", note: "Python APIs and service-based backends." },
        { name: ".NET", icon: "dot-net/dot-net-original.svg", note: "Application services and structured C# systems." },
        { name: "Firebase", icon: "firebase/firebase-plain.svg", note: "Realtime synchronization and application data." },
        { name: "Firestore", icon: "firebase/firebase-plain.svg", note: "Cloud document storage and device synchronization." },
        { name: "Supabase", icon: "supabase/supabase-original.svg", note: "Authentication and PostgreSQL-backed app storage." },
        { name: "PostgreSQL", icon: "postgresql/postgresql-original.svg", note: "Relational data modeling and persistence." },
        { name: "MySQL", icon: "mysql/mysql-original.svg", note: "Relational storage and authentication data." },
        { name: "REST APIs", glyph: "API", note: "Contracts between devices, services, and interfaces." },
      ],
    },
    {
      category: "AI / Data",
      items: [
        { name: "LLM APIs", glyph: "AI", note: "AI-assisted application and documentation workflows." },
        { name: "Embeddings", glyph: "EM", note: "Semantic information retrieval across documents." },
        { name: "PyTorch", icon: "pytorch/pytorch-original.svg", note: "Machine-learning experiments and model workflows." },
        { name: "scikit-learn", icon: "scikitlearn/scikitlearn-original.svg", note: "Classical machine-learning workflows." },
        { name: "Pandas", icon: "pandas/pandas-original.svg", note: "Structured data preparation and analysis." },
        { name: "NumPy", icon: "numpy/numpy-original.svg", note: "Numerical and array-based computing." },
      ],
    },
    {
      category: "Embedded / IoT",
      items: [
        { name: "ESP32", glyph: "32", note: "Connected device control and sensor integration." },
        { name: "Arduino", icon: "arduino/arduino-original.svg", note: "Embedded prototyping and hardware behavior." },
        { name: "Pixhawk", glyph: "PX", note: "Flight-control integration for drone prototypes." },
        { name: "ArduPilot", glyph: "AP", note: "Drone configuration, control, and flight testing." },
        { name: "UART", glyph: "TX", note: "Device-to-device serial communication." },
        { name: "Sensors", glyph: "SN", note: "Physical-state detection and embedded inputs." },
        { name: "mmWave", glyph: "MW", note: "Privacy-preserving radar sensing experiments." },
        { name: "IoT", glyph: "IoT", note: "Hardware, cloud, and interface synchronization." },
      ],
    },
    {
      category: "Testing / Development Tools",
      items: [
        { name: "Git", icon: "git/git-original.svg", note: "Version control and team collaboration." },
        { name: "GitHub", icon: "github/github-original.svg", note: "Project documentation, collaboration, and hosting." },
        { name: "Docker", icon: "docker/docker-original.svg", note: "Repeatable development and deployment environments." },
        { name: "Jest", icon: "jest/jest-plain.svg", note: "JavaScript and React Native testing." },
        { name: "VS Code", icon: "vscode/vscode-original.svg", note: "Primary development environment." },
        { name: "Linux / Ubuntu", icon: "linux/linux-original.svg", note: "Command-line tooling and systems workflows." },
        { name: "Postman", icon: "postman/postman-original.svg", note: "API exploration and endpoint testing." },
        { name: "Wireshark", glyph: "WS", note: "Network traffic inspection and protocol debugging." },
      ],
    },
    {
      category: "Design / CAD",
      items: [
        { name: "Onshape", glyph: "OS", note: "CAD design for custom physical enclosures." },
        { name: "3D Printing", glyph: "3D", note: "Rapid enclosure and hardware prototyping." },
      ],
    },
  ],
};
