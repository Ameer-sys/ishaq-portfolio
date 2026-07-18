window.portfolioData = {
  projects: [
    {
      title: "PillPal",
      shortDescription:
        "A connected medication adherence system pairing a five-compartment smart pillbox with a real-time care dashboard.",
      fullDescription:
        "Built with Bheesha during the Akatos Arena two-week builder sprint hosted by Akatos and Builders Club Waterloo. PillPal helps older adults and people managing chronic illnesses take medication more reliably and independently.",
      technologies: [
        "ESP32",
        "C++",
        "Arduino",
        "Firebase",
        "Firestore",
        "JavaScript",
        "REST APIs",
        "IoT",
        "Onshape",
        "3D Printing",
      ],
      role: "Co-builder and co-founder",
      date: "Two-week builder sprint",
      category: "featured",
      featured: true,
      projectStatus: "Working prototype",
      visual: "pillpal",
      githubUrl: "https://github.com/Ameer-sys/PillPal",
      liveUrl: "https://ameer-sys.github.io/PillPal/",
      keyFeatures: [
        "Visual, vibration, and sound medication reminders",
        "Reed-switch dose confirmation and missed-dose tracking",
        "Real-time hardware and dashboard synchronization",
        "Custom Onshape enclosure and 3D-printed prototype",
        "Velocity Cornerstone finalist",
      ],
    },
    {
      title: "Naftelia",
      shortDescription:
        "Voyage intelligence that combines marine conditions, route reasoning, mapping, and offline planning.",
      fullDescription:
        "A decision-support platform for sailors, fishers, and vessel operators, built during ConHacks 2026 with real-world marine data and resilient low-connectivity workflows.",
      technologies: ["Python", "Flask", "NOAA", "Gemini", "Leaflet", "Auth0", "SQLite"],
      role: "Developer",
      date: "April 2026",
      category: "featured",
      featured: true,
      projectStatus: "Hackathon prototype",
      visual: "naftelia",
      githubUrl: "https://github.com/Ameer-sys/Naftelia",
      keyFeatures: [
        "NOAA marine forecasts, tides, and observations",
        "Gemini-assisted voyage reasoning",
        "Interactive Leaflet route visualization",
        "24-hour offline voyage packs",
      ],
    },
    {
      title: "LegalAI",
      shortDescription:
        "An AI-powered legal information assistant for Ontario landlord and tenant matters.",
      fullDescription:
        "Built during ConHacks to help users navigate information related to the Ontario Landlord and Tenant Board through legal-document search and AI-generated responses. It is an information tool, not legal advice.",
      technologies: ["Python", "Streamlit", "Flask", "Docker", "Embeddings", "OpenAI API"],
      role: "Frontend developer",
      date: "ConHacks 2025",
      category: "featured",
      featured: true,
      projectStatus: "Hackathon prototype",
      visual: "legalai",
      keyFeatures: [
        "Ontario landlord and tenant information focus",
        "Semantic search across legal documents",
        "AI-generated plain-language responses",
        "Frontend-first contribution",
      ],
    },
    {
      title: "Smadium",
      shortDescription:
        "A cross-platform smart stadium management system for live monitoring, control, and auditing.",
      fullDescription:
        "An enterprise-style desktop system that simulates environmental sensors, crowd safety, facility controls, energy monitoring, and role-based operations.",
      technologies: [".NET 9", "C# 12", "Avalonia UI", "MVVM", "MySQL"],
      role: "Developer",
      category: "additional",
      featured: false,
      projectStatus: "Completed academic project",
      visual: "smadium",
      keyFeatures: [
        "Three-layer architecture",
        "Role-based access and MySQL authentication",
        "Real-time sensor and controller simulation",
        "Activity logging and audit trails",
      ],
    },
    {
      title: "DriveTracker",
      shortDescription:
        "A mobile driving analytics app that records trips and turns route data into performance feedback.",
      fullDescription:
        "A React Native app with trip recording, custom driving scores, route history, and cloud-backed persistence.",
      technologies: ["React Native", "Expo", "JavaScript", "Supabase", "PostgreSQL"],
      role: "Developer",
      category: "additional",
      featured: false,
      projectStatus: "Prototype",
      visual: "drivetracker",
      githubUrl: "https://github.com/Ameer-sys/drivetracker",
      keyFeatures: [
        "GPS-based trip recording",
        "Custom driving score logic",
        "Trip history and route previews",
        "Supabase data synchronization",
      ],
    },
    {
      title: "Remote Robot Control",
      shortDescription:
        "A distributed robot-control system using a web interface and TCP/UDP communication.",
      technologies: ["C++", "Crow", "Docker", "TCP", "UDP"],
      role: "Developer",
      category: "additional",
      featured: false,
      projectStatus: "COIL project",
      visual: "robot",
      githubUrl: "https://github.com/Ameer-sys/COIL-Project",
      keyFeatures: ["Web-based controls", "Multi-configuration routing", "Logging and monitoring"],
    },
  ],
  experience: [
    {
      organization: "eCampusOntario",
      title: "Board of Director's",
      date: "April 2026 - Present",
      description:
        "Contributing to discussions around digital learning, education technology, and innovation.",
    },
  ],
  community: [
    {
      organization: "IT Club, Conestoga College",
      title: "Treasurer and executive member",
      date: "Sept 2025 - Present",
      description:
        "Help organize club activities, workshops, showcases, and student engagement while supporting budgeting, event coordination, promotional materials, and volunteer communication.",
    },
    {
      organization: "GDG Waterloo",
      title: "Community member and volunteer",
      date: "March 2026 - Present",
      description:
        "Participate in developer meetups and community learning focused on cloud, AI, mobile development, and connecting with local builders.",
    },
    {
      organization: "HackCanada",
      title: "Hackathon participant",
      date: "March 2026",
      description:
        "Collaborated in a team environment to brainstorm, develop, and present a functional prototype under time constraints.",
    },
  ],
  skills: [
    {
      category: "Programming Languages",
      items: [
        { name: "C", icon: "c/c-original.svg", note: "Systems foundations and memory-aware programming." },
        { name: "C++", icon: "cplusplus/cplusplus-original.svg", note: "OOP, networking, embedded work, and algorithms." },
        { name: "C#", icon: "csharp/csharp-original.svg", note: "Desktop systems and structured application architecture." },
        { name: "Python", icon: "python/python-original.svg", note: "APIs, AI integrations, services, and scripting." },
        { name: "JavaScript", icon: "javascript/javascript-original.svg", note: "Web interfaces, mobile apps, and interactive experiences." },
        { name: "SQL", icon: "mysql/mysql-original.svg", note: "Relational data design, queries, and persistence." },
      ],
    },
    {
      category: "Frontend",
      items: [
        { name: "HTML", icon: "html5/html5-original.svg", note: "Semantic, accessible page structure." },
        { name: "CSS", icon: "css3/css3-original.svg", note: "Responsive layouts, theming, and motion." },
        { name: "React Native", icon: "react/react-original.svg", note: "Component-based mobile interfaces." },
        { name: "Expo", icon: "expo/expo-original.svg", note: "Mobile development and testing workflows." },
        { name: "Streamlit", glyph: "ST", note: "Fast interactive interfaces for Python applications." },
        { name: "Avalonia UI", glyph: "AU", note: "Cross-platform desktop interfaces using MVVM." },
      ],
    },
    {
      category: "Backend and Data",
      items: [
        { name: "Flask", icon: "flask/flask-original.svg", note: "Python APIs and service-based backends." },
        { name: ".NET", icon: "dot-net/dot-net-original.svg", note: "Application services and structured C# systems." },
        { name: "Firebase", icon: "firebase/firebase-plain.svg", note: "Realtime synchronization and application data." },
        { name: "Supabase", icon: "supabase/supabase-original.svg", note: "PostgreSQL-backed authentication and app storage." },
        { name: "MySQL", icon: "mysql/mysql-original.svg", note: "Relational storage and authentication data." },
        { name: "REST APIs", glyph: "API", note: "Clear contracts between devices, services, and interfaces." },
      ],
    },
    {
      category: "AI and Machine Learning",
      items: [
        { name: "Gemini", icon: "googlecloud/googlecloud-original.svg", note: "AI-assisted planning and route reasoning." },
        { name: "OpenAI API", glyph: "AI", note: "AI-generated responses and application integrations." },
        { name: "Deepseek", glyph: "DS", note: "Exploration of AI-assisted response workflows." },
        { name: "Embeddings", glyph: "EM", note: "Semantic search across document collections." },
      ],
    },
    {
      category: "Embedded, Design, and Prototyping",
      items: [
        { name: "ESP32", glyph: "32", note: "Connected device control and sensor integration." },
        { name: "Arduino", icon: "arduino/arduino-original.svg", note: "Embedded prototyping and hardware behavior." },
        { name: "Onshape", glyph: "OS", note: "CAD design for custom physical enclosures." },
        { name: "3D Printing", glyph: "3D", note: "Rapid enclosure and hardware prototyping." },
        { name: "IoT", glyph: "IoT", note: "Hardware, cloud, and interface synchronization." },
      ],
    },
    {
      category: "Development Tools",
      items: [
        { name: "Git", icon: "git/git-original.svg", note: "Version control and team collaboration." },
        { name: "GitHub", icon: "github/github-original.svg", note: "Public project documentation and source collaboration." },
        { name: "Docker", icon: "docker/docker-original.svg", note: "Repeatable development and deployment environments." },
        { name: "Vercel", glyph: "V", note: "Portfolio hosting and preview deployments." },
        { name: "VS Code", icon: "vscode/vscode-original.svg", note: "Primary development environment." },
      ],
    },
  ],
};
