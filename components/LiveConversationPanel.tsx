import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import type { LiveServerMessage } from "@google/genai";
import { connectLiveSession, createPcmBlob, decodePcmAudioData, decode } from '../services/geminiService';
import { SystemStatusContext } from '../contexts/SystemStatusProvider';
import { Microphone, Bot, User } from './common/Icons';
import Button from './common/Button';
import Spinner from './common/Spinner';
import AudioVisualizer from './common/AudioVisualizer';

type ConnectionState = "idle" | "connecting" | "connected" | "closing" | "closed" | "error";

interface TranscriptEntry {
    id: number;
    sender: 'user' | 'bot';
    text: string;
}

const LiveConversationPanel: React.FC = () => {
    const { notify } = useContext(SystemStatusContext);
    const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    // Use 'any' for session to avoid import failures if LiveSession type is not exported in the specific version
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
    const audioInfrastructureRef = useRef<{
        inputAudioContext: AudioContext,
        outputAudioContext: AudioContext,
        stream: MediaStream,
        sources: Set<AudioBufferSourceNode>,
    } | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [transcript]);

    const stopConversation = useCallback(() => {
        if (!audioInfrastructureRef.current || connectionState === 'closing' || connectionState === 'closed') return;
        setConnectionState("closing");
        notify("COMM_LINK_TERMINATED", "warning");
        
        audioWorkletNodeRef.current?.disconnect();
        audioInfrastructureRef.current.stream.getTracks().forEach(track => track.stop());
        
        sessionPromiseRef.current?.then((session: any) => session.close());
        sessionPromiseRef.current = null;
        
        audioInfrastructureRef.current.sources.forEach(source => source.stop());
        
        audioInfrastructureRef.current.inputAudioContext.close();
        audioInfrastructureRef.current.outputAudioContext.close();
        audioInfrastructureRef.current = null;
        setMediaStream(null);

        setConnectionState("closed");
    }, [connectionState, notify]);

    useEffect(() => {
        const handleHalt = () => {
          stopConversation();
          setTranscript([]);
        };
        window.addEventListener('emergency-halt', handleHalt);
        return () => window.removeEventListener('emergency-halt', handleHalt);
    }, [stopConversation]);


    const startConversation = async () => {
        if (connectionState === "connecting" || connectionState === "connected") return;
        setConnectionState("connecting");
        notify("IGNITING_COMM_LINK", "info");
        setTranscript([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMediaStream(stream);
            
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            await inputAudioContext.audioWorklet.addModule('audio-processor.js');
            const workletNode = new AudioWorkletNode(inputAudioContext, 'audio-processor');
            const source = inputAudioContext.createMediaStreamSource(stream);
            source.connect(workletNode);
            workletNode.connect(inputAudioContext.destination);

            audioWorkletNodeRef.current = workletNode;

            workletNode.port.onmessage = (event) => {
                const pcmBlob = createPcmBlob(event.data);
                sessionPromiseRef.current?.then((session: any) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };

            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();
            
            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            sessionPromiseRef.current = connectLiveSession({
                onopen: () => {
                    setConnectionState("connected");
                    notify("SATELLITE_LINK_ESTABLISHED", "success");
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.outputTranscription) {
                        const text = message.serverContent.outputTranscription.text;
                        currentOutputTranscription += text;
                        setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            if (last?.sender === 'bot') {
                                return [...prev.slice(0, -1), { ...last, text: currentOutputTranscription }];
                            }
                            return [...prev, { id: Date.now(), sender: 'bot', text: currentOutputTranscription }];
                        });
                    } else if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        currentInputTranscription += text;
                         setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            if (last?.sender === 'user') {
                                return [...prev.slice(0, -1), { ...last, text: currentInputTranscription }];
                            }
                            return [...prev, { id: Date.now(), sender: 'user', text: currentInputTranscription }];
                        });
                    }

                    if (message.serverContent?.turnComplete) {
                        currentInputTranscription = '';
                        currentOutputTranscription = '';
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                        const audioBytes = decode(base64Audio);
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        const audioBuffer = await decodePcmAudioData(audioBytes, outputAudioContext, 24000, 1);
                        const sourceNode = outputAudioContext.createBufferSource();
                        sourceNode.buffer = audioBuffer;
                        sourceNode.connect(outputAudioContext.destination);
                        sourceNode.addEventListener('ended', () => {
                            sources.delete(sourceNode);
                        });
                        sourceNode.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                        sources.add(sourceNode);
                    }
                    
                    const interrupted = message.serverContent?.interrupted;
                    if (interrupted) {
                      for (const source of sources.values()) {
                        source.stop();
                        sources.delete(source);
                      }
                      nextStartTime = 0;
                    }
                },
                onerror: (e) => {
                    console.error("Live session error:", e);
                    notify(`COMM_LINK_ERROR: ${e.type}`, "error");
                    setConnectionState("error");
                    stopConversation();
                },
                onclose: () => {
                    stopConversation();
                },
            });

            audioInfrastructureRef.current = {
                inputAudioContext,
                outputAudioContext,
                stream,
                sources,
            };

        } catch (error) {
            console.error("Failed to start conversation:", error);
            notify(`MICROPHONE_ACCESS_DENIED`, "error");
            setConnectionState("error");
        }
    };
    
    useEffect(() => {
        return () => {
            stopConversation();
        }
    }, [stopConversation]);

    const renderStatus = () => {
        switch (connectionState) {
            case 'idle':
            case 'closed':
                return <span className="text-gray-500 font-mono tracking-widest uppercase text-xs">// Comm_Link_Idle</span>;
            case 'connecting':
                return <Spinner text="Establishing Satellite Link..." />;
            case 'connected':
                return (
                    <div className="flex flex-col items-center gap-3 w-full">
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_#dc2626]"></div>
                            <span className="text-red-500 font-black tracking-[0.2em] uppercase text-sm animate-pulse">Live Transmission</span>
                        </div>
                        {mediaStream && <AudioVisualizer stream={mediaStream} />}
                    </div>
                );
            case 'closing':
                return <span className="text-orange-500 font-mono uppercase text-xs animate-pulse">Terminating Signal...</span>;
            case 'error':
                return <span className="text-red-600 font-black border-2 border-red-600 p-2 bg-red-600/10 uppercase text-xs">!! Critical_Signal_Loss !!</span>;
            default:
                return null;
        }
    }

    return (
        <div className="max-w-5xl mx-auto flex flex-col h-full control-panel p-6">
            <div className="flex justify-between items-center mb-6 border-b-4 border-industrial-gray pb-4">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">// VOIP_COMM_LINK_07 _</h3>
            </div>
            
            <div className="bg-asphalt border-4 border-industrial-gray p-8 flex-1 flex flex-col relative">
                <div className="rivet absolute top-2 left-2"></div>
                <div className="rivet absolute top-2 right-2"></div>
                <div className="rivet absolute bottom-2 left-2"></div>
                <div className="rivet absolute bottom-2 right-2"></div>
                
                <div className="flex-1 mb-8 overflow-y-auto pr-4 space-y-8 scrollbar-thin">
                    {transcript.map((entry) => (
                        <div key={entry.id} className={`flex items-start gap-4 ${entry.sender === 'user' ? 'justify-end' : ''}`}>
                            {entry.sender === 'bot' && (
                                <div className="p-2 bg-cyan-400 border-2 border-black rounded-sm shadow-lg">
                                    <Bot className="h-5 w-5 text-black" />
                                </div>
                            )}
                            <div className={`relative max-w-lg p-5 border-2 ${
                                entry.sender === 'user' 
                                    ? 'bg-industrial-gray border-cyan-400 text-white' 
                                    : 'bg-asphalt border-industrial-gray text-cyan-400 font-mono'
                            }`}>
                                <p className="leading-relaxed font-bold tracking-tight uppercase text-sm">{entry.text}</p>
                            </div>
                            {entry.sender === 'user' && (
                                <div className="p-2 bg-white border-2 border-black rounded-sm shadow-lg">
                                    <User className="h-5 w-5 text-black" />
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={transcriptEndRef} />
                     {transcript.length === 0 && connectionState === 'connected' && (
                        <div className="text-center text-cyan-400 pt-20 animate-pulse font-mono uppercase tracking-[0.2em]">
                            <p className="text-lg font-black">(( TRANSMITTING ))</p>
                            <p className="text-xs mt-2 text-gray-500">Awaiting_Voice_Data_Stream...</p>
                        </div>
                    )}
                    {transcript.length === 0 && connectionState !== 'connected' && (
                        <div className="text-center text-gray-800 pt-20">
                            <Microphone className="h-20 w-20 mx-auto opacity-10 mb-4" />
                            <p className="font-mono uppercase tracking-widest text-sm">Initiate_Comm_Link_To_Begin_Log</p>
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 pt-6 border-t-4 border-industrial-gray flex flex-col items-center">
                    <div className="h-20 mb-6 flex items-center justify-center w-full">{renderStatus()}</div>
                    {connectionState !== 'connected' && connectionState !== 'connecting' ? (
                        <Button 
                            onClick={startConversation} 
                            disabled={connectionState === 'closing'}
                            className="w-full max-w-sm !py-6 !text-2xl"
                        >
                            <Microphone className="h-8 w-8 mr-4"/>
                            IGNITE COMM LINK
                        </Button>
                    ) : (
                        <Button 
                            onClick={stopConversation} 
                            variant="danger"
                            className="w-full max-w-sm !py-6 !text-2xl"
                        >
                            <div className="h-3 w-3 bg-white rounded-full mr-4 animate-ping"></div>
                            CEASE TRANSMISSION
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveConversationPanel;