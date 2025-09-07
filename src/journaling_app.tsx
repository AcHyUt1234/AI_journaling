import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Brain, Sparkles, Send, Calendar, Search, User, MessageCircle, Clock, TrendingUp, Bell, Lightbulb, BarChart3, PieChart, Activity, LogIn, LogOut, UserPlus, Lock, Eye, EyeOff } from 'lucide-react';

interface User {
  username: string;
}

interface JournalEntry {
  id: number;
  date: string;
  time: string;
  dayOfWeek: string;
  fullDate: string;
  entry: string;
  guidance: string;
  mood: string;
  analysis: any;
}

const AIJournalingTool = () => {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authForm, setAuthForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Existing states
  const [journalEntry, setJournalEntry] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);
  const [currentMood, setCurrentMood] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [showInsightOption, setShowInsightOption] = useState(false);
  const [wantsInsight, setWantsInsight] = useState(false);
  const [lastReminderCheck, setLastReminderCheck] = useState(Date.now());
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  // Mock user database - in a real app, this would be a proper database
  interface UserData {
  journalHistory: any[]; // refine type if possible
  lastActive: string;
  password: string;
  // add other user data fields as needed 
  }
  const [userDatabase, setUserDatabase] = useState<Record<string, UserData>>({});

  // Load user data on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('journalUsers');
    const savedCurrentUser = localStorage.getItem('currentJournalUser');
    
    if (savedUsers) {
      try {
        setUserDatabase(JSON.parse(savedUsers));
      } catch (e) {
        console.error('Error loading user database:', e);
      }
    }

    if (savedCurrentUser) {
      try {
        const user = JSON.parse(savedCurrentUser);
        setCurrentUser(user);
        setShowAuth(false);
        loadUserJournalData(user.username);
      } catch (e) {
        console.error('Error loading current user:', e);
      }
    }
  }, []);

  // Save user database to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(userDatabase).length > 0) {
      localStorage.setItem('journalUsers', JSON.stringify(userDatabase));
    }
  }, [userDatabase]);

  // Save journal data whenever it changes (for logged-in user)
  useEffect(() => {
    if (currentUser && journalHistory.length > 0) {
      saveUserJournalData(currentUser.username, journalHistory);
    }
  }, [journalHistory, currentUser]);

  const saveUserJournalData = (username: string, data: JournalEntry[]) => {
    setUserDatabase(prev => ({
      ...prev,
      [username]: {
        ...prev[username],
        journalHistory: data,
        lastActive: new Date().toISOString()
      }
    }));
  };

  const loadUserJournalData = (username: string) => {
    if (userDatabase[username]?.journalHistory) {
      setJournalHistory(userDatabase[username].journalHistory);
    } else {
      setJournalHistory([]);
    }
  };

  const handleAuth = () => {
    setAuthError('');
    
    if (authMode === 'signup') {
      // Validation
      if (!authForm.username || !authForm.password || !authForm.confirmPassword) {
        setAuthError('Please fill in all fields');
        return;
      }
      
      if (authForm.password !== authForm.confirmPassword) {
        setAuthError('Passwords do not match');
        return;
      }
      
      if (authForm.password.length < 6) {
        setAuthError('Password must be at least 6 characters');
        return;
      }
      
      if (userDatabase[authForm.username]) {
        setAuthError('Username already exists');
        return;
      }

      // Create new user
      const newUser = {
        username: authForm.username,
        password: authForm.password, // In a real app, this would be hashed
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        journalHistory: []
      };

      setUserDatabase(prev => ({
        ...prev,
        [authForm.username]: newUser
      }));

      setCurrentUser({ username: authForm.username });
      localStorage.setItem('currentJournalUser', JSON.stringify({ username: authForm.username }));
      setJournalHistory([]);
      setShowAuth(false);
      setAuthForm({ username: '', password: '', confirmPassword: '' });
      
    } else {
      // Login
      if (!authForm.username || !authForm.password) {
        setAuthError('Please enter username and password');
        return;
      }

      const user = userDatabase[authForm.username];
      if (!user || user.password !== authForm.password) {
        setAuthError('Invalid username or password');
        return;
      }

      setCurrentUser({ username: authForm.username });
      localStorage.setItem('currentJournalUser', JSON.stringify({ username: authForm.username }));
      loadUserJournalData(authForm.username);
      setShowAuth(false);
      setAuthForm({ username: '', password: '', confirmPassword: '' });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setJournalHistory([]);
    setShowAuth(true);
    setActiveTab('write');
    setAiResponse('');
    setJournalEntry('');
    setCurrentMood('');
    localStorage.removeItem('currentJournalUser');
  };

  // Expanded Sri Sri's Wisdom Context
  const wisdomContext = `
Sri Sri Ravi Shankar's core teachings and wisdom:

FUNDAMENTAL TRUTHS:
- "Love is not an emotion. It is your very existence"
- "When the mind is at peace, the world too is at peace"
- "Faith is realizing that you always get what you need"
- "Human evolution has two steps - from being somebody to being nobody; and from being nobody to being everybody"
- "The best form of worship is to be happy, to be grateful"
- Deep inside, everyone is adorable and lovable at their core
- Perfect core, imperfections only on the circumference

MIND & EMOTIONS:
- Mind influenced by: space, time, food, past impressions, associations
- Five types of restlessness: place, body, mind, emotions, soul
- "Love is preserved by wisdom. Destroyed by demand, tested by doubt, nourished by longing"
- "When your intentions are very pure and clear, nature brings support to you"
- Emotions can be purified through music, actions through service
- Knowledge purifies the intellect, charity purifies money

LIFE APPROACH:
- "Be easy going, why struggle unnecessarily?"
- "Bringing music amidst chaos is the skill of Divinity"
- "Only when intellectual knowledge, music and meditation come together, can wisdom really dawn"
- See people beyond their expressions - there's a gift inside everyone
- Gratitude attracts abundance naturally
- Sensitivity comes with serenity, calmness, culture
- The five life problem areas: relationships, money, health, education, job

SPIRITUAL INSIGHTS:
- "If you pray to God with all your heart, dropping sorrow (hanging onto past), whatever you desire will be given"
- "Wisdom is the means to bring celebration into life"
- Knowledge gives broad vision and big heart
- Knowledge that unites love and wisdom uplifts the spirit
- Service without doership, giving without givership
- All emotions, even anger, have beauty when seen from expanded awareness
`;

  const journalPrompts = [
    "How was your day today?",
    "What made you smile recently?",
    "What did you feel grateful for today?",
    "What's weighing on your mind?",
    "How are you feeling in your body right now?",
    "What brought you peace today?",
    "What challenged you today?",
    "What did you learn about yourself?",
    "How did your relationships feel today?",
    "What would make tomorrow better?"
  ];

  const analyzeEntryForInsights = async (entry: string) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          messages: [
            {
              role: "user",
              content: `Analyze this journal entry for sentiment and life categories according to Sri Sri Ravi Shankar's framework.

Entry: "${entry}"

Respond ONLY with valid JSON:
{
  "categories": {
    "relationship": 0-10,
    "money": 0-10,
    "health": 0-10,
    "education": 0-10,
    "job": 0-10
  },
  "sentiment": "positive/neutral/negative",
  "dominant_theme": "relationship/money/health/education/job/general",
  "insight": "one sentence wisdom from Sri Sri's teachings"
}

Rate 0-10 how much the entry relates to each life area. Insight should be relevant and brief.`
            }
          ]
        })
      });

      const data = await response.json();
      let analysisText = data.content[0].text;
      analysisText = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(analysisText);
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        categories: { relationship: 0, money: 0, health: 0, education: 0, job: 0 },
        sentiment: "neutral",
        dominant_theme: "general",
        insight: ""
      };
    }
  };

  const analyzeEntry = async (entry: string) => {
    setIsLoading(true);
    
    try {
      const now = new Date();
      const conversationHistory = journalHistory.slice(0, 3).map(h => ({
        date: h.date,
        time: h.time,
        day: h.dayOfWeek,
        entry: h.entry.slice(0, 100) + '...',
        mood: h.mood,
        sentiment: h.analysis?.sentiment
      }));

      const analysis = await analyzeEntryForInsights(entry);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          messages: [
            {
              role: "user",
              content: `You are a gentle AI journaling companion inspired by Sri Sri Ravi Shankar's wisdom.

Context: ${wisdomContext}

RECENT HISTORY (last 3 entries):
${conversationHistory.map(h => `${h.day}: "${h.entry}" (${h.mood}, ${h.sentiment})`).join('\n')}

TODAY'S ENTRY:
"${entry}" (mood: ${currentMood || 'none'})

Respond as a caring friend:
- Acknowledge warmly (1 sentence)
- Ask ONE gentle reflection question
- Keep under 60 words total
- Reference patterns if you see them
- Be conversational, not teachy

Then ask: "Would you like a small insight?"

Stay brief and caring.`
            }
          ]
        })
      });

      const data = await response.json();
      const guidance = data.content[0].text;
      
      const newEntry = {
        id: Date.now(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        dayOfWeek: now.toLocaleDateString('en', {weekday: 'long'}),
        fullDate: now.toISOString(),
        entry: entry,
        guidance: guidance,
        mood: currentMood,
        analysis: analysis
      };
      
      setJournalHistory(prev => [newEntry, ...prev]);
      setAiResponse(guidance);
      setShowInsightOption(true);
      setJournalEntry('');
      
    } catch (error) {
      console.error('Error getting guidance:', error);
      setAiResponse("I'm here with you. How are you feeling after writing this?");
    } finally {
      setIsLoading(false);
    }
  };

  const provideInsight = async () => {
    if (!journalHistory[0]?.analysis?.insight) return;
    
    const insight = journalHistory[0].analysis.insight;
    setAiResponse(prev => prev + `\n\n💡 ${insight}`);
    setShowInsightOption(false);
    setWantsInsight(false);
  };

  const getFilteredHistory = () => {
    if (selectedTimeframe === 'all') return journalHistory;
    
    const now = new Date();
    const daysBack = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 7;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    return journalHistory.filter(entry => new Date(entry.fullDate) >= cutoffDate);
  };

  const calculateStats = () => {
    const filteredHistory = getFilteredHistory();
    if (filteredHistory.length < 5) return null;

    const stats = {
      relationship: 0,
      money: 0, 
      health: 0,
      education: 0,
      job: 0
    };

    let sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    let totalScore = 0;

    filteredHistory.forEach(entry => {
      if (entry.analysis) {
        Object.keys(stats).forEach(key => {
          const score = entry.analysis.categories[key] || 0;
          stats[key] += score;
          totalScore += score;
        });
        sentimentCounts[entry.analysis.sentiment] = (sentimentCounts[entry.analysis.sentiment] || 0) + 1;
      }
    });

    // Calculate averages and percentages
    const avgStats = {};
    Object.keys(stats).forEach(key => {
      avgStats[key] = Math.round((stats[key] / filteredHistory.length) * 10) / 10;
    });

    const dominantSentiment = Object.keys(sentimentCounts).reduce((a, b) => 
      sentimentCounts[a] > sentimentCounts[b] ? a : b
    );

    const topConcern = Object.keys(avgStats).reduce((a, b) => avgStats[a] > avgStats[b] ? a : b);

    return { 
      categories: avgStats, 
      sentiment: dominantSentiment, 
      sentimentCounts,
      totalEntries: filteredHistory.length,
      topConcern,
      improvementTrend: calculateTrend(filteredHistory)
    };
  };

  const calculateTrend = (entries) => {
    if (entries.length < 4) return 'stable';
    
    const recent = entries.slice(0, Math.ceil(entries.length/2));
    const older = entries.slice(Math.ceil(entries.length/2));
    
    const recentPositive = recent.filter(e => e.analysis?.sentiment === 'positive').length / recent.length;
    const olderPositive = older.filter(e => e.analysis?.sentiment === 'positive').length / older.length;
    
    if (recentPositive > olderPositive + 0.2) return 'improving';
    if (recentPositive < olderPositive - 0.2) return 'declining';
    return 'stable';
  };

  const handleSubmit = () => {
    if (journalEntry.trim()) {
      analyzeEntry(journalEntry);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  const handleAuthKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  const moods = [
    { value: 'peaceful', label: '😌 Peaceful', color: 'bg-blue-100 text-blue-800' },
    { value: 'stressed', label: '😰 Stressed', color: 'bg-red-100 text-red-800' },
    { value: 'confused', label: '🤔 Confused', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'grateful', label: '🙏 Grateful', color: 'bg-green-100 text-green-800' },
    { value: 'sad', label: '😢 Sad', color: 'bg-gray-100 text-gray-800' },
    { value: 'excited', label: '✨ Excited', color: 'bg-purple-100 text-purple-800' },
    { value: 'thoughtful', label: '💭 Thoughtful', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'overwhelmed', label: '🌊 Overwhelmed', color: 'bg-orange-100 text-orange-800' }
  ];

  const stats = calculateStats();

  // Authentication UI
  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              {/* Sri Sri Logo placeholder - replace with actual logo */}
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">ॐ</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Mindful Journal</h1>
                <p className="text-xs text-orange-600 font-medium">Inspired by Art of Living</p>
              </div>
            </div>
            <p className="text-gray-600">Your personal space for reflection</p>
          </div>

          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'login' 
                  ? 'bg-white text-orange-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'signup' 
                  ? 'bg-white text-orange-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Sign Up
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {authError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={authForm.username}
                onChange={(e) => setAuthForm(prev => ({...prev, username: e.target.value}))}
                onKeyPress={handleAuthKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({...prev, password: e.target.value}))}
                  onKeyPress={handleAuthKeyPress}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={authForm.confirmPassword}
                  onChange={(e) => setAuthForm(prev => ({...prev, confirmPassword: e.target.value}))}
                  onKeyPress={handleAuthKeyPress}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              onClick={handleAuth}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <div className="flex items-center justify-center mb-2">
              <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold text-xs">ॐ</span>
              </div>
              <span className="font-medium">Art of Living Foundation</span>
            </div>
            <p>Your journal entries are stored securely and privately.</p>
          </div>
        </div>
      </div>
    );
  }

  // Main Journal UI (when logged in)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with logout */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-orange-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">Mindful Journal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A space for reflection, guided by timeless wisdom
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg shadow-sm border">
            <button 
              onClick={() => setActiveTab('write')}
              className={`px-6 py-2 rounded-l-lg flex items-center ${activeTab === 'write' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Write
            </button>
            <button 
              onClick={() => setActiveTab('journey')}
              className={`px-6 py-2 flex items-center ${activeTab === 'journey' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Journey ({journalHistory.length})
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className={`px-6 py-2 rounded-r-lg flex items-center ${activeTab === 'insights' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics {journalHistory.length >= 5 ? '' : `(${5 - journalHistory.length} more needed)`}
            </button>
          </div>
        </div>

        {activeTab === 'write' && (
          <div className="space-y-6">
            {/* Current Conversation */}
            {aiResponse && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">ॐ</span>
                  </div>
                  <div className="flex-1">
                    <div className="prose prose-orange max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-0">
                        {aiResponse}
                      </p>
                    </div>
                    {showInsightOption && (
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={provideInsight}
                          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 flex items-center"
                        >
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Yes, give Sri Sri's insight
                        </button>
                        <button
                          onClick={() => setShowInsightOption(false)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Not now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mood Selector */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-600" />
                How are you feeling right now?
              </h3>
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setCurrentMood(mood.value)}
                    className={`px-3 py-2 rounded-full text-sm transition-colors ${
                      currentMood === mood.value 
                        ? mood.color + ' ring-2 ring-orange-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
                {currentMood && (
                  <button
                    onClick={() => setCurrentMood('')}
                    className="px-3 py-2 rounded-full text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>

            {/* Journal Entry */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-orange-600" />
                What's on your mind today?
              </h3>
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share whatever is in your heart..."
                className="w-full h-40 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">
                  {journalEntry.length} characters • Press Ctrl+Enter to submit
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!journalEntry.trim() || isLoading}
                  className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Reflecting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Share
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'journey' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-orange-600" />
                Your Journey
              </h3>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {journalHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Your journey starts with your first entry.</p>
                </div>
              ) : (
                journalHistory.map((entry) => (
                  <div key={entry.id} className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm text-gray-500">
                        {entry.dayOfWeek}, {entry.date} at {entry.time}
                      </div>
                      <div className="flex gap-2">
                        {entry.mood && (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            moods.find(m => m.value === entry.mood)?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {moods.find(m => m.value === entry.mood)?.label || entry.mood}
                          </span>
                        )}
                        {entry.analysis?.sentiment && (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.analysis.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            entry.analysis.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.analysis.sentiment}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 bg-blue-50 p-3 rounded-lg">
                          <p className="text-gray-800">{entry.entry}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">ॐ</span>
                        </div>
                        <div className="flex-1 bg-orange-50 p-3 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-line">{entry.guidance}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {journalHistory.length < 5 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">ॐ</span>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Patience, Dear Soul</h3>
                <p className="text-gray-600 mb-4">
                  Analytics become available after 5 journal entries, allowing for meaningful insights into your journey.
                </p>
                <div className="flex justify-center items-center space-x-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full ${
                        i < journalHistory.length ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {journalHistory.length}/5 entries completed • {5 - journalHistory.length} more to go
                </p>
                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800 italic">
                    "The quality of our life depends on the quality of our thoughts." - Sri Sri Ravi Shankar
                  </p>
                </div>
              </div>
            ) : stats ? (
              <>
                {/* Rest of analytics content */}
                <div className="flex justify-center">
                  <div className="flex bg-white rounded-lg shadow-sm border">
                    {[
                      { value: 'week', label: 'This Week' },
                      { value: 'month', label: 'This Month' },
                      { value: 'all', label: 'All Time' }
                    ].map((timeframe) => (
                      <button
                        key={timeframe.value}
                        onClick={() => setSelectedTimeframe(timeframe.value)}
                        className={`px-4 py-2 ${timeframe.value === 'week' ? 'rounded-l-lg' : timeframe.value === 'all' ? 'rounded-r-lg' : ''} ${
                          selectedTimeframe === timeframe.value ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {timeframe.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {Math.round((stats.sentimentCounts.positive / stats.totalEntries) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Positive Entries</div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600 mb-1 capitalize">
                      {stats.improvementTrend}
                    </div>
                    <div className="text-sm text-gray-600">Trend</div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600 mb-1 capitalize">
                      {stats.topConcern}
                    </div>
                    <div className="text-sm text-gray-600">Top Focus Area</div>
                  </div>
                </div>

                {/* Interactive Life Areas Chart */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-6 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-orange-600" />
                    Life Areas Analysis ({stats.totalEntries} entries)
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.entries(stats.categories).map(([category, score]) => (
                      <div key={category} className="flex items-center space-x-4">
                        <div className="w-24 text-sm text-gray-700 capitalize font-medium">
                          {category}
                        </div>
                        <div className="flex-1 flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${
                                category === 'relationship' ? 'bg-pink-500' :
                                category === 'money' ? 'bg-green-500' :
                                category === 'health' ? 'bg-blue-500' :
                                category === 'education' ? 'bg-purple-500' :
                                'bg-orange-500'
                              }`}
                              style={{width: `${(score/10)*100}%`}}
                            ></div>
                          </div>
                          <div className="text-sm font-semibold text-gray-800 w-8">
                            {score}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Insights Summary */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-800 mb-2 flex items-center">
                      <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white font-bold text-xs">ॐ</span>
                      </div>
                      Insights from Sri Sri's Wisdom
                    </h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>• Your journal shows most focus on <strong>{stats.topConcern}</strong></p>
                      <p>• Overall sentiment is <strong>{stats.sentiment}</strong> with a <strong>{stats.improvementTrend}</strong> trend</p>
                      <p>• {stats.sentimentCounts.positive} positive, {stats.sentimentCounts.neutral} neutral, {stats.sentimentCounts.negative} challenging entries</p>
                      {stats.improvementTrend === 'improving' && <p>• 🌟 You're showing beautiful growth - keep reflecting!</p>}
                      {stats.improvementTrend === 'stable' && <p>• 🌿 Your emotional balance is steady - a sign of inner peace</p>}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">Continue journaling to unlock deeper insights.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIJournalingTool;
