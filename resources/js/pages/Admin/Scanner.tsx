import { Head } from '@inertiajs/react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    CheckCircle2,
    XCircle,
    Calendar,
    User,
    Ticket as TicketIcon,
    ScanLine,
    Loader2,
    RotateCcw,
    Upload,
    Image as ImageIcon,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface Event {
    id: number;
    name: string;
    description: string;
    event_date: string;
}

export interface UserInfo {
    id: number;
    name: string;
    email: string;
}

export interface Ticket {
    id: number;
    barcode: string;
    is_verified: boolean;
    verified_at: string | null;
    created_at: string;
    event: Event;
    user: UserInfo;
}

export interface VerifyResponse {
    ticket: Ticket | null;
    message: string;
}

export default function Scanner() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [ticketData, setTicketData] = useState<Ticket | null>(null);
    const [message, setMessage] = useState('');
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scanInProgressRef = useRef(false);

    const onScanFailure = () => {
        // The scanner calls this while no QR code is detected; no UI error is needed.
    };

    const onScanSuccess = async (decodedText: string) => {
        if (scanInProgressRef.current) {
            return;
        }

        scanInProgressRef.current = true;
        setScanResult(decodedText);

        if (scannerRef.current) {
            try {
                await scannerRef.current.clear();
            } catch (error) {
                console.warn('Could not clear the main scanner.', error);
            } finally {
                scannerRef.current = null;
            }
        }

        await verifyTicket(decodedText);
    };

    const verifyTicket = async (scannedContent: string) => {
        setVerificationStatus('loading');
        setMessage('');
        setTicketData(null);

        let barcode = scannedContent;

        try {
            if (scannedContent.startsWith('http')) {
                const url = new URL(scannedContent);
                const potentialBarcode = url.pathname.split('/').filter(Boolean).pop();

                if (potentialBarcode) {
                    barcode = potentialBarcode;
                }
            }
        } catch (error) {
            console.warn('Could not parse scanned content as a URL; using raw content.', error);
        }

        try {
            const response = await axios.put<VerifyResponse>(`/admin/apiVerify/${encodeURIComponent(barcode)}`);
            const data = response.data;

            setTicketData(data.ticket);
            setMessage(data.message);
            setVerificationStatus(data.ticket ? 'success' : 'error');
        } catch (error) {
            console.error('Ticket verification failed:', error);
            setTicketData(null);
            setMessage('Error connecting to verification server.');
            setVerificationStatus('error');
        }
    };

    const triggerFileUpload = () => {
        if (!scanInProgressRef.current && verificationStatus === 'idle') {
            fileInputRef.current?.click();
        }
    };

    const resetScanner = () => {
        scanInProgressRef.current = false;
        setScanResult(null);
        setTicketData(null);
        setMessage('');
        setFileError(null);
        setVerificationStatus('idle');
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileError(null);

        if (!file.type.startsWith('image/')) {
            setFileError('Please upload an image file (PNG or JPG).');
            return;
        }

        try {
            setVerificationStatus('loading');

            if (scannerRef.current) {
                try {
                    await scannerRef.current.clear();
                    scannerRef.current = null;
                } catch (error) {
                    console.warn('Could not clear the main scanner.', error);
                }
            }

            const hiddenReaderId = `reader-hidden-file-${Date.now()}`;
            const hiddenReaderElement = document.createElement('div');
            hiddenReaderElement.id = hiddenReaderId;
            hiddenReaderElement.style.display = 'none';
            document.body.appendChild(hiddenReaderElement);

            const fileScanner = new Html5Qrcode(hiddenReaderId, false);

            try {
                const decodedText = await fileScanner.scanFile(file, true);
                await onScanSuccess(decodedText);
            } finally {
                try {
                    fileScanner.clear();
                } catch {
                    // The image scan has already finished; cleanup can safely continue.
                }
                hiddenReaderElement.parentNode?.removeChild(hiddenReaderElement);
            }
        } catch (error: unknown) {
            const isFileDecodeError =
                error !== null &&
                typeof error === 'object' &&
                'type' in error &&
                (error as { type?: unknown }).type === 'error';

            if (isFileDecodeError) {
                console.warn('File scan error: Image failed to load or decode.');
                setFileError('Could not load this image. It may be corrupted or use an unsupported format.');
            } else {
                console.error('File scan error:', error);
                setFileError('Could not find a QR code in this image. Please try a clearer image.');
            }

            setVerificationStatus('error');
            setTicketData(null);
        } finally {
            event.target.value = '';
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    useEffect(() => {
        if (verificationStatus === 'idle' && !scannerRef.current) {
            const scanner = new Html5QrcodeScanner(
                'reader',
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true,
                },
                false,
            );

            scannerRef.current = scanner;
            scanner.render(onScanSuccess, onScanFailure);
        }

        return () => {
            if (scannerRef.current) {
                void scannerRef.current.clear().catch(() => undefined);
                scannerRef.current = null;
            }
        };
    }, [verificationStatus, scanResult]);

    return (
        <>
            <Head title="Scanner" />
            <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                            <ScanLine className="h-8 w-8" /> Ticket Scanner
                        </h1>
                        <p className="mt-2 text-muted-foreground">Scan tickets to verify attendee entry</p>
                    </div>
                    {verificationStatus !== 'idle' && (
                        <Button type="button" variant="outline" onClick={resetScanner}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Scan Next Ticket
                        </Button>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className={verificationStatus !== 'idle' ? 'pointer-events-none opacity-50' : ''}>
                        <CardHeader>
                            <CardTitle>Camera Feed</CardTitle>
                            <CardDescription>Position the QR code within the frame.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div id="reader" className="w-full overflow-hidden rounded-lg bg-black" />
                            <div className="mt-4 flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
                                {verificationStatus === 'idle' ? 'Ready to scan...' : 'Scanner paused'}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        <div className="mt-2 flex w-full justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={triggerFileUpload}
                                disabled={verificationStatus !== 'idle'}
                                className="w-full max-w-xs"
                            >
                                <Upload className="mr-2 h-4 w-4" /> Upload Ticket Image
                            </Button>
                        </div>
                            {fileError && <p className="mt-4 text-sm text-destructive">{fileError}</p>}
                            {verificationStatus === 'loading' && (
                                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying ticket...
                                </p>
                            )}
                            {message && <p className="mt-4 text-sm">{message}</p>}
                        </CardContent>
                    </Card>

                    <Card className="flex h-full flex-col">
                        <CardHeader>
                            <CardTitle>Verification Result</CardTitle>
                            <CardDescription>Scan a ticket to see details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {verificationStatus === 'idle' && (
                                <div className="flex h-full min-h-48 flex-col items-center justify-center text-muted-foreground">
                                    <ScanLine className="mb-4 h-16 w-16 opacity-20" />
                                    <p>Waiting for scan...</p>
                                </div>
                            )}

                            {verificationStatus === 'loading' && (
                                <div className="flex h-full min-h-48 flex-col items-center justify-center p-8">
                                    <Loader2 className="mb-4 h-16 w-16 animate-spin text-primary" />
                                    <p className="text-lg font-medium">Verifying ticket...</p>
                                </div>
                            )}

                            {verificationStatus === 'error' && (
                                <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                        <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Verification Failed</h3>
                                        <p className="mt-2 text-muted-foreground">{message}</p>
                                    </div>
                                    <Button type="button" onClick={resetScanner} variant="outline" className="mt-2">
                                        Try Again
                                    </Button>
                                </div>
                            )}

                            {verificationStatus === 'success' && ticketData && (
                                <div className="animate-in fade-in space-y-6 duration-500">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-green-600 dark:text-green-400">Ticket Verified</h3>
                                        <p className="text-sm text-muted-foreground">{message}</p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                                            <div className="flex items-center gap-3">
                                                <TicketIcon className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Barcode</p>
                                                    <p className="font-mono text-sm font-bold">{ticketData.barcode}</p>
                                                </div>
                                            </div>
                                            <Badge variant={ticketData.is_verified ? 'default' : 'secondary'} className={ticketData.is_verified ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                Verified
                                            </Badge>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="rounded-lg bg-muted p-3">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Event</span>
                                                </div>
                                                <h4 className="font-semibold">{ticketData.event.name}</h4>
                                                <p className="mt-1 text-sm text-muted-foreground">{new Date(ticketData.event.event_date).toLocaleString()}</p>
                                            </div>

                                            <div className="rounded-lg bg-muted p-3">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Attendee</span>
                                                </div>
                                                <h4 className="font-semibold">{ticketData.user.name}</h4>
                                                <p className="mt-1 text-sm text-muted-foreground">{ticketData.user.email}</p>
                                            </div>
                                        </div>

                                        {ticketData.verified_at && (
                                            <p className="text-sm text-muted-foreground">
                                                First checked in: {new Date(ticketData.verified_at).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
