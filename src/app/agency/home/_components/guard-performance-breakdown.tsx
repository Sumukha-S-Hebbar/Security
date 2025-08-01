
'use client';

import { useState, useMemo } from 'react';
import type { Guard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const getPerformanceColor = (value: number) => {
  if (value >= 95) {
    return 'hsl(var(--chart-2))'; // Green
  } else if (value >= 65) {
    return 'hsl(var(--chart-3))'; // Yellow
  } else {
    return 'hsl(var(--destructive))'; // Orange
  }
};

export function GuardPerformanceBreakdown({ guards }: { guards: Guard[] }) {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  const availableYears = useMemo(() => {
    // In a real app, this would be derived from available data time ranges
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  }, []);

  const totalGuards = guards.length;

  const performanceData = useMemo(() => {
    // NOTE: In a real application, you would filter the source data
    // based on selectedYear and selectedMonth here before calculating performance.
    // The current mock data is cumulative, so filtering is for demonstration purposes.

    return guards.reduce(
      (acc, guard) => {
        acc.totalPerimeterAccuracy += guard.performance?.perimeterAccuracy || 0;
        acc.totalSelfieRequests += guard.totalSelfieRequests;
        acc.totalSelfiesTaken += guard.totalSelfieRequests - guard.missedSelfieCount;
        return acc;
      },
      {
        totalPerimeterAccuracy: 0,
        totalSelfieRequests: 0,
        totalSelfiesTaken: 0,
      }
    );
  }, [guards, selectedYear, selectedMonth]);


  const avgPerimeterAccuracy = totalGuards > 0 ? performanceData.totalPerimeterAccuracy / totalGuards : 0;
  const avgSelfieAccuracy =
    performanceData.totalSelfieRequests > 0
      ? (performanceData.totalSelfiesTaken / performanceData.totalSelfieRequests) * 100
      : 0;
      
  const roundedPerimeterAccuracy = Math.round(avgPerimeterAccuracy);
  const roundedSelfieAccuracy = Math.round(avgSelfieAccuracy);

  const perimeterAccuracyData = [
    { name: 'Accuracy', value: roundedPerimeterAccuracy },
    { name: 'Remaining', value: 100 - roundedPerimeterAccuracy },
  ];
  
  const selfieAccuracyData = [
    { name: 'Accuracy', value: roundedSelfieAccuracy },
    { name: 'Remaining', value: 100 - roundedSelfieAccuracy },
  ];

  const perimeterColor = getPerformanceColor(roundedPerimeterAccuracy);
  const selfieColor = getPerformanceColor(roundedSelfieAccuracy);
  
  const COLORS_CHECKIN = [perimeterColor, 'hsl(var(--muted))'];
  const COLORS_SELFIE = [selfieColor, 'hsl(var(--muted))'];


  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
            <CardTitle>Guard Performance Overview</CardTitle>
            <CardDescription>
            Average performance metrics across all assigned guards.
            </CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                {availableYears.map((year) => (
                    <SelectItem key={year} value={year} className="font-medium">
                    {year}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all" className="font-medium">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()} className="font-medium">
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
            <div className="flex flex-col items-center gap-2">
                <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={perimeterAccuracyData}
                                cx="50%"
                                cy="50%"
                                innerRadius="70%"
                                outerRadius="85%"
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {perimeterAccuracyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_CHECKIN[index % COLORS_CHECKIN.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold" style={{ color: perimeterColor }}>
                            {roundedPerimeterAccuracy}%
                        </span>
                    </div>
                </div>
                <p className="flex items-center gap-2 text-center font-medium">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Guard Check-in Accuracy
                </p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
                <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={selfieAccuracyData}
                                cx="50%"
                                cy="50%"
                                innerRadius="70%"
                                outerRadius="85%"
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {selfieAccuracyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_SELFIE[index % COLORS_SELFIE.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className="text-3xl font-bold" style={{ color: selfieColor }}>
                            {roundedSelfieAccuracy}%
                         </span>
                    </div>
                </div>
                 <p className="flex items-center gap-2 text-center font-medium">
                  <UserCheck className="w-4 h-4 text-primary" />
                  Selfie Check-in Accuracy
                </p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
