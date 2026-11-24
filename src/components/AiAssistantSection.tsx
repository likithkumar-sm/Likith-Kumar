import {AlertCircle, Compass, RotateCcw, Send} from 'lucide-react';
import {useEffect, useRef, useState, type FormEvent} from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface AiAssistantSectionProps {
  savedPlaceNames: string[];
  pendingPrompt: string | null;
  onConsumePendingPrompt: () => void;
}

const QUICK_PROMPTS = [
  'Plan a 3-day Coorg & Wayanad waterfall, coffee & homestay itinerary.',
  'Best season to visit Kumbhalgarh Fort & heritage havelis in Rajasthan.',
  'Recommend women-led spice cooperatives and local crafts in Kerala.',
  'Which Western Ghats trails & certified guides are best for winter birding?',
];

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'model',
  text: 'Namaste! Welcome to Swadesh Trails. Ask me for regional Indian itineraries across Kodagu, Wayanad, Munnar, Rajasthan, Tamil Nadu, or Meghalaya—including monsoon waterfall timings, heritage homestays, and certified local guides.',
};

export function AiAssistantSection({
  savedPlaceNames,
  pendingPrompt,
  onConsumePendingPrompt,
}: AiAssistantSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const historyPayload = messages
      .filter((m) => m.id !== 'welcome-msg')
      .map((m) => ({role: m.role, text: m.text}));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tourism-assistant', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          savedPlaces: savedPlaceNames,
        }),
      });

      const data = (await response.json()) as {reply?: string; error?: string};

      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Could not reach the AI Tourism Assistant.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.reply as string,
        },
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to connect to the AI Tourism Assistant.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pendingPrompt) {
      void sendMessage(pendingPrompt);
      onConsumePendingPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleReset = () => {
    setMessages([INITIAL_ASSISTANT_MESSAGE]);
    setErrorMessage(null);
  };

  return (
    <section
      id="ai-assistant"
      className="bg-[#133828] text-white py-16 sm:py-20 border-y border-[#0C2419]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Guidance & Quick Prompts */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#E2C583] mb-2">
                04. AI Tourism Concierge
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4"
                style={{textWrap: 'balance'}}
              >
                Tailored local itineraries built around real community listings.
              </h2>
              <p className="text-sm sm:text-base text-[#E7DEC9]/90 leading-relaxed mb-8">
                Ask for multi-city pacing, monsoon vs. winter travel windows, heritage walk
                pairings, or regional thali stops. Every recommendation draws from verified
                Indian community businesses and guides.
              </p>

              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#E2C583]">
                  Suggested Questions
                </p>
                <div className="flex flex-col gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={isLoading}
                      onClick={() => void sendMessage(prompt)}
                      className="text-left px-4 py-2.5 text-xs sm:text-sm text-[#FAF8F4] bg-[#1B4A35]/80 hover:bg-[#256146] border border-[#2F7A58]/60 rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#E2C583]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {savedPlaceNames.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#256146]">
                <p className="text-xs text-[#E2C583] mb-2 font-medium">
                  Saved Trip Shortlist ({savedPlaceNames.length}): {savedPlaceNames.join(', ')}
                </p>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    void sendMessage(
                      `Please build a practical route combining my saved spots: ${savedPlaceNames.join(', ')}, with a nearby lunch stop and local guide tip.`,
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0C2419] bg-[#E2C583] hover:bg-[#CFA957] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Compass className="w-4 h-4" />
                  <span>Plan Route From Saved Spots</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Conversation Surface */}
          <div className="lg:col-span-7 bg-[#FAF8F4] text-[#17261E] rounded-xl border border-[#D5C8AD] flex flex-col overflow-hidden min-h-[460px] max-h-[580px] shadow-xl">
            {/* Concierge Header */}
            <div className="px-5 py-4 bg-[#F3EDE2] border-b border-[#E7DEC9] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-[#133828]" />
                <div>
                  <h3 className="font-display text-base font-semibold text-[#133828] leading-none">
                    Swadesh Trails India Concierge
                  </h3>
                  <p className="text-xs text-[#5A6C61] mt-1">
                    Regional Itinerary &amp; Community Business Advisor
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#425349] hover:text-[#133828] hover:bg-[#E7DEC9] rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Chat Transcript */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAF8F4]"
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                        isUser
                          ? 'bg-[#133828] text-white'
                          : 'bg-white border border-[#E7DEC9] text-[#17261E]'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#E7DEC9] rounded-xl px-4 py-3 text-xs font-medium text-[#5A6C61]">
                    Crafting local recommendations...
                  </div>
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 bg-[#FDF2F2] border border-[#E5B8B8] text-[#7A2020] rounded-lg p-3.5 text-xs sm:text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Input Composer */}
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-white border-t border-[#E7DEC9] flex items-center gap-3"
            >
              <label htmlFor="ai-concierge-input" className="sr-only">
                Ask the AI tourism assistant
              </label>
              <input
                id="ai-concierge-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ask about trails, homestays, local guides, or a 2-day plan..."
                className="flex-1 px-4 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] placeholder:text-[#6B7B71] focus:outline-none focus:border-[#133828] focus:ring-2 focus:ring-[#133828]/15 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] disabled:bg-[#8DA095] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#B88B3A]"
              >
                <span>Ask Guide</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
