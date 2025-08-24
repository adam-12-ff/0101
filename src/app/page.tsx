"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const [decimalInput, setDecimalInput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [decimalError, setDecimalError] = useState('');

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
    const value = e.target.value;
    setBinaryInput(value);

    if (value === '') {
      setDecimalOutput('');
      setBinaryError('');
      return;
    }

    if (!/^[01]+$/.test(value)) {
      setBinaryError('Invalid binary number. Only 0 and 1 are allowed.');
      setDecimalOutput('');
    } else {
      setBinaryError('');
      const decimalValue = parseInt(value, 2).toString();
      setDecimalOutput(decimalValue);
      addToHistory('B→D', value, decimalValue);
    }
  };

  const handleDecimalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDecimalInput(value);

    if (value === '') {
      setBinaryOutput('');
      setDecimalError('');
      return;
    }
    
    if (!/^\d+$/.test(value)) {
      setDecimalError('Invalid decimal number. Only digits are allowed.');
      setBinaryOutput('');
    } else {
      setDecimalError('');
      const binaryValue = parseInt(value, 10).toString(2);
      setBinaryOutput(binaryValue);
      addToHistory('D→B', value, binaryValue);
    }
  };
  
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
                  <Input id="binary-input" placeholder="e.g., 101101" value={binaryInput} onChange={handleBinaryChange} className={binaryError ? 'border-destructive focus-visible:ring-destructive' : ''} inputMode="numeric" />
                  {binaryError && <p className="text-sm text-destructive">{binaryError}</p>}
                </div>
                <div className="flex items-center justify-center text-muted-foreground">
                    <ArrowRight className="h-5 w-5"/>
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
            </Card>

            <Card className="shadow-sm transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-2xl tracking-wide">Decimal to Binary</CardTitle>
                <CardDescription>Enter a decimal number to see its binary equivalent.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="decimal-input" className="text-sm font-medium">Decimal Number</Label>
                  <Input id="decimal-input" placeholder="e.g., 45" value={decimalInput} onChange={handleDecimalChange} className={decimalError ? 'border-destructive focus-visible:ring-destructive' : ''} type="text" inputMode="numeric"/>
                  {decimalError && <p className="text-sm text-destructive">{decimalError}</p>}
                </div>
                <div className="flex items-center justify-center text-muted-foreground">
                    <ArrowRight className="h-5 w-5"/>
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
