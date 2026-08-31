import { Link, usePage} from '@inertiajs/react';
import { Bell, Calendar, LayoutGrid, ScanLine, Ticket, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';


export function AppSidebar() {
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';
    const dashboardUrl = dashboard();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        ...(isAdmin
            ? [
                  {
                      title: 'Tickets',
                      href: '/admin/tickets',
                      icon: Ticket,
                  },
                  {
                      title: 'Users',
                      href: '/admin/users', 
                      icon: Users,
                  },

                  {


                    title : 'Events',
                    href : '/admin/events',
                    icon : Calendar,
                  },

                   {


                    title : 'Scanner',
                    href : '/admin/scanner',
                    icon : ScanLine,
                  },




              ]:
              [

                {
                    title : 'Discover Events',
                    href : '/tickets',
                    icon : Calendar,
                  },
                  {
                    title : 'My Tickets',
                    href : '/tickets#my-tickets',
                    icon : Ticket,
                  },
                  {
                    title : 'Notifications',
                    href : '/tickets#updates',
                    icon : Bell,
                  },
                


              ]
    
        )
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
