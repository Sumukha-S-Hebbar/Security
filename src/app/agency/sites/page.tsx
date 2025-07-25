
'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sites, guards, patrollingOfficers, alerts } from '@/lib/data';
import type { Site, PatrollingOfficer } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileDown,
  MapPin,
  Fence,
  Search,
  UserCheck,
  ShieldAlert,
  Users,
  Eye,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const LOGGED_IN_AGENCY_ID = 'AGY01'; // Simulate logged-in agency

export default function AgencySitesPage() {
  const [selectedPatrollingOfficers, setSelectedPatrollingOfficers] = useState<{
    [key: string]: string;
  }>({});
  const [geofencePerimeters, setGeofencePerimeters] = useState<{
    [key: string]: string;
  }>({});
  const [selectedGuards, setSelectedGuards] = useState<{
    [key: string]: string[];
  }>({});
  const { toast } = useToast();
  
  // State for Assigned Sites filters
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
  const [selectedPatrollingOfficerFilter, setSelectedPatrollingOfficerFilter] = useState('all');
  const [assignedSelectedCountry, setAssignedSelectedCountry] = useState('all');
  const [assignedSelectedState, setAssignedSelectedState] = useState('all');
  const [assignedSelectedCity, setAssignedSelectedCity] = useState('all');

  // State for Unassigned Sites filters
  const [unassignedSearchQuery, setUnassignedSearchQuery] = useState('');
  const [unassignedSelectedCountry, setUnassignedSelectedCountry] = useState('all');
  const [unassignedSelectedState, setUnassignedSelectedState] = useState('all');
  const [unassignedSelectedCity, setUnassignedSelectedCity] = useState('all');

  const agencySites = useMemo(
    () => sites.filter((site) => site.agencyId === LOGGED_IN_AGENCY_ID),
    []
  );
  const agencySiteNames = useMemo(
    () => new Set(agencySites.map((s) => s.name)),
    [agencySites]
  );
  
  const unassignedGuards = useMemo(
    () => guards.filter(guard => agencySiteNames.has(guard.site) && !guards.find(g => g.id === guard.id)?.patrollingOfficerId),
    [agencySiteNames]
  );
  
  const allAgencyPatrollingOfficers = useMemo(() => {
    // In a real app, this might be a separate API call for all officers in the agency
    return patrollingOfficers.filter(po => po); // Simplified for demo
  }, []);

  const getPatrollingOfficerForSite = useCallback(
    (siteId: string) => {
      const site = agencySites.find((s) => s.id === siteId);
      if (!site || !site.patrollingOfficerId) return null;
      return allAgencyPatrollingOfficers.find(
        (s) => s.id === site.patrollingOfficerId
      );
    },
    [agencySites, allAgencyPatrollingOfficers]
  );

  const assignedSites = useMemo(
    () => agencySites.filter((site) => site.patrollingOfficerId),
    [agencySites]
  );
  const unassignedSites = useMemo(
    () =>
      agencySites.filter((site) => !site.patrollingOfficerId),
    [agencySites]
  );

  const assignedSitesPatrollingOfficers = useMemo(() => {
    const officers = new Map<string, PatrollingOfficer>();
    assignedSites.forEach((site) => {
      const po = getPatrollingOfficerForSite(site.id);
      if (po && !officers.has(po.id)) {
        officers.set(po.id, po);
      }
    });
    return Array.from(officers.values());
  }, [assignedSites, getPatrollingOfficerForSite]);
  
  // Location filters data for ASSIGNED sites
  const assignedCountries = useMemo(() => [...new Set(assignedSites.map((site) => site.country))].sort(), [assignedSites]);
  const assignedStates = useMemo(() => {
    if (assignedSelectedCountry === 'all') return [];
    return [...new Set(assignedSites.filter((site) => site.country === assignedSelectedCountry).map((site) => site.state))].sort();
  }, [assignedSelectedCountry, assignedSites]);
  const assignedCities = useMemo(() => {
    if (assignedSelectedState === 'all' || assignedSelectedCountry === 'all') return [];
    return [...new Set(assignedSites.filter((site) => site.country === assignedSelectedCountry && site.state === assignedSelectedState).map((site) => site.city))].sort();
  }, [assignedSelectedCountry, assignedSelectedState, assignedSites]);

  // Location filters data for UNASSIGNED sites
  const unassignedCountries = useMemo(() => [...new Set(unassignedSites.map((site) => site.country))].sort(), [unassignedSites]);
  const unassignedStates = useMemo(() => {
    if (unassignedSelectedCountry === 'all') return [];
    return [...new Set(unassignedSites.filter((site) => site.country === unassignedSelectedCountry).map((site) => site.state))].sort();
  }, [unassignedSelectedCountry, unassignedSites]);
  const unassignedCities = useMemo(() => {
    if (unassignedSelectedState === 'all' || unassignedSelectedCountry === 'all') return [];
    return [...new Set(unassignedSites.filter((site) => site.country === unassignedSelectedCountry && site.state === unassignedSelectedState).map((site) => site.city))].sort();
  }, [unassignedSelectedCountry, unassignedSelectedState, unassignedSites]);


  const handleAssignedCountryChange = (country: string) => {
    setAssignedSelectedCountry(country);
    setAssignedSelectedState('all');
    setAssignedSelectedCity('all');
  };
  const handleAssignedStateChange = (state: string) => {
    setAssignedSelectedState(state);
    setAssignedSelectedCity('all');
  };

  const handleUnassignedCountryChange = (country: string) => {
    setUnassignedSelectedCountry(country);
    setUnassignedSelectedState('all');
    setUnassignedSelectedCity('all');
  };
  const handleUnassignedStateChange = (state: string) => {
    setUnassignedSelectedState(state);
    setUnassignedSelectedCity('all');
  };


  const handlePatrollingOfficerSelect = (
    siteId: string,
    patrollingOfficerId: string
  ) => {
    setSelectedPatrollingOfficers((prev) => ({
      ...prev,
      [siteId]: patrollingOfficerId,
    }));
  };

  const handleGeofenceChange = (siteId: string, value: string) => {
    setGeofencePerimeters((prev) => ({
      ...prev,
      [siteId]: value,
    }));
  };

  const handleGuardSelect = (siteId: string, guardId: string) => {
    setSelectedGuards((prev) => {
      const currentSelection = prev[siteId] || [];
      const newSelection = currentSelection.includes(guardId)
        ? currentSelection.filter((id) => id !== guardId)
        : [...currentSelection, guardId];
      return { ...prev, [siteId]: newSelection };
    });
  };

  const handleAssign = (siteId: string) => {
    const patrollingOfficerId = selectedPatrollingOfficers[siteId];
    const perimeter = geofencePerimeters[siteId];
    const guardIds = selectedGuards[siteId] || [];

    if (!patrollingOfficerId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a patrolling officer.',
      });
      return;
    }
    if (guardIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one guard.',
      });
      return;
    }
    if (!perimeter || Number(perimeter) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid geofence perimeter.',
      });
      return;
    }
    const siteName = unassignedSites.find((s) => s.id === siteId)?.name;
    const patrollingOfficerName = allAgencyPatrollingOfficers.find(
      (s) => s.id === patrollingOfficerId
    )?.name;

    toast({
      title: 'Site Assigned',
      description: `${patrollingOfficerName} and ${guardIds.length} guard(s) have been assigned to ${siteName} with a ${perimeter}m geofence. The site will be moved to the assigned list on next refresh.`,
    });
  };

  const handleDownloadReport = (site: Site) => {
    toast({
      title: 'Report Download Started',
      description: `Downloading report for ${site.name}.`,
    });
  };

  const filteredAssignedSites = useMemo(() => {
    return assignedSites.filter((site) => {
      const searchLower = assignedSearchQuery.toLowerCase();
      const matchesSearch =
        site.name.toLowerCase().includes(searchLower) ||
        site.address.toLowerCase().includes(searchLower);

      const patrollingOfficer = getPatrollingOfficerForSite(site.id);
      const matchesPatrollingOfficer =
        selectedPatrollingOfficerFilter === 'all' ||
        (patrollingOfficer &&
          patrollingOfficer.id === selectedPatrollingOfficerFilter);

      const matchesCountry = assignedSelectedCountry === 'all' || site.country === assignedSelectedCountry;
      const matchesState = assignedSelectedState === 'all' || site.state === assignedSelectedState;
      const matchesCity = assignedSelectedCity === 'all' || site.city === assignedSelectedCity;

      return matchesSearch && matchesPatrollingOfficer && matchesCountry && matchesState && matchesCity;
    });
  }, [
    assignedSearchQuery,
    selectedPatrollingOfficerFilter,
    assignedSites,
    getPatrollingOfficerForSite,
    assignedSelectedCountry,
    assignedSelectedState,
    assignedSelectedCity,
  ]);
  
  const filteredUnassignedSites = useMemo(() => {
    return unassignedSites.filter((site) => {
      const searchLower = unassignedSearchQuery.toLowerCase();
      const matchesSearch =
        site.name.toLowerCase().includes(searchLower) ||
        site.address.toLowerCase().includes(searchLower);

      const matchesCountry = unassignedSelectedCountry === 'all' || site.country === unassignedSelectedCountry;
      const matchesState = unassignedSelectedState === 'all' || site.state === unassignedSelectedState;
      const matchesCity = unassignedSelectedCity === 'all' || site.city === unassignedSelectedCity;

      return matchesSearch && matchesCountry && matchesState && matchesCity;
    });
  }, [unassignedSearchQuery, unassignedSites, unassignedSelectedCountry, unassignedSelectedState, unassignedSelectedCity]);

  const siteIncidentsCount = useMemo(() => {
    const counts: { [siteName: string]: number } = {};
    alerts.forEach((alert) => {
      if (alert.type === 'Emergency' && agencySiteNames.has(alert.site)) {
        if (!counts[alert.site]) {
          counts[alert.site] = 0;
        }
        counts[alert.site]++;
      }
    });
    return counts;
  }, [agencySiteNames, alerts]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
        <p className="text-muted-foreground">
          Comprehensive overview of all operational sites.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Sites</CardTitle>
          <CardDescription>
            A list of all sites with an assigned patrolling officer.
          </CardDescription>
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <div className="relative flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assigned sites..."
                value={assignedSearchQuery}
                onChange={(e) => setAssignedSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              />
            </div>
            <Select
              value={selectedPatrollingOfficerFilter}
              onValueChange={setSelectedPatrollingOfficerFilter}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filter by Patrolling Officer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patrolling Officers</SelectItem>
                {assignedSitesPatrollingOfficers.map((po) => (
                  <SelectItem key={po.id} value={po.id}>
                    {po.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={assignedSelectedCountry} onValueChange={handleAssignedCountryChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {assignedCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={assignedSelectedState}
              onValueChange={handleAssignedStateChange}
              disabled={assignedSelectedCountry === 'all'}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {assignedStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={assignedSelectedCity}
              onValueChange={setAssignedSelectedCity}
              disabled={assignedSelectedState === 'all' || assignedSelectedCountry === 'all'}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {assignedCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {filteredAssignedSites.length > 0 ? (
              filteredAssignedSites.map((site) => {
                const patrollingOfficer = getPatrollingOfficerForSite(site.id);
                const incidentsCount = siteIncidentsCount[site.name] || 0;
                return (
                  <Card key={site.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">{site.name}</CardTitle>
                      <CardDescription>ID: {site.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
                        <span>{site.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <UserCheck className="h-4 w-4 flex-shrink-0" />
                        <span>{patrollingOfficer?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Fence className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {site.geofencePerimeter
                            ? `${site.geofencePerimeter}m`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                        <span>{incidentsCount} Incidents</span>
                      </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/agency/sites/${site.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Report
                            </Link>
                        </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReport(site)}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-10">
                No assigned sites found for the current filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {unassignedSites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Sites</CardTitle>
            <CardDescription>
              A list of sites that do not have a patrolling officer assigned.
            </CardDescription>
            <div className="flex flex-wrap items-center gap-2 pt-4">
                <div className="relative flex-1 md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search unassigned sites..."
                    value={unassignedSearchQuery}
                    onChange={(e) => setUnassignedSearchQuery(e.target.value)}
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                  />
                </div>
                <Select value={unassignedSelectedCountry} onValueChange={handleUnassignedCountryChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {unassignedCountries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={unassignedSelectedState}
                  onValueChange={handleUnassignedStateChange}
                  disabled={unassignedSelectedCountry === 'all'}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {unassignedStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={unassignedSelectedCity}
                  onValueChange={setUnassignedSelectedCity}
                  disabled={unassignedSelectedState === 'all' || unassignedSelectedCountry === 'all'}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {unassignedCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Geofence (m)</TableHead>
                  <TableHead>Assign Guards</TableHead>
                  <TableHead>Assign Patrolling Officer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnassignedSites.length > 0 ? (
                  filteredUnassignedSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div className="font-medium">{site.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {site.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="e.g. 500"
                        className="w-[120px]"
                        value={geofencePerimeters[site.id] || ''}
                        onChange={(e) =>
                          handleGeofenceChange(site.id, e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-[180px]">
                            <Users className="mr-2 h-4 w-4" />
                            Select Guards ({selectedGuards[site.id]?.length || 0})
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64">
                          <DropdownMenuLabel>Available Guards</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {unassignedGuards.length > 0 ? (
                            unassignedGuards.map((guard) => (
                              <DropdownMenuCheckboxItem
                                key={guard.id}
                                checked={selectedGuards[site.id]?.includes(guard.id)}
                                onSelect={(e) => e.preventDefault()}
                                onCheckedChange={() => handleGuardSelect(site.id, guard.id)}
                              >
                                {guard.name}
                              </DropdownMenuCheckboxItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">No unassigned guards</div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={selectedPatrollingOfficers[site.id] || ''}
                        onValueChange={(value) =>
                          handlePatrollingOfficerSelect(site.id, value)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Patrolling Officer" />
                        </SelectTrigger>
                        <SelectContent>
                          {allAgencyPatrollingOfficers.map((patrollingOfficer) => (
                            <SelectItem
                              key={patrollingOfficer.id}
                              value={patrollingOfficer.id}
                            >
                              {patrollingOfficer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleAssign(site.id)}
                        disabled={
                          !selectedPatrollingOfficers[site.id] ||
                          !geofencePerimeters[site.id] ||
                          !selectedGuards[site.id]?.length
                        }
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No unassigned sites found for the current filter.
                    </TableCell>
                </TableRow>
              )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
