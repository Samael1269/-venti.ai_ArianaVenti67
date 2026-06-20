import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Briefcase,
  Settings,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Calendar,
  CheckCircle,
  FileText,
  User,
  Star,
  ArrowRight,
  TrendingUp,
  Award,
  BookMarked
} from "lucide-react";
import { callGemini, callGrafilab } from "./lib/gemini";

const INITIAL_CLIENTS = [];

const INITIAL_TASKS = [];

const INITIAL_MEETINGS = [];

const LEARNING_CONTENT = [
  // Retirement
  { id: "RET1", category: "Retirement", title: "Safe Withdrawal Rates (SWR)", duration: "30 mins", description: "Dynamic vs static withdrawal strategies." },
  { id: "RET2", category: "Retirement", title: "EPF Account 2 Utilisation", duration: "45 mins", description: "Rules for housing and health withdrawals." },
  { id: "RET3", category: "Retirement", title: "PRS Tax Relief Guide", duration: "20 mins", description: "Maximizing private retirement scheme incentives." },
  { id: "RET4", category: "Retirement", title: "Annuity vs Lump Sum", duration: "40 mins", description: "Comparing payout structures for retirees." },
  { id: "RET5", category: "Retirement", title: "Longevity Risk Assessment", duration: "35 mins", description: "Mitigating the risk of outliving savings." },
  
  // Investment
  { id: "INV1", category: "Investment", title: "Sequence of Returns Risk", duration: "30 mins", description: "Strategies to protect portfolios during early retirement." },
  { id: "INV2", category: "Investment", title: "Asset Allocation Basics", duration: "45 mins", description: "Balancing equities and fixed income." },
  { id: "INV3", category: "Investment", title: "REITs for Passive Income", duration: "25 mins", description: "Analyzing dividend yields and growth potential." },
  { id: "INV4", category: "Investment", title: "Dollar Cost Averaging", duration: "15 mins", description: "Managing volatility through regular entry." },
  { id: "INV5", category: "Investment", title: "Portfolio Rebalancing", duration: "30 mins", description: "Maintaining target weights over time." },
  
  // Compliance
  { id: "CMP1", category: "Compliance", title: "Common Reporting Standard (CRS)", duration: "60 mins", description: "Global transparency and tax residency." },
  { id: "CMP2", category: "Compliance", title: "KYC/AML Best Practices", duration: "50 mins", description: "Customer identification and due diligence." },
  { id: "CMP3", category: "Compliance", title: "Conflict of Interest Disclosure", duration: "30 mins", description: "Managing advisor-client obligations." },
  { id: "CMP4", category: "Compliance", title: "Data Privacy (PDPA)", duration: "45 mins", description: "Handling sensitive client financial data." },
  { id: "CMP5", category: "Compliance", title: "Marketing Compliance", duration: "25 mins", description: "Guidelines for financial advisory ads." },
  
  // Tax
  { id: "TAX1", category: "Tax", title: "Estate Planning Fundamentals", duration: "50 mins", description: "Wills, trusts, and distribution rules." },
  { id: "TAX2", category: "Tax", title: "Real Property Gains Tax", duration: "40 mins", description: "Tax implications on property disposal." },
  { id: "TAX3", category: "Tax", title: "Individual Income Tax Reliefs", duration: "35 mins", description: "Optimizing annual tax declarations." },
  { id: "TAX4", category: "Tax", title: "Corporate Tax Integration", duration: "60 mins", description: "Small business owner tax planning." },
  { id: "TAX5", category: "Tax", title: "Stamp Duty Exemptions", duration: "20 mins", description: "Saving on property and loan documentation." },
  
  // Insurance
  { id: "INS1", category: "Insurance", title: "Mortgage Reducing Term Assurance", duration: "25 mins", description: "Structuring debt protection efficiently." },
  { id: "INS2", category: "Insurance", title: "Hibah Takaful Essentials", duration: "30 mins", description: "Ensuring swift wealth transfer for heirs." },
  { id: "INS3", category: "Insurance", title: "Medical Card Coverage", duration: "45 mins", description: "Analyzing deductibles and limits." },
  { id: "INS4", category: "Insurance", title: "Critical Illness Riders", duration: "35 mins", description: "Income replacement during health crises." },
  { id: "INS5", category: "Insurance", title: "Keyman Insurance", duration: "50 mins", description: "Business continuity for enterprise clients." }
];

