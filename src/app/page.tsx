"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Clipboard, ClipboardCheck, ArrowRight, History as HistoryIcon, Trash2 } from "lucide-react";

type ConversionRecord = {
  id: number;
  type: 'B→D' | 'D→B';
  input: string;
  output: string;
};

export default function Home() {
  const [binaryInput, setBinaryInput] = useState('');
  const [decimalOutput, setDecimalOutput] = useState('');
  const [binaryError, setBinaryError] = useState('');
  const [binaryExplanation, setBinaryExplanation] = useState<string[]>([]);

  const [decimalInput, setDecimalInput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [decimalError, setDecimalError] = useState('');
  const [decimalExplanation, setDecimalExplanation] = useState<string[]>([]);

  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState('light');
  
  const [copied, setCopied] = useState<string | null>(null);

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

  if (!isMounted) {
      return null;
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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
      </main>
    </div>
  );
}
