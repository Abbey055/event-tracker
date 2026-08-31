import { Head, router } from '@inertiajs/react';
import { Ban, CheckCircle2, Ticket as TicketIcon, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Ticket {
    id: number;
    barcode: string;
    status: 'issued' | 'checked_in' | 'cancelled' | 'refunded';
    price: string | number;
    event?: { name: string };
    user?: { name: string; email: string };
}

interface Props {
    tickets: { data: Ticket[]; current_page: number; last_page: number };
}

const statusClass: Record<Ticket['status'], string> = {
    issued: 'bg-blue-100 text-blue-800',
    checked_in: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-amber-100 text-amber-800',
};

export default function AdminTickets({ tickets }: Props) {
    const updateStatus = (ticketId: number, status: Ticket['status']) => {
        router.patch('/admin/tickets/' + ticketId + '/status', { status });
    };

    return (
        <>
            <Head title="Ticket Management" />
            <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-4 sm:px-6 lg:px-8">
                <div>
                    <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                        <TicketIcon className="h-8 w-8" /> Ticket Management
                    </h1>
                    <p className="text-muted-foreground">Review issued tickets, attendance, and ticket status.</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Issued tickets</CardTitle>
                        <CardDescription>Validate, cancel, or refund tickets when necessary.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Barcode</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Attendee</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.data.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-mono text-xs">{ticket.barcode}</TableCell>
                                        <TableCell>{ticket.event?.name ?? 'Deleted event'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <UserRound className="h-4 w-4 text-muted-foreground" />
                                                <span>{ticket.user?.name ?? ticket.user?.email ?? 'Unknown user'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{Number(ticket.price).toLocaleString()} UGX</TableCell>
                                        <TableCell>
                                            <Badge className={statusClass[ticket.status] ?? statusClass.issued}>
                                                {ticket.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="space-x-2 text-right">
                                            {ticket.status === 'issued' && (
                                                <Button size="sm" onClick={() => updateStatus(ticket.id, 'checked_in')}>
                                                    <CheckCircle2 className="mr-1 h-4 w-4" /> Check in
                                                </Button>
                                            )}
                                            {ticket.status !== 'cancelled' && ticket.status !== 'refunded' && (
                                                <Button size="sm" variant="destructive" onClick={() => updateStatus(ticket.id, 'cancelled')}>
                                                    <Ban className="mr-1 h-4 w-4" /> Cancel
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