const PARTNERS = [
  { id: "1", name: "ABC Legal Group", category: "Legal", expertise: "Estate Trust planning & Asset shelters", rating: 4.9, availability: "Within 24h" },
  { id: "2", name: "Alpha Tax Advisory", category: "Tax", expertise: "International capital tax & Corporate structuring", rating: 4.8, availability: "Within 2 days" },
  { id: "3", name: "SafeShield Insurance Brokers", category: "Insurance", expertise: "High-value term & Keyman protection policies", rating: 4.7, availability: "Immediate" },
  { id: "4", name: "Apex Mortgage Advisors", category: "Mortgage", expertise: "Commercial mortgage refinancing & Residential loans", rating: 4.6, availability: "Immediate" },
  { id: "5", name: "Summit Wealth Management Services", category: "Wealth Management", expertise: "Alternative assets selection & Portfolio rebalancing", rating: 4.9, availability: "Within 3 days" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [clients, setClients] = useState(() => {
    const stored = localStorage.getItem("a360_clients_v2");
    return stored ? JSON.parse(stored) : INITIAL_CLIENTS;
  });
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem("a360_tasks_v2");
    return stored ? JSON.parse(stored) : INITIAL_TASKS;
  });
  const [meetings, setMeetings] = useState(() => {
    const stored = localStorage.getItem("a360_meetings");
    return stored ? JSON.parse(stored) : INITIAL_MEETINGS;
  });
  
  // Settings State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("a360_apikey") || "");
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem("a360_profile");
    return stored ? JSON.parse(stored) : { name: "Marcus Aurelius", email: "marcus.a@advisors.com", company: "Aegis Wealth Management" };
  });

  // Google Calendar 2-Way Sync Loop
  useEffect(() => {
    const fetchLiveCalendarData = async () => {
      try {
        const url = `/api/calendar/events`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch Google Calendar from backend");
        const data = await res.json();
        
        const googleMeetings = data.items.map(item => {
          const start = item.start.dateTime || item.start.date;
          const date = new Date(start);
          return {
            id: item.id,
            day: date.getDate(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            name: item.summary || "Busy",
            type: "Meeting"
          };
        });

        // Overwrite local state with live Google Calendar truth
        setMeetings(googleMeetings);
      } catch (err) {
        console.error("Google Calendar Sync Error:", err);
      }
    };

    fetchLiveCalendarData();
    const intervalId = setInterval(fetchLiveCalendarData, 30000); // 30s polling
    return () => clearInterval(intervalId);
  }, []);

  // Fetch Clients from Spring Boot Backend
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients?advisorId=1');
        if (!res.ok) throw new Error("Failed to fetch clients from backend");
        const data = await res.json();
        const mapped = data.map(c => ({
          id: c.clientId,
          advisorId: c.advisorId,
          name: c.fullName,
          email: c.email,
          phone: c.phone || "N/A",
          notes: c.backgroundNotes || "",
          lastContactDate: c.lastContactDate || "",
          progressTimeline: JSON.parse(localStorage.getItem(`timeline_${c.clientId}`)) || []
        }));
        setClients(mapped);
        if (mapped.length > 0) {
          setSelectedClientId(prev => mapped.some(c => c.id === prev) ? prev : mapped[0].id);
        }
      } catch (err) {
        console.error("Backend Client Fetch Error:", err);
      }
    };
    fetchClients();
  }, []);

  // Dynamic dashboard states
  const [morningBrief, setMorningBrief] = useState("");
  const [isLoadingBrief, setIsLoadingBrief] = useState(false);
  const [isBriefExpanded, setIsBriefExpanded] = useState(false);
  
  const [todaysClientBrief, setTodaysClientBrief] = useState("");
  const [isLoadingClientBrief, setIsLoadingClientBrief] = useState(false);

  // CRM details states
  const [selectedClientId, setSelectedClientId] = useState("1093A");
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientNotes, setNewClientNotes] = useState("");
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [newTimelineEntry, setNewTimelineEntry] = useState("");

  // AI CRM insights
  const [meetingNotes, setMeetingNotes] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiInsights, setAiInsights] = useState("");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Learning Hub states
  const [articles, setArticles] = useState(LEARNING_CONTENT);
  const [learningSearch, setLearningSearch] = useState("");
  const [semanticFilteredArticleIds, setSemanticFilteredArticleIds] = useState(null);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [learningCategory, setLearningCategory] = useState("All");
  
  // New Layout States
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [hotPicksContent, setHotPicksContent] = useState("");
  const [isLoadingHotPicks, setIsLoadingHotPicks] = useState(false);
  
  // Publishing states
  const [newArticleTitle, setNewArticleTitle] = useState("");
  const [newArticleCategory, setNewArticleCategory] = useState("Retirement");
  const [newArticleContent, setNewArticleContent] = useState("");
  const [isPublishingArticle, setIsPublishingArticle] = useState(false);

  const [chatQuery, setChatQuery] = useState("");
  const [chatLog, setChatLog] = useState([
    { role: "assistant", text: "Hello! I am your AI Learning Assistant. Ask me anything about investments, compliance, estate or retirement planning best practices." }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Smart Calendar Chat states
  const [calendarChatQuery, setCalendarChatQuery] = useState("");
  const [calendarChatLog, setCalendarChatLog] = useState([
    { role: "assistant", text: "Hello! I'm your scheduling AI. Ask me about your calendar, upcoming meetings, or client tasks." }
  ]);
  const [isCalendarChatLoading, setIsCalendarChatLoading] = useState(false);
  
  // Floating AI Chat state
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
  const [chatPosition, setChatPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = React.useRef({ x: 0, y: 0 });

  useEffect(() => {
    setChatPosition({ x: window.innerWidth - 420, y: window.innerHeight - 520 });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setChatPosition({
          x: e.clientX - dragRef.current.x,
          y: e.clientY - dragRef.current.y
        });
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (e) => {
    setIsDragging(true);
    dragRef.current = {
      x: e.clientX - chatPosition.x,
      y: e.clientY - chatPosition.y
    };
  };
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(20); // Default to today's date
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);

  // Partner Finder states
  const [partnerCategory, setPartnerCategory] = useState("All");
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerNeedsInput, setPartnerNeedsInput] = useState("");
  const [partnerRecommendation, setPartnerRecommendation] = useState("");
  const [isRecommendingPartner, setIsRecommendingPartner] = useState(false);

  // Add Event Modal
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventData, setNewEventData] = useState({ day: 20, time: "10:00 AM", name: "", type: "Meeting" });
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Custom task form input
  const [newTasksTitle, setNewTasksTitle] = useState("");

  // Persists state
  useEffect(() => {
    localStorage.setItem("a360_clients_v2", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("a360_tasks_v2", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("a360_meetings", JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem("a360_apikey", apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem("a360_profile", JSON.stringify(profile));
  }, [profile]);

  // Handlers

  const handleManualAddEvent = async (e) => {
    e.preventDefault();
    if (!newEventData.name.trim() || !newEventData.time.trim()) return;
    setIsAddingEvent(true);
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEventData)
      });
      if (response.ok) {
        const item = await response.json();
        const start = item.start.dateTime || item.start.date;
        const date = new Date(start);
        const newMeeting = {
          id: item.id,
          day: date.getDate(),
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          name: item.summary || newEventData.name,
          type: item.description || newEventData.type
        };
        setMeetings(prev => [...prev, newMeeting]);
        setShowAddEventModal(false);
        setNewEventData({ day: 20, time: "10:00 AM", name: "", type: "Meeting" });
      } else {
        console.error("Failed to add event via API");
      }
    } catch (error) {
      console.error("Failed to add event:", error);
    } finally {
      setIsAddingEvent(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) return;

    if (isEditingClient) {
      const updateClientPayload = {
        advisorId: 1,
        fullName: newClientName,
        email: newClientEmail,
        phone: newClientPhone || "N/A",
        backgroundNotes: newClientNotes || "",
        lastContactDate: new Date().toISOString().split("T")[0]
      };
      try {
        const response = await fetch(`/api/clients/${selectedClientId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateClientPayload)
        });
        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || "Failed to update client");
        }
        const c = await response.json();
        const updated = clients.map(item => item.id === selectedClientId ? {
          ...item,
          name: c.fullName,
          email: c.email,
          phone: c.phone || "N/A",
          notes: c.backgroundNotes || "",
          lastContactDate: c.lastContactDate || item.lastContactDate
        } : item);
        setClients(updated);
      } catch (error) {
        console.error("Error updating client:", error);
        alert("Error updating client: " + error.message);
      }
    } else {
      const newClientPayload = {
        advisorId: 1,
        fullName: newClientName,
        email: newClientEmail,
        phone: newClientPhone || "N/A",
        backgroundNotes: newClientNotes || "",
        lastContactDate: new Date().toISOString().split("T")[0]
      };
      try {
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newClientPayload)
        });
        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || "Failed to create client");
        }
        const c = await response.json();
        const newClient = {
          id: c.clientId,
          advisorId: c.advisorId,
          name: c.fullName,
          email: c.email,
          phone: c.phone || "N/A",
          notes: c.backgroundNotes || "",
          lastContactDate: c.lastContactDate || "",
          progressTimeline: []
        };
        setClients(prev => [newClient, ...prev]);
        setSelectedClientId(newClient.id);
      } catch (error) {
        console.error("Error creating client:", error);
        alert("Error creating client: " + error.message);
      }
    }
    
    // Clear fields
    setNewClientName("");
    setNewClientEmail("");
    setNewClientPhone("");
    setNewClientNotes("");
    setShowAddClientModal(false);
    setIsEditingClient(false);
  };

  const handleDeleteClient = async () => {
    const clientToDelete = clients.find(c => c.id === selectedClientId);
    if (!clientToDelete) return;
    if (window.confirm(`Are you sure you want to delete ${clientToDelete.name}?`)) {
      try {
        const response = await fetch(`/api/clients/${selectedClientId}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || "Failed to delete client");
        }
        const updated = clients.filter(c => c.id !== selectedClientId);
        setClients(updated);
        if (updated.length > 0) {
          setSelectedClientId(updated[0].id);
        } else {
          setSelectedClientId(null);
        }
      } catch (error) {
        console.error("Error deleting client:", error);
        alert("Error deleting client: " + error.message);
      }
    }
  };

  const handleOpenEditClient = () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;
    setNewClientName(client.name);
    setNewClientEmail(client.email);
    setNewClientPhone(client.phone);
    setNewClientNotes(client.notes);
    setIsEditingClient(true);
    setShowAddClientModal(true);
  };

  const handleSaveProgress = () => {
    if (!newTimelineEntry.trim()) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const updated = clients.map(c => {
      if (c.id === selectedClientId) {
        const timeline = c.progressTimeline || [];
        const newTimeline = [
          { date: todayStr, text: newTimelineEntry },
          ...timeline
        ];
        localStorage.setItem(`timeline_${c.id}`, JSON.stringify(newTimeline));
        return {
          ...c,
          progressTimeline: newTimeline
        };
      }
      return c;
    });
    setClients(updated);
    setNewTimelineEntry("");
  };

  const handleAddNewTask = (e) => {
    e.preventDefault();
    if (!newTasksTitle.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: newTasksTitle,
      priority: "Medium",
      done: false
    };
    setTasks([...tasks, newTask]);
    setNewTasksTitle("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Auto-Generated Daily Brief with Caching
  useEffect(() => {
    const dependenciesString = JSON.stringify({
      m: meetings.map(m => `${m.id}-${m.day}`),
      c: clients.map(c => c.id),
      date: new Date().toISOString().split("T")[0],
      selDay: selectedCalendarDate
    });

    const cached = localStorage.getItem("a360_daily_brief_cache_v4");
    let shouldGenerate = true;
    
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.deps === dependenciesString && parsed.content) {
          setMorningBrief(parsed.content);
          shouldGenerate = false;
        }
      } catch (e) {}
    }

    if (shouldGenerate && !isLoadingBrief && !morningBrief) {
      const generateBrief = async () => {
        setIsLoadingBrief(true);
        try {
          const dynamicTasks = meetings.map(m => {
            let priority = "None";
            if (m.day === selectedCalendarDate) priority = "High";
            else if (m.day === selectedCalendarDate + 1) priority = "Medium";
            else if (m.day === selectedCalendarDate + 2) priority = "Low";
            
            if (priority !== "None") {
               return `- ${m.name} at ${m.time} [Priority: ${priority}]`;
            }
            return null;
          }).filter(Boolean);
          
          const pendingText = dynamicTasks.length > 0 ? dynamicTasks.join("\n") : "No upcoming priority tasks.";
          const clientSummaries = clients.map(c => `- ${c.name}: ${c.notes}`).join("\n");
          
          const fakeDateObj = new Date(2026, 5, selectedCalendarDate);
          const currentDate = fakeDateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          
          const prompt = `Today's Date: ${currentDate}\nAnalyze advisor calendar tasks, meetings, and follow-ups.\nCalendar Tasks:\n${pendingText}\n\nClients and notes:\n${clientSummaries}\n\nAct as an AI advisory assistant. Based on the meetings and tasks provided above, suggest exactly what the advisor needs to prepare to handle the clients and all meetings scheduled for today.\nAlso remind them of their tasks prioritized by due date: High priority for tasks due today, Medium priority for tasks due tomorrow, and Low priority for tasks due the day after and in the future.\nEnsure you display the actual date (${currentDate}) instead of a placeholder. Keep it bold, structured, and highly actionable.`;
          
          const response = await callGrafilab({ prompt });
          setMorningBrief(response);
          localStorage.setItem("a360_daily_brief_cache_v4", JSON.stringify({ deps: dependenciesString, content: response }));
        } catch (e) {
          setMorningBrief("Failed to generate brief. Verify API credentials.");
        } finally {
          setIsLoadingBrief(false);
        }
      };
      generateBrief();
    }
  }, [meetings, clients, apiKey, isLoadingBrief, morningBrief, selectedCalendarDate]);

  // Auto-Generated Today's Client Brief with Caching
  useEffect(() => {
    const isJune2026 = currentYear === 2026 && currentMonth === 5;
    const todaysMeetings = meetings.filter(m => m.day === selectedCalendarDate && isJune2026);
    const clientsForToday = clients.filter(c => 
      todaysMeetings.some(m => m.name.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(m.name.toLowerCase()) || (m.type && m.type.toLowerCase().includes(c.name.toLowerCase())))
    );

    const dependenciesString = JSON.stringify({
      c: clientsForToday.map(c => c.id),
      m: todaysMeetings.map(m => m.id),
      date: new Date().toISOString().split("T")[0],
      selDay: selectedCalendarDate
    });

    const cached = localStorage.getItem("a360_client_brief_cache_v1");
    let shouldGenerate = true;
    
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.deps === dependenciesString && parsed.content) {
          setTodaysClientBrief(parsed.content);
          shouldGenerate = false;
        }
      } catch (e) {}
    }

    if (shouldGenerate && !isLoadingClientBrief && clientsForToday.length > 0) {
      const generateBrief = async () => {
        setIsLoadingClientBrief(true);
        try {
          const clientData = clientsForToday.map(c => `Name: ${c.name}\nEmail: ${c.email}\nPhone: ${c.phone}\nNotes: ${c.notes}`).join("\n\n");
          
          const prompt = `Today's Date: June ${selectedCalendarDate}, 2026\nAnalyze the following clients who have meetings scheduled for today.\n\n${clientData}\n\nAct as an AI advisory assistant. Generate a highly comprehensive "Today's Client Summary Brief". Deeply analyze their profile notes, highlight their goals, potential risks, and outline a strategic meeting preparation plan. Format using markdown with bold headings. Ensure the tone is professional.`;
          
          const response = await callGrafilab({ prompt });
          setTodaysClientBrief(response);
          localStorage.setItem("a360_client_brief_cache_v1", JSON.stringify({ deps: dependenciesString, content: response }));
        } catch (e) {
          setTodaysClientBrief("Failed to generate client brief. Verify API credentials.");
        } finally {
          setIsLoadingClientBrief(false);
        }
      };
      generateBrief();
    } else if (clientsForToday.length === 0) {
      setTodaysClientBrief("");
    }
  }, [meetings, clients, isLoadingClientBrief, selectedCalendarDate, currentMonth, currentYear]);

  const handleGenerateMeetingSummary = async () => {
    if (!meetingNotes.trim()) return;
    setIsSummarizing(true);
    try {
      const prompt = `Analyze meeting notes:
"${meetingNotes}"

Extract:
- Summary of discussion
- Client goals
- Concerns
- Opportunities
- Follow-up actions

Return results in a structured format.`;
      const response = await callGemini({ prompt, apiKey });
      setAiSummary(response);
    } catch (e) {
      setAiSummary("Error generating summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Auto-generate AI Client Insights when switching to a client
  useEffect(() => {
    if (activeTab !== "Client Memory" || !selectedClientId) return;
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    const cacheKey = `a360_client_insights_${client.id}`;
    const cached = localStorage.getItem(cacheKey);
    const depsString = JSON.stringify({ notes: client.notes });

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.deps === depsString && parsed.content) {
          setAiInsights(parsed.content);
          return;
        }
      } catch (e) {}
    }

    const fetchInsights = async () => {
      setIsGeneratingInsights(true);
      setAiInsights("");
      try {
        const prompt = `Analyze stored client profile notes for ${client.name}:\n"${client.notes}"\n\nGenerate AI Client Insights including:\n- Potential opportunities\n- Risk indicators\n- Suggested next actions\n\nKeep it concise and highly professional.`;
        const response = await callGemini({ prompt, apiKey });
        setAiInsights(response);
        localStorage.setItem(cacheKey, JSON.stringify({ deps: depsString, content: response }));
      } catch (e) {
        setAiInsights("Failed to fetch opportunities.");
      } finally {
        setIsGeneratingInsights(false);
      }
    };
    fetchInsights();
  }, [selectedClientId, clients, activeTab, apiKey]);

  // Hot Picks AI Generation
  useEffect(() => {
    if (activeTab !== "Learning Hub") return;
    
    const cacheKey = "a360_hot_picks_cache";
    const depsString = JSON.stringify({ count: articles.length });
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.deps === depsString && parsed.content) {
          setHotPicksContent(parsed.content);
          return;
        }
      } catch (e) {}
    }

    const generateHotPicks = async () => {
      setIsLoadingHotPicks(true);
      try {
        const articlesContext = articles.map(a => `- [${a.category}] ${a.title}: ${a.description}`).join("\n");
        const prompt = `Act as the editor of a high-end financial advisory newspaper. Review the following available articles in our library:\n\n${articlesContext}\n\nGenerate a "Hot Picks" front-page briefing that highlights the 3 most trending/important topics right now. Summarize why they matter to an advisor. Format using markdown with a very professional, newspaper-like tone.`;
        
        const response = await callGemini({ prompt, apiKey });
        setHotPicksContent(response);
        localStorage.setItem(cacheKey, JSON.stringify({ deps: depsString, content: response }));
      } catch (e) {
        setHotPicksContent("Failed to load Hot Picks.");
      } finally {
        setIsLoadingHotPicks(false);
      }
    };
    
    if (!hotPicksContent) {
      generateHotPicks();
    }
  }, [activeTab, articles.length, apiKey, hotPicksContent]);

  const handlePublishArticle = (e) => {
    e.preventDefault();
    if (!newArticleTitle.trim() || !newArticleContent.trim()) return;

    setIsPublishingArticle(true);
    setTimeout(() => {
      const newArticle = {
        id: `PUB${Date.now()}`,
        category: newArticleCategory,
        title: newArticleTitle,
        duration: "5 mins",
        description: newArticleContent.substring(0, 100) + "...",
        content: newArticleContent
      };
      setArticles([newArticle, ...articles]);
      setNewArticleTitle("");
      setNewArticleContent("");
      setLearningCategory("All");
      setSemanticFilteredArticleIds(null);
      setLearningSearch("");
      setIsPublishingArticle(false);
    }, 600);
  };

  const handleSemanticSearch = async (e) => {
    e.preventDefault();
    if (!learningSearch.trim()) {
      setSemanticFilteredArticleIds(null);
      return;
    }
    
    setIsSemanticSearching(true);
    try {
      const articlesContext = articles.map(a => `ID: ${a.id} | Category: ${a.category} | Title: ${a.title} | Desc: ${a.description}`).join("\n");
      const prompt = `You are a semantic search engine. The user is searching for: "${learningSearch}".
Based on the following list of articles, identify the IDs of the articles that are highly relevant to the search query.

Articles:
${articlesContext}

Return ONLY a comma-separated list of IDs (e.g., "RET1,INV2"). If none are relevant, return "NONE".`;
      
      const response = await callGemini({ prompt, apiKey });
      const cleanedResponse = response.replace(/\s/g, "");
      if (cleanedResponse === "NONE" || cleanedResponse === "") {
        setSemanticFilteredArticleIds([]);
      } else {
        const ids = cleanedResponse.split(",");
        setSemanticFilteredArticleIds(ids);
      }
    } catch (err) {
      console.error(err);
      setSemanticFilteredArticleIds(null);
    } finally {
      setIsSemanticSearching(false);
    }
  };

  const handleAskLearningAssistant = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    const userText = chatQuery;
    setChatLog(prev => [...prev, { role: "user", text: userText }]);
    setChatQuery("");
    setIsChatLoading(true);
    try {
      const articlesContext = articles.map(a => `- [${a.category}] ${a.title}: ${a.description} ${a.content ? `\nContent: ${a.content}` : ""}`).join("\n\n");
      
      const prompt = `You are a financial advisory learning assistant. The user asks: "${userText}"
Provide a concise, educational response on advisory standards, taxation or compliance. Use professional language.

Use ONLY the following detailed training articles as your primary knowledge base to answer the user's query:

${articlesContext}

If the user's query cannot be answered using the provided articles, politely inform them that the information is not available in the Learning Hub library.
If you find relevant information, summarize it and EXPLICITLY recommend the titles of the articles you used so the user can read further.`;
      const response = await callGemini({ prompt, apiKey });
      setChatLog(prev => [...prev, { role: "assistant", text: response }]);
    } catch (err) {
      setChatLog(prev => [...prev, { role: "assistant", text: "Error calling AI assistant." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAskCalendarChat = async (e) => {
    e.preventDefault();
    if (!calendarChatQuery.trim()) return;
    const userText = calendarChatQuery;
    setCalendarChatLog(prev => [...prev, { role: "user", text: userText }]);
    setCalendarChatQuery("");
    setIsCalendarChatLoading(true);
    try {
      const pendingText = tasks.map(t => `- ${t.title} [Priority: ${t.priority}]`).join("\n");
      const meetingText = meetings.map(m => `- Day ${m.day}: ${m.name} at ${m.time} (${m.type})`).join("\n");
      const prompt = `You are a financial advisory scheduling assistant.
The user asks: "${userText}"

Current Context:
Selected Date: June ${selectedCalendarDate}, 2026.
Tasks:
${pendingText}
Meetings This Month:
${meetingText}

If the user asks to schedule, add, edit, or remove an event, append a JSON block at the very end of your response exactly matching one of these formats:
To Add:
\`\`\`json
{"command": "ADD_EVENT", "day": 24, "time": "3:00 PM", "name": "Event name", "type": "Meeting"}
\`\`\`
To Edit (provide the EXACT existing "name" and "time" to identify it, and the new values to update):
\`\`\`json
{"command": "EDIT_EVENT", "targetName": "Shawn", "targetTime": "3:00 PM", "targetDay": 27, "newDay": 28, "newTime": "4:00 PM", "newName": "Shawn"}
\`\`\`
To Remove (provide the EXACT existing name, time, and day to identify it):
\`\`\`json
{"command": "REMOVE_EVENT", "targetName": "Shawn", "targetTime": "3:00 PM", "targetDay": 27}
\`\`\`
To Remove ALL events on a specific day:
\`\`\`json
{"command": "REMOVE_ALL_EVENTS", "targetDay": 27}
\`\`\`

The "day" fields must be a number representing the day in June 2026. Ensure you only output ONE JSON block if an action is taken.
Answer the user concisely and professionally.`;

      const response = await callGemini({ prompt, apiKey });
      
      let finalResponse = response;
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const payload = JSON.parse(jsonMatch[1]);
          if (payload.command === "ADD_EVENT") {
            const newMeeting = {
              id: Date.now().toString(),
              day: payload.day,
              name: payload.name,
              time: payload.time,
              type: payload.type || "Meeting"
            };
            setMeetings(prev => [...prev, newMeeting]);
            finalResponse = response.replace(/```json\n[\s\S]*?\n```/, "").trim();
          } else if (payload.command === "EDIT_EVENT") {
            setMeetings(prev => prev.map(m => {
              if (m.name.toLowerCase().includes(payload.targetName.toLowerCase()) && m.day === payload.targetDay) {
                return {
                  ...m,
                  day: payload.newDay !== undefined ? payload.newDay : m.day,
                  time: payload.newTime || m.time,
                  name: payload.newName || m.name
                };
              }
              return m;
            }));
            finalResponse = response.replace(/```json\n[\s\S]*?\n```/, "").trim();
          } else if (payload.command === "REMOVE_EVENT") {
            const eventToDelete = meetings.find(m => m.name.toLowerCase().includes(payload.targetName.toLowerCase()) && m.day === payload.targetDay);
            if (eventToDelete && eventToDelete.id && eventToDelete.id.length > 5) {
              fetch(`/api/calendar/events/${eventToDelete.id}`, { method: 'DELETE' }).catch(console.error);
            }
            setMeetings(prev => prev.filter(m => !(m.name.toLowerCase().includes(payload.targetName.toLowerCase()) && m.day === payload.targetDay)));
            finalResponse = response.replace(/```json\n[\s\S]*?\n```/, "").trim();
          } else if (payload.command === "REMOVE_ALL_EVENTS") {
            const eventsToDelete = meetings.filter(m => m.day === payload.targetDay);
            eventsToDelete.forEach(m => {
              if (m.id && m.id.length > 5) {
                fetch(`/api/calendar/events/${m.id}`, { method: 'DELETE' }).catch(console.error);
              }
            });
            setMeetings(prev => prev.filter(m => m.day !== payload.targetDay));
            finalResponse = response.replace(/```json\n[\s\S]*?\n```/, "").trim();
          }

          // Fire-and-forget Webhook Integration
          const webhookUrl = import.meta.env.VITE_TELEGRAM_WEBHOOK_URL;
          if (webhookUrl) {
            fetch(webhookUrl, {
              method: 'POST',
              mode: 'no-cors', // Avoids strict browser blocking for unconfigured endpoints
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                original_prompt: userText,
                ai_command: payload
              })
            }).catch(e => console.warn("Telegram Webhook Fire-and-forget execution completed.", e));
          }

        } catch (e) {
          console.error("Failed to parse calendar command JSON", e);
        }
      }

      setCalendarChatLog(prev => [...prev, { role: "assistant", text: finalResponse }]);
    } catch (err) {
      setCalendarChatLog(prev => [...prev, { role: "assistant", text: "Error accessing schedule data via AI." }]);
    } finally {
      setIsCalendarChatLoading(false);
    }
  };

  const handleRecommendPartner = async () => {
    if (!partnerNeedsInput.trim()) return;
    setIsRecommendingPartner(true);
    try {
      const prompt = `Analyze client requirements: "${partnerNeedsInput}"
Recommend a suitable partner category from Legal, Tax, Insurance, Mortgage, or Wealth Management.
Provide:
- Recommended Partner Category
- Reasoning
- Suggested Introduction Message
Keep it concise and professional.`;
      const response = await callGemini({ prompt, apiKey });
      setPartnerRecommendation(response);
    } catch (err) {
      setPartnerRecommendation("Unable to complete partner recommendation query.");
    } finally {
      setIsRecommendingPartner(false);
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  // Calendar Dynamic Variables
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const paddingEnd = (7 - ((startDay + daysInMonth) % 7)) % 7;
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Custom regex-based parser to render structured Markdown into beautiful news columns
  const formatMarkdown = (text) => {
    if (!text) return null;
    
    // Pre-processing to strip out weird dividers
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let cleanLine = line.trim();
      
      if (cleanLine === "" || cleanLine === "---") {
        return <div key={idx} className="my-3 border-b border-dashed border-[#E5E5E0]"></div>;
      }

      // Check for headers (e.g. ### Heading)
      if (cleanLine.startsWith("###")) {
        return (
          <h4 key={idx} className="font-serif font-bold text-base uppercase mt-4 mb-2 text-[#111111] border-b border-[#E5E5E0] pb-1 tracking-wider">
            {cleanLine.replace(/^###\s*/, "")}
          </h4>
        );
      }
      
      if (cleanLine.startsWith("##")) {
        return (
          <h3 key={idx} className="font-serif font-black text-lg uppercase mt-5 mb-2 text-[#111111] tracking-wide">
            {cleanLine.replace(/^##\s*/, "")}
          </h3>
        );
      }

      // Check for list items with bold titles like: * **Summary of Discussion:** The notes...
      // or: - **Summary of Discussion:** The notes...
      const listBoldMatch = cleanLine.match(/^[*+-]\s*\*\*(.*?)\*\*(.*)/);
      if (listBoldMatch) {
        const [, title, description] = listBoldMatch;
        return (
          <div key={idx} className="my-3 text-justify font-body text-sm text-[#111111] pl-2 border-l-2 border-[#CC0000]">
            <span className="font-serif font-black block text-xs uppercase tracking-wider text-[#CC0000] mb-0.5">
              {title.replace(/:$/, "")}
            </span>
            <span className="leading-relaxed">{description.trim()}</span>
          </div>
        );
      }

      // Check for regular bold items: **Summary of Discussion:** The notes...
      const boldMatch = cleanLine.match(/^\*\*(.*?)\*\*(.*)/);
      if (boldMatch) {
        const [, title, description] = boldMatch;
        return (
          <div key={idx} className="my-3 text-justify font-body text-sm text-[#111111] pl-2 border-l-2 border-[#111111]">
            <span className="font-serif font-black block text-xs uppercase tracking-wider text-[#111111] mb-0.5">
              {title.replace(/:$/, "")}
            </span>
            <span className="leading-relaxed">{description.trim()}</span>
          </div>
        );
      }

      // Plain bullet point (e.g. * Item)
      if (cleanLine.startsWith("*") || cleanLine.startsWith("-")) {
        return (
          <p key={idx} className="pl-4 font-body text-sm leading-relaxed my-2 text-justify relative before:content-['■'] before:absolute before:left-0 before:text-[#CC0000] before:text-[8px] before:top-1.5">
            {cleanLine.replace(/^[*+-]\s*/, "")}
          </p>
        );
      }

      return (
        <p key={idx} className="font-body text-sm leading-relaxed my-2 text-justify">
          {cleanLine}
        </p>
      );
    });
  };

  // Compute Today's Clients for the Dashboard
  const isJune2026 = currentYear === 2026 && currentMonth === 5;
  const todaysMeetings = meetings.filter(m => m.day === selectedCalendarDate && isJune2026);
  const todaysClients = clients.filter(c => 
    todaysMeetings.some(m => m.name.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(m.name.toLowerCase()) || (m.description && m.description.toLowerCase().includes(c.name.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-[#111111] font-body flex flex-col newsprint-texture pb-20">
      
      {/* 1. NEWSPRINT AUTHORITATIVE HEADER (NAMEPLATE) */}
      <header className="max-w-screen-xl mx-auto w-full px-4 pt-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b-4 border-[#111111] pb-4">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Venti.ai Logo" className="w-24 h-24 object-contain mix-blend-multiply" />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] font-semibold text-gray-600 mb-1">
                Advisory Journal & Intelligence Service
              </p>
              <h1 className="font-serif font-black text-4xl md:text-5xl lg:text-6xl tracking-tight uppercase leading-none">
                Venti.ai
              </h1>
            </div>
          </div>

          {/* Editorial Navigation Tabs - Moved to right side */}
          <nav className="flex-shrink-0">
            <div className="flex flex-wrap items-center justify-end gap-2 md:gap-4">
              {[
                { name: "Dashboard", label: "I. Dashboard", icon: LayoutDashboard },
                { name: "Client Memory", label: "II. Client Memory", icon: Users },
                { name: "Learning Hub", label: "III. Learning Hub", icon: BookOpen },
              ].map((tab) => {
                const isActive = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`font-mono text-xs md:text-sm uppercase tracking-widest font-black py-1 px-3 border transition-colors ${
                      isActive
                        ? "bg-[#111111] text-[#F9F9F7] border-transparent"
                        : "bg-transparent text-[#111111] border-transparent hover:bg-neutral-100 hover:border-[#111111]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Issue bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-[#111111] py-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-gray-800">
          <span>Vol. CLXVI No. 24</span>
          <span className="font-bold text-[#CC0000] hidden sm:inline">★ Live Intelligence System ★</span>
          <span>Saturday, June 20, 2026 | New York Edition</span>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <main className="max-w-screen-xl mx-auto w-full px-4 mt-8 flex-grow">
        

        {/* SECTION 1: DASHBOARD VIEW */}
        {activeTab === "Dashboard" && (
          <div className="space-y-8">
            
            {/* Front Page Smart Calendar & AI Assistant Layout */}
            <div className="border-b border-[#111111] pb-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-[#CC0000] font-mono text-xs font-black uppercase tracking-widest block mb-2">
                    SCHEDULE & PLANNING
                  </span>
                  <h2 className="font-serif font-bold text-4xl md:text-6xl tracking-tight leading-[0.95]">
                    Smart Calendar
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Monthly Calendar View & Today's Clients */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                  
                  {/* Calendar Box */}
                  <div className="border border-[#111111] bg-white p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-[#111111] pb-3">
                      <h3 className="font-serif font-bold text-2xl uppercase">{monthNames[currentMonth]} {currentYear}</h3>
                      <div className="flex gap-2 items-center">
                        <button 
                          onClick={() => setShowAddEventModal(true)}
                          className="border border-[#111111] bg-[#111111] text-white px-3 py-1 font-mono text-xs uppercase font-bold hover:bg-[#CC0000] transition-colors"
                        >+ Add Event</button>
                        <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                            else { setCurrentMonth(m => m - 1); }
                          }}
                          className="border border-[#111111] p-1 hover:bg-neutral-100"
                        >&lt;</button>
                        <button 
                          onClick={() => {
                            setCurrentMonth(5); // Reset to June
                            setCurrentYear(2026);
                            setSelectedCalendarDate(20);
                          }}
                          className="border border-[#111111] px-3 py-1 font-mono text-xs uppercase font-bold hover:bg-neutral-100"
                        >Today</button>
                        <button 
                          onClick={() => {
                            if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                            else { setCurrentMonth(m => m + 1); }
                          }}
                          className="border border-[#111111] p-1 hover:bg-neutral-100"
                        >&gt;</button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-[#111111] border border-[#111111]">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="bg-white p-2 text-center font-mono text-[10px] font-black uppercase tracking-wider text-neutral-600">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: startDay }).map((_, i) => (
                        <div key={`start-${i}`} className="bg-[#F9F9F7] p-2 min-h-[80px]"></div>
                      ))}
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const isJune2026Day = currentYear === 2026 && currentMonth === 5;
                        const isToday = isJune2026Day && day === 20;
                        const isSelected = isJune2026Day && selectedCalendarDate === day;
                        
                        const dayMeetings = meetings.filter(m => m.day === day && isJune2026Day);
                        const hasMeetings = dayMeetings.length > 0;
                        
                        return (
                          <div
                            key={day}
                            onClick={() => {
                              if (isJune2026Day) setSelectedCalendarDate(day);
                            }}
                            className={`bg-white p-2 min-h-[80px] cursor-pointer transition-colors relative border-[3px] border-transparent hover:border-neutral-300 group ${isSelected ? "border-[#CC0000] z-10" : ""}`}
                          >
                            <span className={`font-mono text-xs font-bold ${isToday ? "bg-[#111111] text-white px-1" : ""}`}>
                              {day}
                            </span>
                            
                            {hasMeetings && (
                              <div className="mt-2 space-y-1">
                                {dayMeetings.map((m, i) => (
                                  <div key={i} className="bg-[#E5E5E0] text-[8px] font-mono p-1 uppercase leading-tight truncate border-l-2 border-[#111111]">
                                    {m.time} {m.name}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Hover Pop-up */}
                            {hasMeetings && (
                              <div className="hidden group-hover:block absolute left-full top-0 ml-2 bg-[#111111] text-[#F9F9F7] p-3 w-48 z-50 border border-[#111111] shadow-xl">
                                <h5 className="font-serif font-bold text-sm border-b border-neutral-600 pb-1 mb-2">June {day}, 2026</h5>
                                <div className="space-y-2">
                                  {dayMeetings.map((m, i) => (
                                    <div key={`pop-${i}`} className="font-mono text-[10px] leading-tight flex justify-between items-start">
                                      <div>
                                        <span className="text-[#CC0000] font-black">{m.time}</span><br />
                                        {m.name}<br />
                                        <span className="text-neutral-400">{m.type}</span>
                                      </div>
                                      <button 
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          if (m.id && m.id.length > 5) {
                                            await fetch(`/api/calendar/events/${m.id}`, { method: 'DELETE' });
                                          }
                                          setMeetings(prev => prev.filter(item => item.id !== m.id));
                                        }}
                                        className="text-neutral-500 hover:text-white p-1"
                                        title="Delete Event"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {Array.from({ length: paddingEnd }).map((_, i) => (
                        <div key={`end-${i}`} className="bg-[#F9F9F7] p-2 min-h-[80px]"></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Auto-Generated Daily Brief */}
                <div className="lg:col-span-5 xl:col-span-4 border-4 border-[#111111] bg-white p-6 relative hard-shadow-hover max-h-[680px] flex flex-col">
                  <span className="absolute -top-4 left-6 bg-[#CC0000] text-white px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider z-10">
                    OFFICIAL DAILY BRIEF
                  </span>
                  <button 
                    onClick={() => setIsBriefExpanded(true)}
                    className="absolute -top-4 right-6 bg-[#111111] text-white px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider hover:bg-[#CC0000] transition-colors z-10"
                  >
                    [EXPAND]
                  </button>
                  
                  <div className="flex-grow overflow-y-auto pr-2 mt-2">
                    {isLoadingBrief ? (
                       <div className="flex flex-col items-center justify-center py-20 space-y-4">
                         <Sparkles className="w-8 h-8 text-[#CC0000] animate-pulse" />
                         <span className="font-mono text-xs uppercase tracking-widest text-[#111111] font-bold">Synthesizing Intel...</span>
                       </div>
                    ) : morningBrief ? (
                      <div className="text-[#111111] font-body text-sm whitespace-pre-wrap leading-relaxed">
                        {formatMarkdown(morningBrief)}
                      </div>
                    ) : (
                      <div className="text-neutral-500 font-mono text-xs uppercase italic py-8 text-center">
                        Awaiting Intelligence Generation...
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Full-width Today's Client AI Brief */}
            <div className="border-4 border-[#111111] bg-white p-6 md:p-10 relative hard-shadow-hover max-h-[600px] flex flex-col mt-8">
              <span className="absolute -top-4 left-6 bg-[#CC0000] text-white px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider z-10">
                TODAY'S CLIENT
              </span>
              
              <div className="flex-grow overflow-y-auto mt-2">
                {isLoadingClientBrief ? (
                   <div className="flex flex-col items-center justify-center py-20 space-y-4">
                     <Sparkles className="w-8 h-8 text-[#CC0000] animate-pulse" />
                     <span className="font-mono text-xs uppercase tracking-widest text-[#111111] font-bold">Generating Client Dossier...</span>
                   </div>
                ) : todaysClientBrief ? (
                  <div className="text-[#111111] font-body text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                    {formatMarkdown(todaysClientBrief)}
                  </div>
                ) : (
                  <div className="text-neutral-500 font-mono text-xs uppercase italic py-8 text-center">
                    No comprehensive client intelligence available for the selected date.
                  </div>
                )}
              </div>
            </div>



          </div>
        )}

        {/* SECTION 2: CLIENT MEMORY */}
        {activeTab === "Client Memory" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-baseline justify-between border-b border-[#111111] pb-4 gap-4">
              <div>
                <h2 className="font-serif font-bold text-3xl md:text-4xl uppercase">Journal Index: Client Memory</h2>
                <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest mt-1">
                  CLASSIFIED CRM ENTRIES & DOCUMENT ANALYSIS
                </p>
              </div>

              <button
                onClick={() => {
                  setNewClientName("");
                  setNewClientEmail("");
                  setNewClientPhone("");
                  setNewClientNotes("");
                  setIsEditingClient(false);
                  setShowAddClientModal(true);
                }}
                className="bg-[#111111] text-[#F9F9F7] hover:bg-[#F9F9F7] hover:text-[#111111] hover:border-[#111111] border border-transparent font-sans font-bold uppercase tracking-widest text-xs py-3 px-5 hard-shadow-hover transition-all"
              >
                + Register Client Record
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Clients selector list column (Classified Listings theme) */}
              <div className="lg:col-span-4 border border-[#111111] bg-white p-4 space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-widest font-black border-b border-[#111111] pb-2 text-neutral-600">
                  Classified Records
                </h3>

                <div className="space-y-2">
                  {clients.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedClientId(c.id);
                        setAiSummary("");
                        setAiInsights("");
                      }}
                      className={`w-full text-left p-3 border-b transition-colors ${
                        selectedClientId === c.id
                          ? "bg-neutral-100 border-[#111111] font-bold"
                          : "bg-transparent border-transparent hover:bg-neutral-50"
                      }`}
                    >
                      <h4 className="font-serif text-sm uppercase leading-tight">{c.name}</h4>
                      <p className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider mt-1">
                        Last Contact: {c.lastContactDate}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Client Detailed CRM content columns */}
              <div className="lg:col-span-8 space-y-8">
                {selectedClient && (
                  <div className="border border-[#111111] bg-white p-6 space-y-6">
                    
                    {/* Header info */}
                    <div className="border-b border-[#111111] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[#CC0000] font-mono text-[10px] font-black uppercase tracking-wider block">
                            RECORD NO. {selectedClient.id}092A
                          </span>
                          <button onClick={handleOpenEditClient} className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 hover:text-[#111111] hover:underline">[Edit]</button>
                          <button onClick={handleDeleteClient} className="font-mono text-[10px] uppercase tracking-widest text-[#CC0000] hover:underline">[Delete]</button>
                        </div>
                        <h3 className="font-serif font-bold text-3xl uppercase leading-none">{selectedClient.name}</h3>
                      </div>
                      <div className="font-mono text-xs text-neutral-500 uppercase space-y-0.5 text-left sm:text-right">
                        <p>Email: {selectedClient.email}</p>
                        <p>Phone: {selectedClient.phone}</p>
                      </div>
                    </div>

                    {/* Stored client profile notes */}
                    <div className="space-y-2">
                      <h4 className="font-serif font-bold text-sm uppercase text-neutral-600">Registered Historical Notes:</h4>
                      <p className="bg-[#F9F9F7] p-4 border border-[#111111] font-body text-sm leading-relaxed text-justify">
                        {selectedClient.notes || "No historical notes recorded for this client profile."}
                      </p>
                    </div>

                    {/* NEW SECTION: Progress Timeline */}
                    <div className="space-y-4 mt-6">
                      <h4 className="font-serif font-bold text-sm uppercase text-[#CC0000]">Latest Progress Timeline</h4>
                      
                      {/* Add new entry form */}
                      <div className="flex gap-2 items-start">
                        <textarea
                          value={newTimelineEntry}
                          onChange={(e) => setNewTimelineEntry(e.target.value)}
                          placeholder="Log a new update or interaction..."
                          className="w-full bg-[#F9F9F7] p-3 border border-[#111111] font-body text-xs focus-visible:bg-[#E5E5E0] focus-visible:outline-none min-h-[60px]"
                        />
                        <button 
                          onClick={handleSaveProgress}
                          disabled={!newTimelineEntry.trim()}
                          className="font-mono text-[10px] uppercase tracking-widest text-[#F9F9F7] bg-[#111111] border border-[#111111] px-4 py-3 hover:bg-[#CC0000] hover:border-[#CC0000] transition-colors disabled:opacity-50 shrink-0 h-[60px]"
                        >
                          Log
                        </button>
                      </div>

                      {/* Timeline rendering */}
                      <div className="pl-2 border-l-2 border-[#111111] space-y-4 ml-1">
                        {(selectedClient.progressTimeline || []).map((entry, idx) => (
                          <div key={idx} className="relative pl-4">
                            <span className="absolute -left-[5px] top-1.5 w-2 h-2 bg-[#CC0000] rounded-full border border-white"></span>
                            <div className="font-mono text-[9px] text-neutral-500 font-bold mb-0.5">{entry.date}</div>
                            <p className="font-body text-xs text-justify leading-relaxed">{entry.text}</p>
                          </div>
                        ))}
                        {!(selectedClient.progressTimeline?.length) && (
                          <div className="pl-4 font-mono text-[10px] text-neutral-500 italic">No progress logged yet.</div>
                        )}
                      </div>
                    </div>

                    {/* Auto-Generated AI Insights Standalone Block */}
                    {isGeneratingInsights ? (
                      <div className="border border-[#CC0000] bg-red-50/50 p-5 relative flex items-center gap-3 mt-6">
                        <Sparkles className="w-5 h-5 text-[#CC0000] animate-pulse" />
                        <span className="font-mono text-xs text-[#CC0000] uppercase font-bold tracking-widest">Generating AI Insights...</span>
                      </div>
                    ) : aiInsights ? (
                      <div className="border border-[#CC0000] bg-red-50/50 p-5 relative mt-6">
                        <h5 className="font-serif font-black text-sm text-[#CC0000] uppercase border-b border-red-300 pb-2 mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#CC0000]" />
                          Opportunities & Vulnerability Index
                        </h5>
                        <div className="text-xs font-mono whitespace-pre-wrap leading-relaxed">{formatMarkdown(aiInsights)}</div>
                      </div>
                    ) : null}

                    {/* AI Analyzer Segment */}
                    <div className="border-t border-[#111111] pt-6 space-y-6 mt-6">
                      <h4 className="font-serif font-bold text-xl uppercase tracking-tight flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#CC0000] shrink-0" />
                        AI Summarizer
                      </h4>
                      <p className="font-body text-xs leading-relaxed text-neutral-600 text-justify">
                        Input recent meeting notes, telephone call logs, or transcript items to automatically generate a structured summary.
                      </p>
                      
                      <textarea
                        rows={4}
                        placeholder="Paste transcription text or advisor-client meeting logs..."
                        value={meetingNotes}
                        onChange={(e) => setMeetingNotes(e.target.value)}
                        className="w-full p-3 border-b-2 border-[#111111] bg-transparent font-mono text-xs focus-visible:bg-[#E5E5E0] focus-visible:outline-none"
                      />

                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={handleGenerateMeetingSummary}
                          disabled={isSummarizing || !meetingNotes.trim()}
                          className="bg-[#111111] text-[#F9F9F7] hover:bg-[#F9F9F7] hover:text-[#111111] hover:border-[#111111] border border-transparent font-sans font-bold uppercase tracking-widest text-xs py-3 px-5 hard-shadow-hover transition-all disabled:opacity-50"
                        >
                          {isSummarizing ? "Processing Audit..." : "Generate Summary"}
                        </button>
                      </div>

                      {/* AI Summary findings output box */}
                      {aiSummary && (
                        <div className="border-2 border-[#111111] bg-[#F9F9F7] p-5 relative">
                          <h5 className="font-serif font-black text-sm uppercase border-b border-[#111111] pb-2 mb-3">
                            Parsed Audit Summary
                          </h5>
                          <div className="text-xs font-mono whitespace-pre-wrap leading-relaxed">{formatMarkdown(aiSummary)}</div>
                        </div>
                      )}

                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* POPUP MODAL: ADD CLIENT FORM */}
            {showAddClientModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                <div className="bg-white border-4 border-[#111111] p-6 max-w-lg w-full relative">
                  <h3 className="font-serif font-bold text-2xl uppercase tracking-tight mb-4">
                    {isEditingClient ? "Edit Client Record" : "Register Client Record"}
                  </h3>
                  
                  <form onSubmit={handleAddClient} className="space-y-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-black tracking-widest mb-1">Client Full Name</label>
                      <input
                        type="text"
                        required
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full p-2 border-b-2 border-[#111111] bg-transparent font-mono text-xs focus-visible:bg-[#E5E5E0] focus-visible:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase font-black tracking-widest mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        className="w-full p-2 border-b-2 border-[#111111] bg-transparent font-mono text-xs focus-visible:bg-[#E5E5E0] focus-visible:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase font-black tracking-widest mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        className="w-full p-2 border-b-2 border-[#111111] bg-transparent font-mono text-xs focus-visible:bg-[#E5E5E0] focus-visible:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase font-black tracking-widest mb-1">Background Profile Notes</label>
                      <textarea
                        rows={3}
                        value={newClientNotes}
                        onChange={(e) => setNewClientNotes(e.target.value)}
                        className="w-full p-2 border-b-2 border-[#111111] bg-transparent font-mono text-xs focus-visible:bg-[#E5E5E0] focus-visible:outline-none"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-[#111111] text-[#F9F9F7] font-sans font-bold uppercase tracking-widest text-xs py-3 border border-transparent hover:bg-white hover:text-[#111111] hover:border-[#111111]"
                      >
                        Save Record
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddClientModal(false)}
                        className="flex-1 border border-[#111111] bg-transparent font-sans font-bold uppercase tracking-widest text-xs py-3 hover:bg-neutral-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* SECTION 3: LEARNING HUB */}
        {activeTab === "Learning Hub" && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-baseline justify-between border-b border-[#111111] pb-4 gap-4">
              <div>
                <h2 className="font-serif font-bold text-3xl md:text-4xl uppercase">Journal Section: Learning Hub</h2>
                <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest mt-1">
                  COMPLIANCE AUDITS & RESEARCH ARTICLES
                </p>
              </div>

              {/* CPD status display card */}
              <div className="border border-[#111111] p-4 bg-white flex items-center gap-4 shrink-0">
                <Award className="w-8 h-8 text-[#CC0000] stroke-[1.5]" />
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider leading-none">CPD COMPLIANCE RATING</p>
                  <p className="font-serif font-black text-xl uppercase tracking-tight leading-none mt-1">12 / 15 POINTS</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
              
              {/* Left Column: Hot Picks / Article Reader & Chatbot */}
              <div className="lg:col-span-8 space-y-6">
                {selectedArticleId ? (
                  // Article Reader View
                  <div className="border border-[#111111] bg-white p-8 relative min-h-[600px]">
                    <button 
                      onClick={() => setSelectedArticleId(null)}
                      className="font-mono text-[10px] uppercase font-black tracking-widest text-[#111111] hover:text-[#CC0000] transition-colors flex items-center gap-2 mb-8"
                    >
                      <ArrowRight className="w-3 h-3 rotate-180" /> Back to Hot Picks
                    </button>
                    {articles.filter(a => a.id === selectedArticleId).map(article => (
                      <div key={article.id}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-[#111111] text-white px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                            {article.category}
                          </span>
                          <span className="font-mono text-xs text-neutral-400">{article.duration}</span>
                        </div>
                        <h1 className="font-serif font-black text-3xl md:text-4xl uppercase mb-6 leading-tight">
                          {article.title}
                        </h1>
                        <p className="font-body text-lg text-neutral-600 mb-8 font-medium leading-relaxed">
                          {article.description}
                        </p>
                        {article.content && (
                          <div className="prose prose-neutral max-w-none font-body text-neutral-800 whitespace-pre-wrap leading-relaxed border-t border-[#111111] pt-8">
                            {article.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Hot Picks Front Page
                  <div className="border border-[#111111] bg-white min-h-[600px] flex flex-col">
                    <div className="border-b-4 border-[#111111] p-6 text-center bg-[#F9F9F7]">
                      <h1 className="font-serif font-black text-5xl uppercase tracking-tighter mb-2">The Advisor Daily</h1>
                      <div className="flex justify-between items-center border-y border-[#111111] py-1 mt-4 font-mono text-[10px] uppercase tracking-widest font-black">
                        <span>Vol. 1</span>
                        <span>AI-Curated Hot Picks</span>
                        <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="p-8 flex-grow">
                      {isLoadingHotPicks ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-neutral-400 space-y-4">
                          <Sparkles className="w-8 h-8 animate-pulse text-[#CC0000]" />
                          <p className="font-mono text-xs uppercase tracking-widest">Curating Trending Topics...</p>
                        </div>
                      ) : (
                        <div className="prose prose-neutral max-w-none font-body prose-h1:font-serif prose-h1:text-3xl prose-h1:uppercase prose-h1:mb-4 prose-h2:font-serif prose-h2:text-2xl prose-h2:uppercase prose-h2:border-b prose-h2:border-[#111111] prose-h2:pb-2 prose-h2:mt-8 prose-h3:font-sans prose-h3:text-lg prose-h3:uppercase">
                          {formatMarkdown(hotPicksContent)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Interactive Chatbot Helper */}
                <div className="border border-[#111111] bg-white p-6 space-y-6">
                  <h3 className="font-serif font-bold text-2xl uppercase flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#CC0000] animate-pulse" />
                    AI Regulatory Inquiry Desk
                  </h3>
                  
                  <div className="border border-[#111111] bg-[#F9F9F7] h-64 overflow-y-auto p-4 space-y-4">
                    {chatLog.map((chat, idx) => (
                      <div key={idx} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-md p-3 border font-serif text-sm ${
                          chat.role === "user"
                            ? "bg-[#111111] text-[#F9F9F7] border-transparent"
                            : "bg-white text-[#111111] border-[#111111]"
                        }`}>
                          <p className="font-mono text-[8px] uppercase tracking-widest opacity-60 mb-1">
                            {chat.role === "user" ? "Inquiry" : "AI Response"}
                          </p>
                          <div className="whitespace-pre-wrap leading-relaxed">{formatMarkdown(chat.text)}</div>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-[#111111] p-3 text-xs font-mono animate-pulse">
                          Fetching regulation parameters...
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAskLearningAssistant} className="flex gap-2">
                    <input
                      type="text"
                      value={chatQuery}
                      onChange={(e) => setChatQuery(e.target.value)}
                      placeholder="e.g. What compliance requirements should advisors know?"
                      className="flex-grow border-b-2 border-[#111111] bg-transparent px-3 py-2 font-mono text-sm focus-visible:bg-[#E5E5E0] focus-visible:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isChatLoading || !chatQuery.trim()}
                      className="bg-[#111111] text-[#F9F9F7] hover:bg-[#F9F9F7] hover:text-[#111111] hover:border-[#111111] border border-transparent font-sans font-bold uppercase tracking-widest text-xs py-3 px-5 transition-all"
                    >
                      Query AI
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Search, Categories, Publish, Literature List */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Library search/filter */}
                <div className="border border-[#111111] bg-white p-6 space-y-6">
                  <h3 className="font-mono text-xs uppercase tracking-widest font-black border-b border-[#111111] pb-2 text-neutral-600">
                    Search Library
                  </h3>

                  <div className="space-y-4">
                    <form onSubmit={handleSemanticSearch} className="space-y-4">
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <input
                            type="text"
                            value={learningSearch}
                            onChange={(e) => setLearningSearch(e.target.value)}
                            placeholder="Topic or concept..."
                            className="w-full pl-8 pr-3 py-2 border-b border-[#111111] bg-transparent font-mono text-xs focus-visible:bg-[#E5E5E0] focus-visible:outline-none"
                          />
                          <Search className="w-4 h-4 absolute left-0 top-3 text-neutral-400 stroke-[1.5]" />
                        </div>
                        <button 
                          type="submit" 
                          disabled={isSemanticSearching}
                          className="bg-[#111111] text-[#F9F9F7] font-mono text-[10px] uppercase tracking-widest px-3 hover:bg-[#CC0000] transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {isSemanticSearching ? "Wait..." : "Search"}
                        </button>
                      </div>
                    </form>

                    <div>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {["All", "Retirement", "Investment", "Compliance", "Tax", "Insurance"].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setLearningCategory(cat)}
                            className={`px-2 py-1 border text-[9px] font-mono uppercase ${
                              learningCategory === cat
                                ? "bg-[#111111] text-white border-transparent"
                                : "bg-transparent text-[#111111] border-neutral-300 hover:bg-neutral-100"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publish Article Form */}
                <div className="border border-[#111111] bg-white p-6 space-y-4">
                  <h3 className="font-serif font-bold text-lg uppercase flex items-center gap-2">
                    <span className="text-[#CC0000]">✚</span> Publish New
                  </h3>
                  <form onSubmit={handlePublishArticle} className="space-y-4">
                    <div>
                      <label className="block font-mono text-[9px] uppercase font-black tracking-widest mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={newArticleTitle}
                        onChange={(e) => setNewArticleTitle(e.target.value)}
                        className="w-full p-2 border-b border-[#111111] bg-transparent font-mono text-xs focus-visible:bg-[#E5E5E0] focus-visible:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] uppercase font-black tracking-widest mb-1">Category</label>
                      <select
                        value={newArticleCategory}
                        onChange={(e) => setNewArticleCategory(e.target.value)}
                        className="w-full p-2 border-b border-[#111111] bg-transparent font-mono text-xs focus-visible:bg-[#E5E5E0] focus-visible:outline-none"
                      >
                        <option value="Retirement">Retirement</option>
                        <option value="Investment">Investment</option>
                        <option value="Compliance">Compliance</option>
                        <option value="Tax">Tax</option>
                        <option value="Insurance">Insurance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[9px] uppercase font-black tracking-widest mb-1">Content</label>
                      <textarea
                        required
                        rows={2}
                        value={newArticleContent}
                        onChange={(e) => setNewArticleContent(e.target.value)}
                        className="w-full p-2 border-b border-[#111111] bg-transparent font-body text-xs focus-visible:bg-[#E5E5E0] focus-visible:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isPublishingArticle}
                      className="w-full bg-[#111111] text-[#F9F9F7] font-sans font-bold uppercase tracking-widest text-[10px] py-2 px-3 hover:bg-[#CC0000] transition-colors disabled:opacity-50"
                    >
                      {isPublishingArticle ? "Publishing..." : "Publish to Library"}
                    </button>
                  </form>
                </div>

                {/* Available Literature Compact List */}
                <h3 className="font-serif font-bold text-xl uppercase mt-4">Available Literature</h3>

                <div className="grid grid-cols-1 gap-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                  {articles.filter(item => {
                    if (learningCategory !== "All" && item.category !== learningCategory) return false;
                    if (semanticFilteredArticleIds !== null && !semanticFilteredArticleIds.includes(item.id)) return false;
                    return true;
                  }).length === 0 ? (
                    <div className="text-neutral-500 font-mono text-[10px] uppercase italic py-8 text-center border border-[#111111] bg-white">
                      No matching articles.
                    </div>
                  ) : (
                    articles.filter(item => {
                      if (learningCategory !== "All" && item.category !== learningCategory) return false;
                      if (semanticFilteredArticleIds !== null && !semanticFilteredArticleIds.includes(item.id)) return false;
                      return true;
                    }).map(item => (
                      <div key={item.id} className="border border-[#111111] bg-white p-4 hover:border-[#CC0000] transition-colors flex flex-col justify-between group">
                        <div>
                          <div className="flex justify-between items-baseline mb-2">
                            <span className="text-[#CC0000] font-mono text-[9px] uppercase tracking-wider font-bold">
                              {item.category}
                            </span>
                            <span className="font-mono text-[9px] text-neutral-400">{item.duration}</span>
                          </div>
                          <h4 className="font-serif font-bold text-sm leading-tight uppercase mb-1 line-clamp-2">{item.title}</h4>
                        </div>
                        <button 
                          onClick={() => setSelectedArticleId(item.id)}
                          className="mt-3 text-left font-mono text-[9px] uppercase font-black tracking-widest group-hover:text-[#CC0000] transition-colors flex items-center gap-1"
                        >
                          Read <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 3. NEWSPRINT FOOTER */}
      <footer className="max-w-screen-xl mx-auto w-full px-4 mt-20 border-t border-[#111111] pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between font-mono text-[10px] text-neutral-500 uppercase tracking-widest gap-4">
          <span>Advisor360 Operating System © 2026</span>
          <span className="font-bold">Printed in NYC | Vol 1.0.4</span>
          <span>Security Cryptography active</span>
        </div>
      </footer>      {/* 3. FLOATING AI CHAT WINDOW */}
      <div 
        className={`fixed z-50 transition-all duration-300 ease-in-out origin-bottom-right shadow-2xl flex flex-col ${isFloatingChatOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-50 opacity-0 pointer-events-none'}`}
        style={isDragging ? { left: chatPosition.x, top: chatPosition.y, right: 'auto', bottom: 'auto', transition: 'none' } : { left: chatPosition.x, top: chatPosition.y, right: 'auto', bottom: 'auto' }}
      >
        <div className="w-[380px] sm:w-[420px] border border-[#111111] bg-white flex flex-col hard-shadow">
          <div 
            className="p-3 border-b border-[#111111] bg-[#111111] text-white flex items-center justify-between shrink-0 cursor-move"
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center gap-2 pointer-events-none">
              <Sparkles className="w-4 h-4 text-[#CC0000] animate-pulse" />
              <h3 className="font-serif font-bold text-sm uppercase tracking-wide">Schedule AI</h3>
            </div>
            <button onClick={() => setIsFloatingChatOpen(false)} className="hover:text-[#CC0000] transition-colors p-1" aria-label="Close Chat">
              <span className="font-mono text-xs uppercase tracking-widest">[X]</span>
            </button>
          </div>
          
          <div className="p-4 bg-[#F9F9F7] flex-grow overflow-y-auto space-y-4 h-[350px]">
            {calendarChatLog.map((chat, idx) => (
              <div key={idx} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 border font-serif text-sm ${
                  chat.role === "user"
                    ? "bg-[#111111] text-[#F9F9F7] border-transparent"
                    : "bg-white text-[#111111] border-[#111111]"
                }`}>
                  <p className="font-mono text-[8px] uppercase tracking-widest opacity-60 mb-1">
                    {chat.role === "user" ? "You" : "Assistant"}
                  </p>
                  <div className="whitespace-pre-wrap leading-relaxed">{formatMarkdown(chat.text)}</div>
                </div>
              </div>
            ))}
            {isCalendarChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#111111] p-3 text-xs font-mono animate-pulse">
                  Analyzing schedule...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleAskCalendarChat} className="flex border-t border-[#111111] shrink-0 bg-white">
            <input
              type="text"
              value={calendarChatQuery}
              onChange={(e) => setCalendarChatQuery(e.target.value)}
              placeholder="Ask about your day..."
              className="flex-grow px-3 py-3 font-mono text-xs focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={isCalendarChatLoading || !calendarChatQuery.trim()}
              className="bg-[#111111] text-[#F9F9F7] hover:bg-[#CC0000] font-sans font-bold uppercase tracking-widest text-xs px-4 transition-colors disabled:opacity-50"
            >
              Ask
            </button>
          </form>
        </div>
      </div>

      {/* Floating Action Button for Chat */}
      <button
        onClick={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
        className="fixed bottom-[15%] right-12 z-40 rounded-full shadow-2xl hover:scale-110 transition-transform overflow-hidden border-4 border-[#111111] hover:border-[#CC0000]"
        aria-label="Toggle AI Chat"
      >
        <img src="/chatbot-avatar.jpg" alt="AI Chatbot" className="w-16 h-16 object-cover" />
      </button>

      {/* Expanded Daily Brief Modal */}
      {isBriefExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-[#F9F9F7] border-4 border-[#111111] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[16px_16px_0px_0px_rgba(204,0,0,1)]">
            <div className="flex items-center justify-between p-4 border-b-4 border-[#111111] bg-white">
              <h2 className="font-serif font-black text-2xl md:text-3xl uppercase tracking-tight">Daily Brief: Expanded View</h2>
              <button 
                onClick={() => setIsBriefExpanded(false)}
                className="font-mono text-sm font-black bg-[#111111] text-white px-4 py-2 hover:bg-[#CC0000] transition-colors"
              >
                CLOSE [X]
              </button>
            </div>
            <div className="p-6 md:p-10 overflow-y-auto flex-grow bg-white">
              {isLoadingBrief ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Sparkles className="w-8 h-8 text-[#CC0000] animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#111111] font-bold">Synthesizing Intel...</span>
                </div>
              ) : morningBrief ? (
                <div className="text-[#111111] font-body text-base md:text-lg whitespace-pre-wrap leading-relaxed">
                  {formatMarkdown(morningBrief)}
                </div>
              ) : (
                <div className="text-neutral-500 font-mono text-xs uppercase italic py-8 text-center">
                  Awaiting Intelligence Generation...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#F9F9F7] border-4 border-[#111111] w-full max-w-md shadow-[16px_16px_0px_0px_rgba(204,0,0,1)] flex flex-col">
            <div className="flex justify-between items-center bg-[#111111] p-4 text-white">
              <h2 className="font-serif font-bold text-xl uppercase tracking-widest">New Event</h2>
              <button onClick={() => setShowAddEventModal(false)} className="font-mono text-sm hover:text-[#CC0000]">
                [X]
              </button>
            </div>
            <form onSubmit={handleManualAddEvent} className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-widest mb-1 text-neutral-600">Event Title</label>
                <input 
                  type="text" 
                  value={newEventData.name}
                  onChange={(e) => setNewEventData({...newEventData, name: e.target.value})}
                  className="w-full border-2 border-[#111111] bg-white p-2 font-serif focus-visible:outline-none focus-visible:border-[#CC0000]" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-widest mb-1 text-neutral-600">Day (June 2026)</label>
                  <input 
                    type="number" 
                    min="1" max="30"
                    value={newEventData.day}
                    onChange={(e) => setNewEventData({...newEventData, day: parseInt(e.target.value)})}
                    className="w-full border-2 border-[#111111] bg-white p-2 font-mono focus-visible:outline-none focus-visible:border-[#CC0000]" 
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-widest mb-1 text-neutral-600">Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 10:30 AM"
                    value={newEventData.time}
                    onChange={(e) => setNewEventData({...newEventData, time: e.target.value})}
                    className="w-full border-2 border-[#111111] bg-white p-2 font-mono focus-visible:outline-none focus-visible:border-[#CC0000]" 
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-widest mb-1 text-neutral-600">Type</label>
                <select 
                  value={newEventData.type}
                  onChange={(e) => setNewEventData({...newEventData, type: e.target.value})}
                  className="w-full border-2 border-[#111111] bg-white p-2 font-serif focus-visible:outline-none focus-visible:border-[#CC0000]"
                >
                  <option>Meeting</option>
                  <option>Call</option>
                  <option>Review</option>
                  <option>Consultation</option>
                  <option>Personal</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isAddingEvent}
                className="w-full bg-[#111111] text-[#F9F9F7] font-sans font-bold uppercase tracking-widest text-[10px] py-3 mt-4 hover:bg-[#CC0000] transition-colors disabled:opacity-50"
              >
                {isAddingEvent ? "Adding..." : "Add to Calendar"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
