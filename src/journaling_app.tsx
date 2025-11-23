import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Send, User, MessageCircle, Clock, TrendingUp, Lightbulb, BarChart3, PieChart, Activity, LogIn, LogOut, UserPlus, Eye, EyeOff } from 'lucide-react';

const AIJournalingTool = () => {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Journal states
  const [journalEntry, setJournalEntry] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [journalHistory, setJournalHistory] = useState<any[]>([]);
  const [currentMood, setCurrentMood] = useState('');
  const [activeTab, setActiveTab] = useState('write');
  const [showInsightOption, setShowInsightOption] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [userDatabase, setUserDatabase] = useState<any>({});

  // Load user data
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

  // Save user database
  useEffect(() => {
    if (Object.keys(userDatabase).length > 0) {
      localStorage.setItem('journalUsers', JSON.stringify(userDatabase));
    }
  }, [userDatabase]);

  // Save journal data
  useEffect(() => {
    if (currentUser && journalHistory.length > 0) {
      saveUserJournalData(currentUser.username, journalHistory);
    }
  }, [journalHistory, currentUser]);

  const saveUserJournalData = (username: string, data: any[]) => {
    setUserDatabase((prev: any) => ({
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

      const newUser = {
        username: authForm.username,
        password: authForm.password,
        createdAt: new Date().toISOString(),
        journalHistory: []
      };

      setUserDatabase((prev: any) => ({
        ...prev,
        [authForm.username]: newUser
      }));

      setCurrentUser({ username: authForm.username });
      localStorage.setItem('currentJournalUser', JSON.stringify({ username: authForm.username }));
      setJournalHistory([]);
      setShowAuth(false);
      setAuthForm({ username: '', password: '', confirmPassword: '' });
      
    } else {
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

  const wisdomContext = `Sri Sri Ravi Shankar's teachings on love, peace, wisdom, and life.`;

  const analyzeEntryForInsights = async (entry: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 400,
          messages: [{
            role: "user",
            content: `Analyze this journal entry for sentiment and life categories.

Entry: "${entry}"

Respond ONLY with valid JSON (no markdown, no backticks):
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
}`
          }]
        })
      });

      const data = await response.json();
      let analysisText = data.content[0].text;
      analysisText = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(analysisText);
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        categories: { relationship: 5, money: 3, health: 4, education: 2, job: 3 },
        sentiment: "neutral",
        dominant_theme: "general",
        insight: "Love is not an emotion. It is your very existence."
      };
    }
  };

  const analyzeEntry = async (entry: string) => {
    setIsLoading(true);
    
    try {
      const now = new Date();
      const conversationHistory = journalHistory.slice(0, 3).map((h: any) => ({
        date: h.date,
        entry: h.entry.slice(0, 100) + '...',
        mood: h.mood
      }));

      const analysis = await analyzeEntryForInsights(entry);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 400,
          messages: [{
            role: "user",
            content: `You are a gentle AI journaling companion inspired by Sri Sri Ravi Shankar's wisdom.

TODAY'S ENTRY: "${entry}" (mood: ${currentMood || 'none'})

Respond as a caring friend in under 60 words:
- Acknowledge warmly
- Ask ONE gentle reflection question  
- Be conversational

Then ask: "Would you like a small insight?"`
          }]
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
        entry,
        guidance,
        mood: currentMood,
        analysis
      };
      
      setJournalHistory((prev: any) => [newEntry, ...prev]);
      setAiResponse(guidance);
      setShowInsightOption(true);
      setJournalEntry('');
      
    } catch (error) {
      console.error('Error getting guidance:', error);
      setAiResponse("I'm here with you. How are you feeling after writing this?\n\nWould you like a small insight?");
      setShowInsightOption(true);
    } finally {
      setIsLoading(false);
    }
  };

  const provideInsight = () => {
    if (!journalHistory[0]?.analysis?.insight) return;
    const insight = journalHistory[0].analysis.insight;
    setAiResponse((prev: string) => prev + `\n\n💡 ${insight}`);
    setShowInsightOption(false);
  };

  const moods = [
    { value: 'peaceful', label: '😌 Peaceful', color: 'bg-blue-100 text-blue-800' },
    { value: 'stressed', label: '😰 Stressed', color: 'bg-red-100 text-red-800' },
    { value: 'grateful', label: '🙏 Grateful', color: 'bg-green-100 text-green-800' },
    { value: 'sad', label: '😢 Sad', color: 'bg-gray-100 text-gray-800' },
  ];

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Heart className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Mindful Journal</h1>
            <p className="text-gray-600 mt-2">Your personal space for reflection</p>
          </div>

          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                authMode === 'login' ? 'bg-white text-orange-700 shadow-sm' : 'text-gray-600'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                authMode === 'signup' ? 'bg-white text-orange-700 shadow-sm' : 'text-gray-600'
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
            <input
              type="text"
              value={authForm.username}
              onChange={(e) => setAuthForm((prev: any) => ({...prev, username: e.target.value}))}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Username"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={authForm.password}
                onChange={(e) => setAuthForm((prev: any) => ({...prev, password: e.target.value}))}
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Password"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {authMode === 'signup' && (
              <input
                type="password"
                value={authForm.confirmPassword}
                onChange={(e) => setAuthForm((prev: any) => ({...prev, confirmPassword: e.target.value}))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Confirm Password"
              />
            )}
            <button
              onClick={handleAuth}
              className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-orange-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">Mindful Journal</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg shadow-sm border">
            <button 
              onClick={() => setActiveTab('write')}
              className={`px-6 py-2 rounded-l-lg ${activeTab === 'write' ? 'bg-orange-100 text-orange-700' : 'text-gray-600'}`}
            >
              Write
            </button>
            <button 
              onClick={() => setActiveTab('journey')}
              className={`px-6 py-2 rounded-r-lg ${activeTab === 'journey' ? 'bg-orange-100 text-orange-700' : 'text-gray-600'}`}
            >
              Journey ({journalHistory.length})
            </button>
          </div>
        </div>

        {activeTab === 'write' && (
          <div className="space-y-6">
            {aiResponse && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-gray-700 whitespace-pre-line">{aiResponse}</p>
                {showInsightOption && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={provideInsight}
                      className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                    >
                      <Lightbulb className="w-4 h-4 inline mr-2" />
                      Yes, give insight
                    </button>
                    <button
                      onClick={() => setShowInsightOption(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
                    >
                      Not now
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium mb-4">How are you feeling?</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setCurrentMood(mood.value)}
                    className={`px-3 py-2 rounded-full text-sm ${
                      currentMood === mood.value ? mood.color + ' ring-2' : 'bg-gray-100'
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>

              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="What's on your mind today?"
                className="w-full h-40 p-4 border rounded-lg resize-none"
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => journalEntry.trim() && analyzeEntry(journalEntry)}
                  disabled={!journalEntry.trim() || isLoading}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {isLoading ? 'Reflecting...' : 'Share'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'journey' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium mb-6">Your Journey</h3>
            {journalHistory.length === 0 ? (
              <p className="text-center text-gray-500">Your journey starts with your first entry.</p>
            ) : (
              <div className="space-y-6">
                {journalHistory.map((entry: any) => (
                  <div key={entry.id} className="border-b pb-6">
                    <div className="text-sm text-gray-500 mb-2">
                      {entry.dayOfWeek}, {entry.date} at {entry.time}
                    </div>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p>{entry.entry}</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="whitespace-pre-line">{entry.guidance}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIJournalingTool;