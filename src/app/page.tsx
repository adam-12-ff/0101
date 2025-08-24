
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Clipboard, ClipboardCheck, ArrowRight, History as HistoryIcon, Trash2, Award, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Types
type ConversionRecord = {
  id: number;
  type: 'B→D' | 'D→B';
  input: string;
  output: string;
};

type Question = {
    question: string;
    options: string[];
    answer: string;
    type: 'B→D' | 'D→B';
    problem: string;
};

const quizQuestions: Question[] = [
    {
        question: "बाइनरी '1010' का दशमलव मान क्या है?",
        options: ["8", "10", "12", "14"],
        answer: "10",
        type: 'B→D',
        problem: '1010'
    },
    {
        question: "दशमलव '25' का बाइनरी मान क्या है?",
        options: ["11001", "10011", "11101", "11011"],
        answer: "11001",
        type: 'D→B',
        problem: '25'
    },
    {
        question: "बाइनरी '1111' का दशमलव मान क्या है?",
        options: ["15", "16", "7", "31"],
        answer: "15",
        type: 'B→D',
        problem: '1111'
    },
    {
        question: "दशमलव '18' का बाइनरी मान क्या है?",
        options: ["10001", "10100", "10010", "11000"],
        answer: "10010",
        type: 'D→B',
        problem: '18'
    },
     {
        question: "बाइनरी '10001' का दशमलव मान क्या है?",
        options: ["9", "17", "16", "1"],
        answer: "17",
        type: 'B→D',
        problem: '10001'
    }
];

