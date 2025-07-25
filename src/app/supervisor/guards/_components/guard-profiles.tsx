
'use client';

import type { Guard } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileDown } from 'lucide-react';

export function GuardProfiles({ guards }: { guards: Guard[] }) {
  const { toast } = useToast();

  const handleDownloadReport = (guard: Guard) => {
    toast({
      title: 'Report Download Started',
      description: `Downloading report for ${guard.name}.`,
    });
    // In a real app, this would trigger a file download.
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Security Guards</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guard</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Current Location</TableHead>
              <TableHead>Perimeter Accuracy</TableHead>
              <TableHead>Selfie Check-in Accuracy</TableHead>
              <TableHead className="text-right">Report</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guards.map((guard) => {
              const selfieAccuracy =
                guard.totalSelfieRequests > 0
                  ? Math.round(
                      ((guard.totalSelfieRequests - guard.missedSelfieCount) /
                        guard.totalSelfieRequests) *
                        100
                    )
                  : 100;
              return (
                <TableRow key={guard.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={guard.avatar} alt={guard.name} />
                        <AvatarFallback>
                          {guard.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{guard.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {guard.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{guard.site}</TableCell>
                  <TableCell>{guard.phone}</TableCell>
                  <TableCell>{guard.location}</TableCell>
                  <TableCell>
                    {guard.performance?.perimeterAccuracy}%
                  </TableCell>
                  <TableCell>{selfieAccuracy}%</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport(guard)}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
