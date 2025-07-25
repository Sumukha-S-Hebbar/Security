
import { useMemo } from 'react';
import { alerts, guards, sites } from '@/lib/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone } from 'lucide-react';
import type { Guard } from '@/types';
import { SitesMap } from './_components/sites-map';
import { AnalyticsDashboard } from './_components/analytics-dashboard';

const LOGGED_IN_SUPERVISOR_ID = 'PO01'; // Simulate logged-in Patrolling Officer

export default function HomePage() {
  const supervisorSites = useMemo(() => sites.filter(s => s.patrollingOfficerId === LOGGED_IN_SUPERVISOR_ID), []);
  const supervisorSiteNames = useMemo(() => new Set(supervisorSites.map(s => s.name)), [supervisorSites]);
  const supervisorGuards = useMemo(() => guards.filter(g => supervisorSiteNames.has(g.site)), [supervisorSiteNames]);
  const supervisorAlerts = useMemo(() => alerts.filter(a => supervisorSiteNames.has(a.site)), [supervisorSiteNames]);

  const activeEmergencies = supervisorAlerts.filter(
    (alert) => alert.type === 'Emergency' && alert.status === 'Active'
  );

  const getGuardByName = (name: string): Guard | undefined => {
    return supervisorGuards.find((g) => g.name === name);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Home Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, Patrolling Officer. Here's what's happening.
        </p>
      </div>

      <AnalyticsDashboard guards={supervisorGuards} sites={supervisorSites} />

      <Card className="border-destructive bg-destructive/10">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          <CardTitle>Current Emergency Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {activeEmergencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmergencies.map((alert) => {
                  const guardDetails = getGuardByName(alert.guard);
                  return (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        {alert.site}
                      </TableCell>
                      <TableCell>{alert.guard}</TableCell>
                      <TableCell>{alert.date}</TableCell>
                      <TableCell>
                        {guardDetails ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={`tel:${guardDetails.phone}`}>
                              <Phone className="mr-2 h-4 w-4" />
                              Contact Guard
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No active emergency calls. All systems are normal.
            </p>
          )}
        </CardContent>
      </Card>
      
      <SitesMap sites={supervisorSites} />
    </div>
  );
}