// Main Component
export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState('light');
  
  // Converter States
  const [binaryInput, setBinaryInput] = useState('');
  const [decimalOutput, setDecimalOutput] = useState('');
  const [binaryError, setBinaryError] = useState('');
  const [binaryExplanation, setBinaryExplanation] = useState<string[]>([]);

  const [decimalInput, setDecimalInput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [decimalError, setDecimalError] = useState('');
  const [decimalExplanation, setDecimalExplanation] = useState<string[]>([]);

  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // Test Zone States
  const [userName, setUserName] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');

    try {
        const storedHistory = localStorage.getItem('conversionHistory');
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    } catch (error) {
        console.error("Failed to parse history from localStorage", error);
        localStorage.removeItem('conversionHistory');
    }
  }, []);

  useEffect(() => {
      if(isMounted) {
          localStorage.setItem('conversionHistory', JSON.stringify(history));
      }
  }, [history, isMounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Converter Functions
  const addToHistory = (type: 'B→D' | 'D→B', input: string, output: string) => {
    if(!input || !output) return;
    const newRecord: ConversionRecord = { id: Date.now(), type, input, output };
    setHistory(prev => [newRecord, ...prev].slice(0, 20));
  };
  
  const clearHistory = () => {
    setHistory([]);
    toast({
        title: "History Cleared",
        description: "Your conversion history has been removed.",
    });
  }

  const handleBinaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^01]/g, '');
    setBinaryInput(value);
    setBinaryError('');
    setDecimalOutput('');
    setBinaryExplanation([]);
  };

  const convertBinaryToDecimal = () => {
    if (binaryInput === '') {
      setBinaryError('कृपया एक बाइनरी नंबर दर्ज करें।');
      setDecimalOutput('');
      return;
    }
    if (!/^[01]+$/.test(binaryInput)) {
      setBinaryError('अमान्य बाइनरी नंबर। केवल 0 और 1 की अनुमति है।');
      setDecimalOutput('');
      return;
    }
    setBinaryError('');
    const decimalValue = parseInt(binaryInput, 2).toString();
    setDecimalOutput(decimalValue);
    addToHistory('B→D', binaryInput, decimalValue);

    const explanationSteps: string[] = [];
    explanationSteps.push(`बाइनरी नंबर (${binaryInput}) को बदलने के लिए, प्रत्येक अंक को 2 की घात से गुणा करें, दाईं ओर से शुरू करते हुए (2^0 से)।`);
    
    const steps = binaryInput.split('').reverse().map((bit, index) => {
        return `${bit} × 2^${index} = ${bit} × ${Math.pow(2, index)} = ${parseInt(bit) * Math.pow(2, index)}`;
    }).reverse();
    explanationSteps.push(`गणना: ${steps.join('  +  ')}`);

    const sum = binaryInput.split('').reverse().reduce((acc, bit, index) => {
        return acc + parseInt(bit) * Math.pow(2, index);
    }, 0);
    explanationSteps.push(`परिणामों को जोड़ें: ${sum}`);
    explanationSteps.push(`तो, बाइनरी ${binaryInput} का दशमलव मान ${sum} है।`);
    setBinaryExplanation(explanationSteps);
  }

  const handleDecimalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setDecimalInput(value);
    setDecimalError('');
    setBinaryOutput('');
    setDecimalExplanation([]);
  };

  const convertDecimalToBinary = () => {
    if(decimalInput === '') {
      setDecimalError('कृपया एक दशमलव संख्या दर्ज करें।');
      setBinaryOutput('');
      return;
    }
    if (!/^\d+$/.test(decimalInput)) {
      setDecimalError('अमान्य दशमलव संख्या। केवल अंकों की अनुमति है।');
      setBinaryOutput('');
      return;
    }
    
    setDecimalError('');
    const intValue = parseInt(decimalInput, 10);
    const binaryValue = intValue.toString(2);
    setBinaryOutput(binaryValue);
    addToHistory('D→B', decimalInput, binaryValue);

    if (intValue === 0) {
      setDecimalExplanation([`दशमलव 0 बाइनरी में 0 है।`]);
      return;
    }

    const explanationSteps: string[] = [];
    explanationSteps.push(`दशमलव नंबर (${decimalInput}) को बाइनरी में बदलने के लिए, इसे 2 से तब तक भाग दें जब तक कि भागफल 0 न हो जाए, और प्रत्येक चरण में शेष को नोट करें।`);
    
    let num = intValue;
    let remainders: number[] = [];
    while(num > 0) {
      const remainder = num % 2;
      explanationSteps.push(`${num} ÷ 2 = ${Math.floor(num/2)} (शेष: ${remainder})`);
      remainders.push(remainder);
      num = Math.floor(num/2);
    }

    explanationSteps.push(`शेष को उल्टे क्रम में पढ़ें: ${remainders.reverse().join('')}`);
    explanationSteps.push(`तो, दशमलव ${decimalInput} का बाइनरी मान ${binaryValue} है।`);
    setDecimalExplanation(explanationSteps);
  }
  
  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        setCopied(id);
        toast({
          title: "Copied to clipboard!",
          description: `Value: ${text}`,
        });
        setTimeout(() => setCopied(null), 2000);
    });
  };

  // Test Zone Functions
  const handleStartQuiz = () => {
    if (userName.trim() === '') {
        toast({ title: "नाम आवश्यक है", description: "कृपया परीक्षण शुरू करने के लिए अपना नाम दर्ज करें।", variant: "destructive" });
        return;
    }
    setQuizStarted(true);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  const handleNextQuestion = () => {
    setShowAnswer(false);
    if (selectedAnswer === quizQuestions[currentQuestionIndex].answer) {
        setScore(prev => prev + 1);
    }

    setSelectedAnswer('');
    
    if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    } else {
        setQuizFinished(true);
    }
  };
  
  const handleAnswerSubmission = () => {
      if(!selectedAnswer) {
          toast({ title: "उत्तर चुनें", description: "कृपया आगे बढ़ने से पहले एक उत्तर चुनें।", variant: "destructive" });
          return;
      }
      setShowAnswer(true);
      // Wait for 2 seconds before moving to the next question
      setTimeout(handleNextQuestion, 2000);
  }

  const restartQuiz = () => {
      setQuizStarted(false);
      setQuizFinished(false);
      setUserName('');
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswer('');
      setShowAnswer(false);
  };

  const printCertificate = () => {
      window.print();
  }

  // Render Logic
  if (!isMounted) {
      return null;
  }
  
  if(quizFinished) {
      const finalScore = selectedAnswer === quizQuestions[currentQuestionIndex].answer ? score + 1 : score;
      const totalQuestions = quizQuestions.length;
      const percentage = (finalScore / totalQuestions) * 100;

      return (
          <div className="flex items-center justify-center min-h-screen bg-background p-4 print:p-0">
               <Card className="w-full max-w-3xl shadow-2xl print:shadow-none print:border-none">
                    <CardContent className="p-8 md:p-12" id="certificate">
                         <div className="text-center space-y-4 border-4 border-primary p-8 rounded-lg bg-background relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-full bg-primary/10 opacity-50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                              <Award className="h-20 w-20 mx-auto text-primary" />
                              <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">सफलता का प्रमाण पत्र</h1>
                              <p className="text-lg text-muted-foreground">यह प्रमाणित किया जाता है कि</p>
                              <h2 className="text-4xl md:text-5xl font-bold font-headline text-accent">{userName}</h2>
                              <p className="text-lg text-muted-foreground">ने सफलतापूर्वक बाइनरी-दशमलव रूपांतरण क्विज़ पूरा कर लिया है।</p>
                              <p className="text-2xl font-bold">आपका स्कोर: <span className="text-primary">{finalScore} / {totalQuestions} ({percentage.toFixed(0)}%)</span></p>
                              <p className="text-xs text-muted-foreground pt-4">जारी करने की तिथि: {new Date().toLocaleDateString('hi-IN')}</p>
                         </div>
                    </CardContent>
                    <CardFooter className="flex-col sm:flex-row justify-center gap-4 p-6 print:hidden">
                        <Button onClick={restartQuiz}>पुनः आरंभ करें</Button>
                        <Button variant="outline" onClick={printCertificate}><FileText className="mr-2"/>प्रमाणपत्र प्रिंट करें</Button>
                    </CardFooter>
                </Card>
          </div>
      )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary"><path d="M14.5 3.5C14.5 3.5 14.5 5.5 12 5.5C9.5 5.5 9.5 3.5 9.5 3.5M12 5.5V13.5M4 14H20M9.5 20.5C9.5 20.5 9.5 18.5 12 18.5C14.5 18.5 14.5 20.5 14.5 20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h1 className="text-2xl font-bold tracking-tight font-headline">Base Converter Pro</h1>
          </div>
          <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </header>
      <main className="flex-1 container py-8 md:py-12">
        <Tabs defaultValue="converter" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="converter">कनवर्टर</TabsTrigger>
                <TabsTrigger value="test">Test Zone</TabsTrigger>
            </TabsList>
            <TabsContent value="converter">
                 <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 grid gap-8 content-start">
                        <Card className="shadow-sm transition-shadow hover:shadow-md">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl tracking-wide">Binary to Decimal</CardTitle>
                                <CardDescription>Enter a binary number to see its decimal equivalent.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                <Label htmlFor="binary-input" className="text-sm font-medium">Binary Number</Label>
                                <Input id="binary-input" placeholder="e.g., 101101" value={binaryInput} onChange={handleBinaryChange} className={binaryError ? 'border-destructive focus-visible:ring-destructive' : ''} />
                                {binaryError && <p className="text-sm text-destructive">{binaryError}</p>}
                                </div>
                                <div className="flex items-center justify-center">
                                    <Button onClick={convertBinaryToDecimal}>कन्वर्ट करें</Button>
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="decimal-output" className="text-sm font-medium">Decimal Result</Label>
                                <div className="flex gap-2">
                                    <Input id="decimal-output" value={decimalOutput} readOnly placeholder="Result appears here" className="font-mono bg-muted/50" />
                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(decimalOutput, 'dec_out')} disabled={!decimalOutput}>
                                        {copied === 'dec_out' ? <ClipboardCheck className="h-4 w-4 text-primary" /> : <Clipboard className="h-4 w-4" />}
                                    </Button>
                                </div>
                                </div>
                            </CardContent>
                            {binaryExplanation.length > 0 && (
                                <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                                    <h3 className="font-semibold">तरीका (Method):</h3>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        {binaryExplanation.map((step, index) => <p key={index}>{step}</p>)}
                                    </div>
                                </CardFooter>
                            )}
                        </Card>

                        <Card className="shadow-sm transition-shadow hover:shadow-md">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl tracking-wide">Decimal to Binary</CardTitle>
                                <CardDescription>Enter a decimal number to see its binary equivalent.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                <Label htmlFor="decimal-input" className="text-sm font-medium">Decimal Number</Label>
                                <Input id="decimal-input" placeholder="e.g., 45" value={decimalInput} onChange={handleDecimalChange} className={decimalError ? 'border-destructive focus-visible:ring-destructive' : ''} />
                                {decimalError && <p className="text-sm text-destructive">{decimalError}</p>}
                                </div>
                                <div className="flex items-center justify-center">
                                    <Button onClick={convertDecimalToBinary}>कन्वर्ट करें</Button>
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="binary-output" className="text-sm font-medium">Binary Result</Label>
                                <div className="flex gap-2">
                                    <Input id="binary-output" value={binaryOutput} readOnly placeholder="Result appears here" className="font-mono bg-muted/50" />
                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(binaryOutput, 'bin_out')} disabled={!binaryOutput}>
                                        {copied === 'bin_out' ? <ClipboardCheck className="h-4 w-4 text-primary" /> : <Clipboard className="h-4 w-4" />}
                                    </Button>
                                </div>
                                </div>
                            </CardContent>
                            {decimalExplanation.length > 0 && (
                                <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                                    <h3 className="font-semibold">तरीका (Method):</h3>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        {decimalExplanation.map((step, index) => <p key={index}>{step}</p>)}
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </div>

                    <Card className="lg:col-span-1 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-headline text-2xl tracking-wide">History</CardTitle>
                        <Button variant="ghost" size="icon" onClick={clearHistory} disabled={history.length === 0}>
                            <Trash2 className="h-4 w-4 text-muted-foreground"/>
                            <span className="sr-only">Clear History</span>
                        </Button>
                        </CardHeader>
                        <CardContent>
                            {history.length > 0 ? (
                                <ScrollArea className="h-[460px] pr-4">
                                    <div className="space-y-4">
                                    {history.map((item) => (
                                        <div key={item.id} className="text-sm">
                                            <p className="font-medium">{item.type === 'B→D' ? 'Binary → Decimal' : 'Decimal → Binary'}</p>
                                            <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
                                                <span className="truncate">{item.input}</span>
                                                <ArrowRight className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{item.output}</span>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[460px] text-center text-muted-foreground/80 space-y-2">
                                    <HistoryIcon className="h-10 w-10 mb-2"/>
                                    <p className="font-medium">No conversions yet</p>
                                    <p className="text-xs">Your conversion history will show up here.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="test">
                <Card className="max-w-2xl mx-auto shadow-lg">
                    <CardHeader className="text-center">
                        <Award className="h-12 w-12 mx-auto text-primary" />
                        <CardTitle className="font-headline text-3xl">ज्ञान की जांच करें</CardTitle>
                        <CardDescription>देखें कि आप बाइनरी और दशमलव रूपांतरणों को कितनी अच्छी तरह समझते हैं।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!quizStarted ? (
                            <div className="space-y-6 flex flex-col items-center">
                                <div className="space-y-2 text-center w-full max-w-sm">
                                    <Label htmlFor="user-name" className="text-lg">अपना नाम दर्ज करें</Label>
                                    <Input 
                                        id="user-name" 
                                        placeholder="उदाहरण, राम कुमार" 
                                        value={userName} 
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="text-center text-lg h-12"
                                    />
                                </div>
                                <Button size="lg" onClick={handleStartQuiz}>क्विज़ शुरू करें</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <p className="text-muted-foreground">प्रश्न {currentQuestionIndex + 1} / {quizQuestions.length}</p>
                                    <h3 className="font-headline text-2xl mt-2">{quizQuestions[currentQuestionIndex].question}</h3>
                                </div>
                                <RadioGroup 
                                    value={selectedAnswer} 
                                    onValueChange={setSelectedAnswer}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg"
                                >
                                    {quizQuestions[currentQuestionIndex].options.map((option) => {
                                        const isCorrect = option === quizQuestions[currentQuestionIndex].answer;
                                        const isSelected = option === selectedAnswer;
                                        let itemClass = "";
                                        if(showAnswer && isCorrect) itemClass = "bg-green-100 dark:bg-green-900 border-green-500";
                                        else if (showAnswer && isSelected && !isCorrect) itemClass = "bg-red-100 dark:bg-red-900 border-red-500";
                                        
                                        return (
                                            <Label 
                                                key={option} 
                                                htmlFor={option}
                                                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${itemClass} ${isSelected ? 'border-primary' : ''}`}
                                            >
                                                <RadioGroupItem value={option} id={option} className="h-6 w-6" />
                                                <span>{option}</span>
                                            </Label>
                                        );
                                    })}
                                </RadioGroup>
                                <div className="flex justify-center">
                                    <Button size="lg" onClick={handleAnswerSubmission} disabled={showAnswer}>
                                        {showAnswer ? 'अगला...' : 'उत्तर सबमिट करें'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

    