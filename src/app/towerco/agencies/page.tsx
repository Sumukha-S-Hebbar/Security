
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { sites } from '@/lib/data';
import type { SecurityAgency, Site } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Upload, Loader2, PlusCircle, Search, MapPin, Eye, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';


const LOGGED_IN_TOWERCO = 'TowerCo Alpha'; // Simulate logged-in user

const uploadFormSchema = z.object({
  csvFile: z
    .any()
    .refine((files) => files?.length === 1, 'CSV file is required.')
    .refine((files) => files?.[0]?.type === 'text/csv', 'Only .csv files are accepted.'),
});

const addAgencyFormSchema = z.object({
    name: z.string().min(1, { message: 'Agency name is required.' }),
    phone: z.string().min(1, { message: 'Phone is required.' }),
    email: z.string().email({ message: 'Valid email is required.' }),
    address: z.string().min(1, { message: 'Address is required.' }),
    city: z.string().min(1, { message: 'City is required.' }),
    state: z.string().min(1, { message: 'State is required.' }),
    country: z.string().min(1, { message: 'Country is required.' }),
});

async function getAgencies(): Promise<SecurityAgency[]> {
    // TODO: Replace with your actual Django API endpoint
    const API_URL = 'https://your-django-api.com/api/agencies/';
    try {
        const res = await fetch(API_URL);
        if (!res.ok) {
            // This will activate the closest `error.js` Error Boundary
            throw new Error('Failed to fetch agencies');
        }
        return res.json();
    } catch (error) {
        console.error("Could not fetch agencies, returning empty array.", error);
        // In a real app, you might want to handle this more gracefully.
        return [];
    }
}


