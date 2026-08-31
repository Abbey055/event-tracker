import { Head, router } from '@inertiajs/react';
import { Users as UsersIcon, Shield, User as UserIcon, Trash2, UserX, UserCheck } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';


interface User {

    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    created_at: string;
    status?: 'active' | 'suspended';

}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;

    };

}

export default function Users({ users }: Props) {
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const handleRoleChange = (userId: number, newRole: string) => {


        router.put(`/admin/users/${userId}/role`, { role: newRole });
    };

    const handleDelete = (user: User) => {
        setDeleteUser(user);
    };
    const confirmDelete = () => {
        if (deleteUser) {
            router.delete('/admin/users/' + deleteUser.id, {
                onSuccess: () => setDeleteUser(null),
            });
        }

    };

    const toggleStatus = (user: User) => {
        router.patch('/admin/users/' + user.id + '/status');
    };

    return (
        <>

            <Head title="User Management" />

            <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items - center justify-betwee">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <UsersIcon className="h-8 w-8" />

                            User Management


                        </h1>
                        <p className=" text-meted-foreground ">Manage user roles and permissions  </p>
                    </div>

                </div>



                <Card>
                    <CardHeader >
                        <CardTitle>Our Users</CardTitle>
                        <CardDescription> View and Manage user roles in the system</CardDescription>

                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>UserName</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right"> Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell >{user.email}</TableCell>
                                        <TableCell>
                                            <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)
                                            }
                                            >

                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="user">
                                                        <div className="flex items-center gap-2">
                                                            <UserIcon className="h-4 w-4" />
                                                            User

                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="admin">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-4 w-4" />
                                                            Admin
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>

                                            </Select>

                                        </TableCell>

                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString('en-GB')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === 'suspended' ? 'destructive' : 'secondary'}>
                                                {user.status ?? 'active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" className="mr-2" onClick={() => toggleStatus(user)}>
                                                {user.status === 'suspended' ? <UserCheck className="mr-1 h-4 w-4" /> : <UserX className="mr-1 h-4 w-4" />}
                                                {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(user)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>

                                        </TableCell>

                                    </TableRow>

                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={deleteUser !== null} onOpenChange={() => setDeleteUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure about this?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {deleteUser?.name}'s account. You cannot undo'

                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </>
    );
}















