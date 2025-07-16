import React from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Zap, Target, CheckCircle2, Code, TestTube, FileText, Lightbulb } from "lucide-react";

interface AILoadingAnimationProps {
  type: "test-generation" | "coverage-analysis" | "test-suites" | "general";
  message?: string;
  stage?: string;
  progress?: number;
}

const loadingMessages = {
  "test-generation": [
    "Analyzing project requirements...",
    "Generating intelligent test cases...",
    "Optimizing test coverage...",
    "Applying best practices...",
    "Finalizing recommendations..."
  ],
  "coverage-analysis": [
    "Scanning existing test cases...",
    "Analyzing coverage gaps...",
    "Reviewing Jira tickets...",
    "Identifying missing scenarios...",
    "Preparing recommendations..."
  ],
  "test-suites": [
    "Understanding project context...",
    "Designing test architecture...",
    "Creating test suites...",
    "Organizing test categories...",
    "Optimizing test structure..."
  ],
  "general": [
    "Processing your request...",
    "Analyzing data...",
    "Generating insights...",
    "Preparing response...",
    "Almost ready..."
  ]
};

const AnimatedIcon = ({ icon: Icon, delay = 0 }: { icon: any; delay?: number }) => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ delay, duration: 0.5, ease: "backOut" }}
    className="text-primary"
  >
    <Icon className="h-6 w-6" />
  </motion.div>
);

const FloatingIcons = () => {
  const icons = [Brain, Sparkles, Zap, Target, CheckCircle2, Code, TestTube, FileText, Lightbulb];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((Icon, index) => (
        <motion.div
          key={index}
          className="absolute text-primary/20"
          initial={{ 
            x: Math.random() * 400,
            y: Math.random() * 200,
            opacity: 0,
            scale: 0.5
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, 360]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: index * 0.5,
            ease: "easeInOut"
          }}
        >
          <Icon className="h-4 w-4" />
        </motion.div>
      ))}
    </div>
  );
};

const PulsingDots = () => (
  <div className="flex items-center gap-1">
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className="w-2 h-2 bg-primary rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: index * 0.2,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

const ProgressRing = ({ progress = 0 }: { progress: number }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted/20"
        />
        <motion.circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDasharray, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ strokeDasharray }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Brain className="h-4 w-4 text-primary" />
      </motion.div>
    </div>
  );
};

const AnimatedMessage = ({ messages, currentIndex }: { messages: string[]; currentIndex: number }) => (
  <motion.div
    key={currentIndex}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="text-center text-sm text-text-muted"
  >
    {messages[currentIndex]}
  </motion.div>
);

export const AILoadingAnimation: React.FC<AILoadingAnimationProps> = ({
  type,
  message,
  stage,
  progress = 0
}) => {
  const messages = loadingMessages[type];
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);

  React.useEffect(() => {
    if (!stage && messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [messages.length, stage]);

  return (
    <div className="relative min-h-[200px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-atmf-main/10 to-primary/5 rounded-lg border border-white/10">
      <FloatingIcons />
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Main Animation */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {progress > 0 ? (
            <ProgressRing progress={progress} />
          ) : (
            <motion.div
              className="relative"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="relative">
                <Brain className="h-8 w-8 text-primary" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                >
                  <Sparkles className="h-3 w-3 text-yellow-400" />
                </motion.div>
              </div>
            </motion.div>
          )}
          
          <div className="flex items-center gap-3">
            <AnimatedIcon icon={TestTube} delay={0.1} />
            <AnimatedIcon icon={Code} delay={0.2} />
            <AnimatedIcon icon={Target} delay={0.3} />
          </div>
        </motion.div>

        {/* Message Display */}
        <div className="text-center space-y-2">
          <motion.h3
            className="font-medium text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            AI Test Generation
          </motion.h3>
          
          {stage ? (
            <motion.p
              className="text-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {stage}
            </motion.p>
          ) : message ? (
            <motion.p
              className="text-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {message}
            </motion.p>
          ) : (
            <AnimatedMessage messages={messages} currentIndex={currentMessageIndex} />
          )}
        </div>

        {/* Progress Indicator */}
        {progress > 0 && (
          <motion.div
            className="w-full max-w-xs"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-xs text-center text-text-muted mb-2">
              {Math.round(progress)}% Complete
            </div>
            <div className="w-full bg-muted/20 rounded-full h-1">
              <motion.div
                className="bg-primary h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Pulsing Dots */}
        <PulsingDots />
      </div>
    </div>
  );
};

// Compact loading component for inline use
export const CompactAILoader = ({ message = "Generating..." }: { message?: string }) => (
  <div className="flex items-center gap-3 p-4 bg-atmf-main/10 rounded-lg border border-white/10">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <Brain className="h-5 w-5 text-primary" />
    </motion.div>
    <span className="text-sm text-text-muted">{message}</span>
    <PulsingDots />
  </div>
);

// Success animation for completed operations
export const AISuccessAnimation = ({ message = "Generation Complete!" }: { message?: string }) => (
  <motion.div
    className="flex flex-col items-center gap-4 p-6"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, ease: "backOut" }}
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5, ease: "backOut" }}
    >
      <CheckCircle2 className="h-12 w-12 text-green-500" />
    </motion.div>
    <motion.p
      className="text-lg font-medium text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {message}
    </motion.p>
  </motion.div>
);