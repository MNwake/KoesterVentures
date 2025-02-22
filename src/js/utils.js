export const frameworks = [
  {
    name: "FastAPI",
    icon: "/images/frameworks/fastapi.png",
    url: "https://fastapi.tiangolo.com/",
  },
  {
    name: "Firebase",
    icon: "/images/frameworks/firebase.png",
    url: "https://firebase.google.com/",
  },
  {
    name: "Flutter",
    icon: "/images/frameworks/flutter.png",
    url: "https://flutter.dev/",
  },
  {
    name: "Go",
    icon: "/images/frameworks/go.png",
    url: "https://golang.org/",
  },
  {
    name: "Kivy",
    icon: "/images/frameworks/kivy.jpg",
    url: "https://kivy.org/",
  },
  {
    name: "MongoDB",
    icon: "/images/frameworks/mongodb.png",
    url: "https://www.mongodb.com/",
  },
  {
    name: "FreeCAD",
    icon: "/images/frameworks/freecad.svg",
    url: "https://www.freecad.org/",
  },
  {
    name: "Nginx",
    icon: "/images/frameworks/nginx.png",
    url: "https://nginx.org/",
  },
  {
    name: "SwiftUI",
    icon: "/images/frameworks/swiftui.png",
    url: "https://developer.apple.com/xcode/swiftui/",
  },
  {
    name: "Python",
    icon: "/images/frameworks/python.png",
    url: "https://www.python.org/",
  },
  {
    name: "Raspberry Pi",
    icon: "/images/frameworks/raspberrypi.png",
    url: "https://www.raspberrypi.org/",
  },
  {
    name: "Playwright",
    icon: "/images/frameworks/playwright.svg",
    url: "https://playwright.dev/",
  },
  {
    name: "Redis",
    icon: "/images/frameworks/redis.png",
    url: "https://redis.io/",
  },
  {
    name: "Solidity",
    icon: "/images/frameworks/solidity.png",
    url: "https://soliditylang.org/",
  },
  {
    name: "SQLite",
    icon: "/images/frameworks/sqlite.png",
    url: "https://www.sqlite.org/",
  },
  {
    name: "Svelte",
    icon: "/images/frameworks/svelte.png",
    url: "https://svelte.dev/",
  },
  {
    name: "Swift",
    icon: "/images/frameworks/swift.png",
    url: "https://developer.apple.com/swift/",
  },
];

export const services = [
  {
    title: "Web & Mobile Development",
    description:
      "Custom websites and applications built with modern technologies and best practices.",
    icon: "🌐",
    features: [
      "Responsive Design",
      "Progressive Web Apps",
      "E-commerce Solutions",
      "Content Management Systems",
    ],
  },
  {
    title: "Backend Development",
    description:
      "Scalable and secure server-side solutions for your applications.",
    icon: "⚙️",
    features: [
      "API Development",
      "Database Design",
      "Cloud Infrastructure",
      "System Architecture",
    ],
  },
  {
    title: "Web3 Solutions",
    description:
      "Blockchain and cryptocurrency integration for modern applications.",
    icon: "🔗",
    features: [
      "Smart Contracts",
      "DApp Development",
      "Token Integration",
      "Blockchain Consulting",
    ],
  },
];

export const projects = [
  {
    title: "Cabled",
    description:
      "A mobile app for The Cable Watersports Association to manage cable wakeboard competitions while tracking results and national rankings.",
    tags: ["Mobile App", "SwiftUI", "REST API", "NoSQL DB"],
    image: "../../images/Cabled/main.jpeg",
  },
  {
    title: "CableCoin",
    description:
      "A cryptocurrency platform for the cable wakeboarding industry.",
    tags: ["Web3", "Svelte", "Blockchain", "Smart Contracts", "Solidity"],
    image: "../../images/CableCoin/card.png",
  },
  {
    title: "FishSurveys",
    description:
      "A data visualization and analytics tool for fisheries survey data, built to analyze fish populations and habitat trends.",
    tags: ["Golang", "Flutter", "Playwright", "Nginx"],
    image: "../../images/Fisheries/Home.jpeg",
  },
];

