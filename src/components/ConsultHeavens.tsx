import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Loader2, BrainCircuit, MessageSquareQuote } from 'lucide-react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

interface ConsultHeavensProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  level: string;
  sect: string | null;
}

export default function ConsultHeavens({ isOpen, onClose, playerName, level, sect }: ConsultHeavensProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'heaven', content: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, response]);

  const handleConsult = async () => {
    if (!query.trim() || isThinking) return;

    // Check for API key if window.aistudio is available (mandatory for Gemini 3 series in some contexts)
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Proceed after opening the dialog as per guidelines
      }
    }

    const userQuery = query;
    setQuery('');
    setChatHistory(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsThinking(true);
    setResponse('');

    try {
      // Create a new instance right before the call to ensure fresh API key
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const systemInstruction = `你现在是《凡人修仙传》世界中的“天道意志”或“上古大能”。
      当前道友信息：
      姓名：${playerName}
      境界：${level}
      宗门：${sect || '散修'}
      
      请以仙风道骨、玄奥莫测的口吻回答道友的咨询。
      你可以提供修炼建议、剧情指引、或者是对修仙世界的见解。
      如果道友询问如何突破，请根据其当前境界给出玄妙的指引。
      回答应充满修仙氛围，使用“本尊”、“尔等”、“道友”、“机缘”等词汇。
      字数不宜过多，保持神秘感。`;

      const result = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [...chatHistory.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })), { role: 'user', parts: [{ text: userQuery }] }],
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });

      const text = result.text || '天机混淆，本尊亦无法看透...';
      setChatHistory(prev => [...prev, { role: 'heaven', content: text }]);
    } catch (error: any) {
      console.error('Consult Heavens Error:', error);
      let errorMsg = '因果紊乱，天道暂时封闭，请稍后再试。';
      
      // Handle specific proxy errors
      if (error.message && error.message.includes('Rpc failed')) {
        errorMsg = '天机受阻（网络波动），请检查灵力连接或稍后再试。若持续失败，请尝试重新选择天机密钥。';
      }
      
      setChatHistory(prev => [...prev, { role: 'heaven', content: errorMsg }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)]"
          >
            {/* Header */}
            <div className="p-6 border-b border-indigo-500/20 flex justify-between items-center bg-indigo-950/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <BrainCircuit size={24} className="text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-widest">推演天机</h2>
                  <p className="text-[10px] text-indigo-400/70 uppercase tracking-tighter mt-0.5">Consult the Heavens · High Intelligence Mode</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
                <X size={24} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
            >
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <MessageSquareQuote size={48} className="text-indigo-500/30" />
                  <p className="text-slate-400 max-w-xs">
                    “大道五十，天衍四九，人遁其一。”<br/>
                    道友若有疑惑，尽可向天道咨询。
                  </p>
                </div>
              )}

              {chatHistory.map((chat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: chat.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl border ${
                    chat.role === 'user' 
                      ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-100 rounded-tr-none' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-200 rounded-tl-none italic font-serif'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{chat.content}</p>
                  </div>
                </motion.div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center space-x-3">
                    <Loader2 size={16} className="text-indigo-400 animate-spin" />
                    <span className="text-xs text-slate-400 animate-pulse">天道推演中...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-indigo-500/20 bg-indigo-950/10">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConsult()}
                  placeholder="请输入你的疑惑，如：如何突破筑基？"
                  className="w-full bg-slate-950/50 border border-indigo-500/30 rounded-2xl py-4 pl-6 pr-14 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                />
                <button
                  onClick={handleConsult}
                  disabled={!query.trim() || isThinking}
                  className={`absolute right-2 p-3 rounded-xl transition-all ${
                    !query.trim() || isThinking 
                      ? 'text-slate-600' 
                      : 'text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300'
                  }`}
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2 text-[10px] text-indigo-400/50 uppercase tracking-widest">
                  <Sparkles size={10} />
                  <span>Powered by Gemini 3.1 Pro Intelligence</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