export default function TowercoAgenciesPage() {
    const [securityAgencies, setSecurityAgencies] = useState<SecurityAgency[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isAddAgencyDialogOpen, setIsAddAgencyDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isAddingAgency, setIsAddingAgency] = useState(false);
    const [selectedAgencyForSites, setSelectedAgencyForSites] = useState<SecurityAgency | null>(null);
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [selectedState, setSelectedState] = useState('all');
    const [selectedCity, setSelectedCity] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const agencies = await getAgencies();
            setSecurityAgencies(agencies);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const uploadForm = useForm<z.infer<typeof uploadFormSchema>>({
        resolver: zodResolver(uploadFormSchema),
    });

    const addAgencyForm = useForm<z.infer<typeof addAgencyFormSchema>>({
        resolver: zodResolver(addAgencyFormSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            state: '',
            country: '',
        }
    });

    async function onUploadSubmit(values: z.infer<typeof uploadFormSchema>) {
        setIsUploading(true);
        console.log('Uploaded file:', values.csvFile[0]);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast({
            title: 'Upload Successful',
            description: `File "${values.csvFile[0].name}" has been uploaded. Agency profiles would be processed.`,
        });

        uploadForm.reset({ csvFile: undefined });
        setIsUploading(false);
        setIsUploadDialogOpen(false);
    }

    async function onAddAgencySubmit(values: z.infer<typeof addAgencyFormSchema>) {
        setIsAddingAgency(true);
        console.log('New agency data:', values);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast({
            title: 'Agency Added',
            description: `Agency "${values.name}" has been created successfully.`,
        });

        addAgencyForm.reset();
        setIsAddingAgency(false);
        setIsAddAgencyDialogOpen(false);
    }

    const countries = useMemo(() => {
        const allCountries = securityAgencies.map((agency) => agency.country);
        return [...new Set(allCountries)];
    }, [securityAgencies]);

    const states = useMemo(() => {
        if (selectedCountry === 'all') {
            return [];
        }
        const allStates = securityAgencies
            .filter((agency) => agency.country === selectedCountry)
            .map((agency) => agency.state);
        return [...new Set(allStates)];
    }, [selectedCountry, securityAgencies]);

    const cities = useMemo(() => {
        if (selectedState === 'all' || selectedCountry === 'all') {
            return [];
        }
        const allCities = securityAgencies
            .filter((agency) => agency.country === selectedCountry && agency.state === selectedState)
            .map((agency) => agency.city);
        return [...new Set(allCities)];
    }, [selectedCountry, selectedState, securityAgencies]);

    const handleCountryChange = (country: string) => {
        setSelectedCountry(country);
        setSelectedState('all');
        setSelectedCity('all');
    };

    const handleStateChange = (state: string) => {
        setSelectedState(state);
        setSelectedCity('all');
    };


    const filteredAgencies = useMemo(() => {
        return securityAgencies.filter((agency) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                agency.name.toLowerCase().includes(searchLower) ||
                agency.id.toLowerCase().includes(searchLower) ||
                agency.email.toLowerCase().includes(searchLower) ||
                agency.city.toLowerCase().includes(searchLower) ||
                agency.state.toLowerCase().includes(searchLower) ||
                agency.country.toLowerCase().includes(searchLower);

            const matchesCountry =
                selectedCountry === 'all' || agency.country === selectedCountry;

            const matchesState =
                selectedState === 'all' || agency.state === selectedState;
            
            const matchesCity =
                selectedCity === 'all' || agency.city === selectedCity;

            return matchesSearch && matchesCountry && matchesState && matchesCity;
        });
    }, [searchQuery, selectedCountry, selectedState, selectedCity, securityAgencies]);

    const assignedSitesForSelectedAgency = useMemo(() => {
      if (!selectedAgencyForSites) return [];
      return sites.filter(s => s.agencyId === selectedAgencyForSites.id && s.towerco === LOGGED_IN_TOWERCO);
    }, [selectedAgencyForSites]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Security Agency Management</h1>
                <p className="text-muted-foreground">
                    Add, view, and manage security agencies.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle>All Security Agencies</CardTitle>
                            <CardDescription>A list of all security service providers.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload CSV
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                    <DialogTitle>Upload Agency Profiles</DialogTitle>
                                    <DialogDescription>
                                        Upload a CSV file to add multiple security agency profiles at once.
                                    </DialogDescription>
                                    </DialogHeader>
                                    <Form {...uploadForm}>
                                        <form onSubmit={uploadForm.handleSubmit(onUploadSubmit)}>
                                            <div className="grid gap-4 py-4">
                                                <FormField
                                                    control={uploadForm.control}
                                                    name="csvFile"
                                                    render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Agency CSV File</FormLabel>
                                                        <FormControl>
                                                        <Input
                                                            id="csvFile-agency-input"
                                                            type="file"
                                                            accept=".csv"
                                                            disabled={isUploading}
                                                            onChange={(e) => field.onChange(e.target.files)}
                                                        />
                                                        </FormControl>
                                                        <FormDescription>
                                                        The CSV should contain columns: name, phone, email, address, city, state, country.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={isUploading}>
                                                {isUploading ? (
                                                    <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload CSV
                                                    </>
                                                )}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isAddAgencyDialogOpen} onOpenChange={setIsAddAgencyDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Agency
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add a New Agency</DialogTitle>
                                        <DialogDescription>
                                            Fill in the details below to add a new security agency profile.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...addAgencyForm}>
                                        <form onSubmit={addAgencyForm.handleSubmit(onAddAgencySubmit)} className="space-y-4">
                                            <FormField
                                                control={addAgencyForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Agency Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., SecureGuard Inc." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={addAgencyForm.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., 555-123-4567" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={addAgencyForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., contact@secureguard.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={addAgencyForm.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Address</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., 123 Security Blvd" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-3 gap-4">
                                                <FormField
                                                    control={addAgencyForm.control}
                                                    name="city"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>City</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g., Metroplex" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={addAgencyForm.control}
                                                    name="state"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>State</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g., NY" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={addAgencyForm.control}
                                                    name="country"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Country</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g., USA" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={isAddingAgency}>
                                                {isAddingAgency ? (
                                                    <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Adding Agency...
                                                    </>
                                                ) : (
                                                    "Add Agency"
                                                )}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-4">
                        <div className="relative flex-1 md:grow-0">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search agencies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                          />
                        </div>
                        <Select value={selectedCountry} onValueChange={handleCountryChange}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Countries</SelectItem>
                                {countries.map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <Select value={selectedState} onValueChange={handleStateChange} disabled={selectedCountry === 'all'}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by state" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All States</SelectItem>
                                {states.map((state) => (
                                    <SelectItem key={state} value={state}>
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <Select value={selectedCity} onValueChange={setSelectedCity} disabled={selectedState === 'all' || selectedCountry === 'all'}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by city" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Cities</SelectItem>
                                {cities.map((city) => (
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
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-12 w-12 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[150px]" />
                                                <Skeleton className="h-4 w-[100px]" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-[80%]" />
                                    </CardContent>
                                    <CardFooter className="grid grid-cols-2 gap-2">
                                        <Skeleton className="h-9 w-full" />
                                        <Skeleton className="h-9 w-full" />
                                    </CardFooter>
                                </Card>
                            ))
                        ) : filteredAgencies.length > 0 ? (
                        filteredAgencies.map((agency) => (
                            <Card key={agency.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={agency.avatar} alt={agency.name} />
                                    <AvatarFallback>{agency.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">{agency.name}</CardTitle>
                                    <CardDescription>ID: {agency.id}</CardDescription>
                                </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4 flex-shrink-0" />
                                <a href={`mailto:${agency.email}`} className="truncate hover:underline">
                                    {agency.email}
                                </a>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4 flex-shrink-0" />
                                <span>{agency.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span>{`${agency.city}, ${agency.state}, ${agency.country}`}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="grid grid-cols-2 gap-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/towerco/agencies/${agency.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Report
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedAgencyForSites(agency)}
                                >
                                    <Building2 className="mr-2 h-4 w-4" />
                                    View Sites
                                </Button>
                            </CardFooter>
                            </Card>
                        ))
                        ) : (
                            <div className="col-span-full text-center text-muted-foreground py-10">
                                No agencies found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedAgencyForSites} onOpenChange={(isOpen) => !isOpen && setSelectedAgencyForSites(null)}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Sites Assigned to {selectedAgencyForSites?.name}</DialogTitle>
                  <DialogDescription>
                    A list of all sites managed by this agency for {LOGGED_IN_TOWERCO}.
                  </DialogDescription>
                </DialogHeader>
                <div className="pt-4">
                  {assignedSitesForSelectedAgency.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Site Name</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>State</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedSitesForSelectedAgency.map((site) => (
                          <TableRow key={site.id}>
                            <TableCell className="font-medium">{site.name}</TableCell>
                            <TableCell>{site.address}</TableCell>
                            <TableCell>{site.city}</TableCell>
                            <TableCell>{site.state}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No sites from {LOGGED_IN_TOWERCO} are assigned to this agency.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
        </div>
    );
}
