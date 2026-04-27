import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Shuffle, RefreshCcw, User, UserCheck, UserX, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from './lib/utils';

type Candidate = { id: string; skill: number; };
type Step = { type: 'shuffle' | 'interview' | 'hire' | 'reject' | 'finish'; message: string; idx?: number; };

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [count, setCount] = useState(10);
  const [speed, setSpeed] = useState(1000);

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentBest, setCurrentBest] = useState<Candidate | null>(null);
  const [hiredCount, setHiredCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'shuffled' | 'running' | 'paused' | 'finished'>('idle');
  
  const [history, setHistory] = useState<Step[]>([]);
  
  const [comparing, setComparing] = useState(false);
  const [justHired, setJustHired] = useState(false);
  const [justRejected, setJustRejected] = useState(false);

  useEffect(() => { initSorted(); }, [count]);

  const initSorted = () => {
    const list = Array.from({ length: count }, (_, i) => ({
      id: `c-${i}`,
      skill: Math.floor(((i + 1) / count) * 100)
    }));
    setCandidates(list);
    resetState();
    setHistory([{ type: 'shuffle', message: 'Candidates arrived (ordered worst to best). This is the worst-case scenario! Shuffle them to randomize the order.' }]);
  };

  const resetState = () => {
    setCurrentIndex(-1);
    setCurrentBest(null);
    setHiredCount(0);
    setStatus('idle');
    setComparing(false);
    setJustHired(false);
    setJustRejected(false);
  };

  const handleShuffle = () => {
    const newArr = [...candidates];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    resetState();
    setCandidates(newArr);
    setStatus('shuffled');
    setHistory([{ type: 'shuffle', message: 'Candidates shuffled! The input is now randomized, guaranteeing an expected O(ln n) hires.' }]);
  };

  const processNextStep = () => {
    if (currentIndex >= candidates.length - 1) {
      setStatus('finished');
      setComparing(false);
      setJustHired(false);
      setJustRejected(false);
      setHistory(h => [{ type: 'finish', message: `Interviews finished! We fired & hired ${hiredCount} total times out of ${candidates.length}.` }, ...h]);
      return;
    }

    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    const candidate = candidates[nextIdx];
    
    setComparing(true);
    setJustHired(false);
    setJustRejected(false);

    setHistory(h => [{ type: 'interview', idx: nextIdx, message: `Interviewing Candidate ${nextIdx + 1} with Skill ${candidate.skill}...` }, ...h]);

    setTimeout(() => {
      if (!currentBest) {
        setJustHired(true);
        setCurrentBest(candidate);
        setHiredCount(h => h + 1);
        setHistory(h => [{ type: 'hire', idx: nextIdx, message: `Hired! Desk was empty, so we must hire Candidate ${nextIdx + 1}.` }, ...h]);
      } else if (candidate.skill > currentBest.skill) {
        setJustHired(true);
        setCurrentBest(candidate);
        setHiredCount(h => h + 1);
        setHistory(h => [{ type: 'hire', idx: nextIdx, message: `Hired! Skill ${candidate.skill} is > current best (${currentBest?.skill}). Fired old, hired new.` }, ...h]);
      } else {
        setJustRejected(true);
        setHistory(h => [{ type: 'reject', idx: nextIdx, message: `Rejected. Skill ${candidate.skill} is <= current best (${currentBest.skill}).` }, ...h]);
      }
      setComparing(false);

      setTimeout(() => {
        setJustHired(false);
        setJustRejected(false);
      }, speed * 0.4);

    }, speed * 0.5);
  };

  useEffect(() => {
    if (status === 'running' && !comparing && !justHired && !justRejected) {
      const tick = setTimeout(() => {
        processNextStep();
      }, 100);
      return () => clearTimeout(tick);
    }
  }, [status, comparing, justHired, justRejected, currentIndex]);

  const toggleRun = () => {
    if (status === 'idle' || status === 'shuffled' || status === 'paused') {
      setStatus('running');
    } else if (status === 'running') {
      setStatus('paused');
    }
  };

  const getCandidateVariants = (idx: number) => {
    const isCurrent = idx === currentIndex;
    const isPast = idx < currentIndex;
    const isBest = currentBest?.id === candidates[idx].id;
    
    if (isCurrent && comparing) return { scale: 1.1, y: -20, boxShadow: "0px 10px 30px rgba(59, 130, 246, 0.5)", borderColor: "#3b82f6" };
    if (isCurrent && justHired) return { scale: 1.1, y: -20, backgroundColor: "#10b981", color: "#fff", borderColor: "#10b981" };
    if (isCurrent && justRejected) return { scale: 0.9, y: 10, opacity: 0.5, borderColor: "#ef4444" };
    
    if (isBest) return { backgroundColor: "#064e3b", color: "#fff", borderColor: "#10b981" };
    if (isPast) return { opacity: 0.4, scale: 0.95 };
    
    return { scale: 1, y: 0, opacity: 1, backgroundColor: "#1e293b", color: "#e2e8f0" };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-900 flex flex-col md:flex-row overflow-hidden">
      
      <aside className="w-full md:w-96 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-8 flex-shrink-0 h-screen overflow-y-auto shadow-2xl z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <Briefcase className="text-blue-500" />
            Hiring Problem
          </h1>
          <p className="text-sm text-slate-400">
            Applying Randomization (CLRS Chapter 5).
          </p>
        </div>

        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-1">Configuration</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Candidate Pool: {count}</label>
            <input 
              type="range" min="5" max="30" value={count} 
              onChange={(e) => setCount(Number(e.target.value))}
              disabled={status === 'running'}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium">Speed</label>
            <div className="flex gap-2 text-xs">
              {[500, 1000, 2000].map(s => (
                <button 
                  key={s} onClick={() => setSpeed(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-md border text-center flex-1 transition-colors",
                    speed === s ? "bg-blue-600 border-blue-500 text-white" : "border-slate-600 hover:bg-slate-700"
                  )}
                >
                  {s === 500 ? 'Fast' : s === 1000 ? 'Normal' : 'Slow'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleShuffle}
            disabled={status === 'running'}
            className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 shadow-lg"
          >
            <Shuffle size={18} />
            1. Shuffle Candidates
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={toggleRun}
              disabled={status === 'idle'}
              className={cn(
                "flex items-center justify-center gap-2 py-3 text-white rounded-xl font-medium transition-colors flex-1 shadow-lg disabled:opacity-50",
                status === 'running' ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
              )}
            >
              <Play size={18} className={status === 'running' ? 'hidden' : 'block'} />
              {status === 'running' ? 'Pause Simulation' : '2. Play Simulation'}
            </button>

            <button
              onClick={() => processNextStep()}
              disabled={status === 'running' || status === 'finished' || status === 'idle'}
              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl border border-slate-600 disabled:opacity-50"
            >
              Step
            </button>
          </div>
          
          <button
            onClick={initSorted}
            className="flex items-center justify-center gap-2 w-full py-2 bg-transparent text-slate-400 hover:text-slate-200 mt-2 text-sm transition-colors"
          >
            <RefreshCcw size={14} />
            Reset to Worst-Case
          </button>
        </div>

        <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700 p-4 flex flex-col min-h-[300px]">
          <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center gap-2 shrink-0">
            <FileText size={16} /> Log
          </h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2 text-xs">
            <AnimatePresence initial={false}>
              {history.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  className={cn(
                    "p-3 rounded-lg border",
                    log.type === 'hire' ? "bg-emerald-900/20 border-emerald-800/50 text-emerald-200" :
                    log.type === 'reject' ? "bg-red-900/20 border-red-800/50 text-red-200" :
                    "bg-slate-800/80 border-slate-700 text-slate-300"
                  )}
                >
                  {log.message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 flex flex-col relative h-screen overflow-y-auto w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full">
            <div>
              <div className="text-slate-400 text-xs font-semibold mb-1 tracking-wider uppercase">Cost (Total Hired)</div>
              <div className="text-4xl font-black text-rose-400 flex items-baseline gap-2">
                {hiredCount}
                <span className="text-lg text-slate-500 font-medium whitespace-nowrap">vs avg ~{Math.ceil(Math.log(count))} if random</span>
              </div>
            </div>
            <div className="hidden sm:block h-12 w-px bg-slate-800 border-l border-slate-950"></div>
            <div>
               <div className="text-slate-400 text-xs font-semibold mb-1 tracking-wider uppercase">Input Sequence</div>
               <div className={cn(
                 "text-lg font-bold flex items-center gap-2",
                 status === 'idle' ? "text-amber-500" : "text-indigo-400"
               )}>
                 {status === 'idle' ? 'Sorted (Worst Case: Hire all n)' : 'Random Array'}
                 {status !== 'idle' && <CheckCircle2 size={16} />}
               </div>
            </div>
          </div>
        </header>

        <section className="mb-10">
          <h3 className="text-sm font-semibold tracking-wide text-slate-400 mb-4 flex items-center gap-2">
            <UserCheck className="text-emerald-500" size={18} />
            Hired (Current Best)
          </h3>
          <div className="h-32 bg-slate-950 border border-dashed border-emerald-900/50 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner">
            <AnimatePresence mode="popLayout">
              {currentBest ? (
                <motion.div
                  key={currentBest.id}
                  initial={{ scale: 0, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.5, opacity: 0, y: -50 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-2xl px-10 py-4 rounded-xl border border-emerald-300 flex items-center justify-center gap-6 z-10"
                >
                  <User size={30} className="text-emerald-50" />
                  <div>
                    <div className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1 opacity-90">Currently At Desk</div>
                    <div className="text-3xl font-black text-white leading-none">Skill: {currentBest.skill}</div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-slate-600 font-medium tracking-wide flex items-center gap-2"
                >
                  <UserX size={18} />
                  Desk is empty. Awaiting first candidate.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className="flex-1 pb-20 overflow-y-auto hide-scrollbar">
          <h3 className="text-sm font-semibold tracking-wide text-slate-400 mb-6 flex items-center gap-2">
            <User className="text-blue-500" size={18} />
            Agency Queue (Candidates)
          </h3>
          
          <div className="flex flex-wrap gap-4 content-start">
            <AnimatePresence>
              {candidates.map((c, i) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={getCandidateVariants(i)}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 rounded-xl border border-slate-700 flex flex-col items-center justify-center transition-shadow z-0"
                  style={{ zIndex: i === currentIndex ? 20 : 1 }}
                >
                  <div className="text-[10px] sm:text-xs uppercase font-bold mb-1 opacity-60">
                    Pos {i + 1}
                  </div>
                  <div className="text-lg sm:text-2xl font-black">{c.skill}</div>
                  
                  {i === currentIndex && (
                    <motion.div 
                      layoutId="focusRing"
                      className="absolute -inset-1.5 border-2 border-blue-500 rounded-xl bg-blue-500/10 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
        
        <div className="absolute bottom-6 right-6 hidden xl:block bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl backdrop-blur-md max-w-sm ml-6">
          <h4 className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
            <Briefcase size={14} /> The Concept
          </h4>
          <div className="text-sm text-slate-300 leading-relaxed space-y-3">
            <p>
              In a sorted worst-case sequence, the skill continually increases. Thus, you fire and hire every single time. Total cost = <strong>n</strong>.
            </p>
            <p>
              By <strong>Shuffling</strong> first, the chance that the <em className="text-white bg-slate-800 px-1 rounded">i-th</em> candidate is the best so far is exactly <em className="text-white bg-slate-800 px-1 rounded">1/i</em>.
            </p>
            <p className="pt-3 border-t border-slate-800 text-slate-200">
              Expected total hires is the Harmonic number:
              <br />
              <span className="text-emerald-400 font-mono text-base block mt-1">
                E[hires] ≈ ln({count}) = {(Math.log(count)).toFixed(2)}
              </span>
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
