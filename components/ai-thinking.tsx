"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Brain, 
    Zap, 
    Wrench, 
    Eye, 
    CheckCircle, 
    AlertCircle, 
    Loader2,
    X,
    Play,
    Pause
} from "lucide-react";

interface ThinkingEvent {
    type: 'start' | 'thinking' | 'complete' | 'error';
    step?: string;
    content?: string;
    message?: string;
    timestamp: string;
    success?: boolean;
}

interface AIThinkingProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    onComplete: (success: boolean) => void;
}

export function AIThinking({ isOpen, onClose, url, onComplete }: AIThinkingProps) {
    const [events, setEvents] = useState<ThinkingEvent[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);
    const onCompleteRef = useRef(onComplete);
    const iterationCount = events.filter(e => (e.step || '').includes('Iteration')).length;
    const thinkCount = events.filter(e => (e.step || '').includes('🧠 THINK')).length;
    const toolCount = events.filter(e => (e.step || '').includes('🛠️ TOOL')).length;
    const observeCount = events.filter(e => (e.step || '').includes('📤 OBSERVE')).length;
    const errorCount = events.filter(e => (e.step || '').includes('❌') || e.type === 'error').length;
    const currentStep = events.length > 0 ? (events[events.length - 1].step || events[events.length - 1].type) : undefined;

    // Keep a stable reference to onComplete to avoid re-running effect
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    const getStepIcon = (step: string) => {
        switch (step) {
            case '🤖 AI Driver':
                return <Zap className="h-4 w-4 text-blue-500" />;
            case '🔥 START':
                return <Play className="h-4 w-4 text-green-500" />;
            case '🧠 THINK':
                return <Brain className="h-4 w-4 text-purple-500" />;
            case '🛠️ TOOL':
                return <Wrench className="h-4 w-4 text-orange-500" />;
            case '📤 OBSERVE':
                return <Eye className="h-4 w-4 text-cyan-500" />;
            case '✅ OUTPUT':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case '❌ Tool Error':
            case '❌ JSON Parse Error':
            case '❌ No tools called':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case '🔄 Iteration':
                return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
            default:
                return <Brain className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStepColor = (step: string) => {
        if (step.includes('❌')) return 'destructive';
        if (step.includes('✅')) return 'default';
        if (step.includes('🔄')) return 'secondary';
        return 'outline';
    };

    const startStreaming = async () => {
        if (isStreaming) return;
        
        setIsStreaming(true);
        setEvents([]);
        
        try {
            const controller = new AbortController();
            const response = await fetch('/api/clone/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
                signal: controller.signal
            });

            if (!response.ok) {
                const message = `Stream failed: ${response.status} ${response.statusText}`;
                setEvents(prev => [...prev, { type: 'error', message, timestamp: new Date().toISOString() }]);
                return;
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            setEvents(prev => [...prev, data]);
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }
        } catch (error) {
            setEvents(prev => [...prev, {
                type: 'error',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsStreaming(false);
        }
    };

    useEffect(() => {
        if (isOpen && !isStreaming && url && url.trim()) {
            startStreaming();
        }
    }, [isOpen, url]);

    useEffect(() => {
        const lastEvent = events[events.length - 1];
        if (lastEvent?.type === 'complete') {
            onCompleteRef.current(lastEvent.success || false);
        }
    }, [events]);

    useEffect(() => {
        if (isPaused) return;
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [events, isPaused]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center space-x-2">
                        <Brain className="h-6 w-6 text-purple-500" />
                        <CardTitle>AI Thinking Process</CardTitle>
                        {isStreaming && (
                            <>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Live
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1">Iter: {iterationCount}</Badge>
                                <Badge variant="outline" className="flex items-center gap-1">Think: {thinkCount}</Badge>
                                <Badge variant="outline" className="flex items-center gap-1">Tool: {toolCount}</Badge>
                                <Badge variant="outline" className="flex items-center gap-1">Observe: {observeCount}</Badge>
                                {errorCount > 0 && (
                                    <Badge variant="destructive" className="flex items-center gap-1">Errors: {errorCount}</Badge>
                                )}
                                {currentStep && (
                                    <Badge variant="secondary" className="flex items-center gap-1">Current: {currentStep}</Badge>
                                )}
                                {isPaused && (
                                    <Badge variant="outline" className="flex items-center gap-1">Paused</Badge>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPaused(!isPaused)}
                            disabled={!isStreaming}
                        >
                            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-hidden">
                    <div className="text-sm text-muted-foreground mb-4">
                        Cloning: <span className="font-mono">{url}</span>
                    </div>
                    
                    <ScrollArea className="h-[400px] w-full">
                        <div className="space-y-3 h-[400px] overflow-auto" ref={listRef}>
                            {events.map((event, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                                    <div className="flex-shrink-0 mt-1">
                                        {getStepIcon(event.step || event.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            {event.step && (
                                                <Badge variant={getStepColor(event.step)} className="text-xs">
                                                    {event.step}
                                                </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {(() => { try { const d = event.timestamp ? new Date(event.timestamp) : null; return d && isFinite(d.getTime()) ? d.toLocaleTimeString() : ''; } catch { return ''; } })()}
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed">
                                            {event.content || event.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            
                            {isStreaming && (
                                <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    <span className="text-sm text-muted-foreground">
                                        AI is thinking...
                                    </span>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