export const portfolio_projects = [
  // Cabled Components
  {
    title: "Cabled",
    status: "In Beta",
    description:
      "A high-performance SwiftUI app designed for spectators, offering real-time live scoring, detailed rider profiles, and dynamic national rankings. Built using MVVC architecture for optimal code clarity and responsiveness.",
    image: "/images/projects/cabled.jpg",
    tags: ["SwiftUI", "MVVC", "Realtime Updates", "Websockets"],
    category: "mobile",
    Github: "MNwake/Cabled_ios",
  },
  {
    title: "Cabled Admin",
    status: "In Beta",
    description:
      "A dedicated SwiftUI iPad application tailored for the Cable Wakeboard Association's event management. It enables administrators to run competitions and track results seamlessly, leveraging MVVC for a streamlined user experience.",
    image: "/images/projects/cabled.jpg",
    tags: ["SwiftUI", "MVVC", "User Management", "Admin Dashboard"],
    category: "mobile",
    Github: "MNwake/Cabled_Admin",
  },
  {
    title: "Cabled",
    status: "In Beta",
    description:
      "A robust Python backend built with FastAPI, integrating WebSockets for real-time communication, Pandas for dynamic data processing, and MongoDB for scalable storage. It efficiently processes judges' scores and updates rankings in real time.",
    image: "/images/projects/cabled.jpg",
    tags: ["Python", "FastAPI", "WebSockets", "Pandas", "MongoDB"],
    category: "server",
    Github: "",
  },

  // NoteBot Components
  {
    title: "NoteBot",
    status: "MVP / In Development",
    description:
      "A sleek SwiftUI frontend enabling users to record audio from conversations, meetings, and lectures, and instantly receive comprehensive, structured notes. Engineered with MVVC to ensure smooth and intuitive interaction.",
    image: "/images/projects/notebot.jpg",
    tags: ["SwiftUI", "MVVC", "Audio Recorder"],
    category: "mobile",
    Github: "",
  },
  {
    title: "NoteBot",
    status: "MVP / In Development",
    description:
      "A powerful Python backend that processes uploaded audio files by transcribing them using the AssemblyAI API and then generating detailed, formatted notes via the OpenAI API. Developed with FastAPI to handle asynchronous tasks efficiently.",
    image: "/images/projects/notebot.jpg",
    tags: ["Python", "FastAPI", "OpenAI", "AssemblyAI", "MongoDB"],
    category: "server",
    Github: "MNwake/notebot-backend",
  },

  // ProductScraper Components
  {
    title: "ProductScraper",
    status: "MVP / In Development",
    description:
      "A desktop application crafted with Kivy, designed to empower users to quickly compare discounted products from various department stores against Amazon prices, ensuring they never miss a great deal.",
    image: "/images/projects/scraper.jpg",
    tags: ["Kivy", "Desktop App"],
    category: "mobile",
    Github: "MNwake/WebScraper",
  },
  {
    title: "ProductScraper",
    status: "MVP / In Development",
    description:
      "An intelligent Python-based webscraper leveraging Playwright for robust web automation. It extracts and cleans product data from multiple sources and utilizes the OpenAI API to assess pricing competitiveness with Amazon.",
    image: "/images/projects/scraper.jpg",
    tags: ["Python", "Playwright", "Web Scraping", "OpenAI"],
    category: "server",
    Github: "MNwake/WebScraper",
  },

  // MN Fisheries Components
  {
    title: "MN Fisheries",
    status: "Beta (TestFlight)",
    description:
      "A Flutter-powered mobile app delivering a clean and intuitive interface for exploring Minnesota Fish Survey data. It features advanced search functionality that provides deep insights into regional fisheries statistics.",
    image: "/images/projects/mn-fisheries.jpg",
    tags: ["Flutter", "Mobile App"],
    category: "mobile",
    Github: "",
  },
  {
    title: "MN Fisheries",
    status: "Released",
    description:
      "A high-performance Go API server offering multiple endpoints to filter and sort fisheries data with precision. Designed to deliver rapid, query-based responses that enhance user interaction.",
    image: "/images/projects/mn-fisheries.jpg",
    tags: ["Go", "API", "Backend"],
    category: "server",
    Github: "",
  },
  {
    title: "MN Fisheries Scraper",
    status: "Released",
    description:
      "A dedicated Python webscraper built with Playwright that systematically extracts and cleans fish survey data from the MN DNR website, ensuring the mobile app displays accurate and up-to-date information.",
    image: "/images/projects/mn-fisheries.jpg",
    tags: ["Python", "Playwright", "Web Scraping"],
    category: "server",
    Github: "",
  },

  // CableOps Components
  {
    title: "CableOps",
    status: "MVP / In Development",
    description:
      "A KivyMD mobile application designed with MVC architecture to modernize cable park operations. It replaces legacy control systems by providing intuitive controls for cable system management and rider operations.",
    image: "/images/projects/cable-ops.jpg",
    tags: ["KivyMD", "MVC", "Mobile App"],
    category: "mobile",
    Github: "",
  },
  {
    title: "CableOps",
    status: "MVP / In Development",
    description:
      "A dynamic Python backend that integrates with hardware components such as motors and sensors. It serves as the central hub for automating cable park operations and managing rider data, facilitating real-time system control.",
    image: "/images/projects/cable-ops.jpg",
    tags: ["Python", "Backend", "Hardware Integration"],
    category: "server",
    Github: "",
  },

  // Web Development Projects Components
  // CabledWakeparks.com
  {
    title: "CabledWakeparks.com",
    status: "In Development",
    description:
      "A modern, responsive website for Cabled Wakeparks that highlights innovative cable park manufacturing. It features a custom-built e-commerce shop designed to offer a seamless user shopping experience.",
    image: "/images/projects/web-portfolio.jpg",
    tags: ["Svelte", "JavaScript", "E-commerce"],
    category: "web",
    Github: "",
  },
  {
    title: "CabledWakeparks.com",
    status: "In Development",
    description:
      "A scalable Python FastAPI server that supports the e-commerce platform with robust endpoints, integrates with Stripe for payment processing, and manages visitor analytics and contact forms efficiently.",
    image: "/images/projects/web-portfolio.jpg",
    tags: ["Python", "FastAPI", "Stripe", "Backend"],
    category: "server",
    Github: "",
  },

  // KoesterVentures.com
  {
    title: "KoesterVentures.com",
    status: "Live",
    description:
      "A sleek and modern website that showcases Koester Ventures' services and project portfolio. It features an AI chatbot that enhances user engagement and provides detailed information about the company's offerings.",
    image: "/images/projects/web-portfolio.jpg",
    tags: ["Svelte", "JavaScript", "HTML", "CSS"],
    category: "web",
    Github: "",
  },
  {
    title: "KoesterVentures.com",
    status: "Live",
    description:
      "A robust Python FastAPI server that powers the KoesterVentures.com website. It manages multiple endpoints, including an AI chatbot backend that processes conversations and interfaces seamlessly with the OpenAI API.",
    image: "/images/projects/web-portfolio.jpg",
    tags: ["Python", "FastAPI", "Backend", "AI Chat"],
    category: "server",
    Github: "",
  },

  // CableCoin.io
  {
    title: "CableCoin.io",
    status: "In Development",
    description:
      "A cutting-edge web3 application that enables users to purchase CableCoin using Ethereum via Metamask or fiat via Stripe. The platform also offers staking options and detailed documentation through its whitepaper.",
    image: "/images/projects/web-portfolio.jpg",
    tags: ["Svelte", "Web3", "Solidity", "JavaScript"],
    category: "web",
    Github: "",
  },
  {
    title: "CableCoin.io",
    status: "In Development",
    description:
      "A Python FastAPI backend that supports the CableCoin.io web application. It integrates with pyweb3 to interact with Ethereum blockchain data and hosts the Solidity contract, ensuring secure and reliable cryptocurrency transactions.",
    image: "/images/projects/web-portfolio.jpg",
    tags: ["Python", "FastAPI", "pyweb3", "Solidity"],
    category: "server",
    Github: "",
  },
];
