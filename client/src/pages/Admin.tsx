import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Trash2, Users, Eye, Calendar, LogOut, Settings, Download, FileText, FileSpreadsheet,
  TrendingUp, TrendingDown, Mail, Phone, Video, BarChart3, PieChart, Activity,
  Search, Filter, RefreshCw, AlertCircle, CheckCircle, Clock, Globe, AlertTriangle,
  Check, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Registration, User, UpdateUserData } from "@shared/schema";
import logoPath from "@assets/logo_1751279296203.png";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("overview");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [testEmail, setTestEmail] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Check authentication
  const {
    data: authData,
    isLoading: authLoading,
    error: authError,
  } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        throw new Error("Not authenticated");
      }
      return response.json();
    },
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authError && !authLoading) {
      setLocation("/login");
    }
  }, [authError, authLoading, setLocation]);

  const {
    data: registrations,
    isLoading,
    error,
  } = useQuery<Registration[]>({
    queryKey: ["/api/admin/registrations"],
    queryFn: async () => {
      const response = await fetch("/api/admin/registrations");
      if (!response.ok) {
        if (response.status === 401) {
          setLocation("/login");
        }
        throw new Error("Failed to fetch registrations");
      }
      return response.json();
    },
    enabled: !!authData,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to logout");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      setLocation("/login");
    },
  });

  // Update credentials mutation
  const updateCredentialsMutation = useMutation({
    mutationFn: async (data: UpdateUserData) => {
      const response = await fetch("/api/admin/update-credentials", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update credentials");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Credentials updated successfully",
      });
      setSettingsOpen(false);
      setCredentials({ username: "", password: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRegistration = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete registration");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
      toast({
        title: "Success",
        description: "Registration deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete registration",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    setDeleteItemId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteItemId) {
      deleteRegistration.mutate(deleteItemId);
      setDeleteDialogOpen(false);
      setDeleteItemId(null);
    }
  };

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetch("/api/admin/registrations/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete users");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
      setSelectedUsers([]);
      setSelectAll(false);
      toast({
        title: "Success",
        description: `${selectedUsers.length} users deleted successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle user selection
  const handleUserSelect = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredRegistrations.map(reg => reg.id));
    }
    setSelectAll(!selectAll);
  };



  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select users to delete",
        variant: "destructive",
      });
      return;
    }
    
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedUsers);
    setBulkDeleteDialogOpen(false);
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: UpdateUserData = {};
    if (credentials.username) updateData.username = credentials.username;
    if (credentials.password) updateData.password = credentials.password;
    
    if (Object.keys(updateData).length > 0) {
      updateCredentialsMutation.mutate(updateData);
    }
  };

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send test email");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test email sent successfully! Check your inbox.",
      });
      setTestEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (testEmail) {
      testEmailMutation.mutate(testEmail);
    }
  };

  // Settings query
  const { data: settings } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      return response.json();
    },
    enabled: !!authData,
  });

  // Settings mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update setting");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportToCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast({
        title: "No Data",
        description: "No registrations to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ["ID", "Name", "Email", "Phone", "Video Watched", "Registration Date"];
    const csvData = [
      headers.join(","),
      ...registrations.map(reg => [
        reg.id,
        `"${reg.name}"`,
        reg.email,
        reg.phone,
        reg.videoWatched ? "Yes" : "No",
        `"${formatDate(reg.createdAt)}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Data exported to CSV successfully",
    });
  };

  const exportToJSON = () => {
    if (!registrations || registrations.length === 0) {
      toast({
        title: "No Data",
        description: "No registrations to export",
        variant: "destructive",
      });
      return;
    }

    const jsonData = JSON.stringify(registrations, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Data exported to JSON successfully",
    });
  };

  // Filter and search functions
  const filteredRegistrations = registrations?.filter((reg) => {
    const matchesSearch = 
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm);
    
    const matchesFilter = 
      filterType === "all" ||
      (filterType === "video-watched" && reg.videoWatched) ||
      (filterType === "no-video" && !reg.videoWatched) ||
      (filterType === "today" && new Date(reg.createdAt).toDateString() === new Date().toDateString()) ||
      (filterType === "this-week" && isThisWeek(new Date(reg.createdAt)));
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      case "email":
        return a.email.localeCompare(b.email);
      default:
        return 0;
    }
  }) || [];

  // Update select all state when users are selected/deselected
  useEffect(() => {
    if (filteredRegistrations.length > 0) {
      const allSelected = filteredRegistrations.every(reg => selectedUsers.includes(reg.id));
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, filteredRegistrations]);

  const isThisWeek = (date: Date) => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo && date <= today;
  };

  // Analytics calculations
  const totalRegistrations = registrations?.length || 0;
  const videoWatchedCount = registrations?.filter(r => r.videoWatched).length || 0;
  const todayCount = registrations?.filter(r => 
    new Date(r.createdAt).toDateString() === new Date().toDateString()
  ).length || 0;
  const thisWeekCount = registrations?.filter(r => 
    isThisWeek(new Date(r.createdAt))
  ).length || 0;
  const conversionRate = totalRegistrations > 0 ? (videoWatchedCount / totalRegistrations) * 100 : 0;

  // Get registration trend (last 7 days)
  const getRegistrationTrend = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    return last7Days.map(dateString => ({
      date: dateString,
      count: registrations?.filter(r => 
        new Date(r.createdAt).toDateString() === dateString
      ).length || 0
    }));
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {authLoading ? "Checking authentication..." : "Loading dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Failed to load registrations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Enhanced Header with Logo */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="bg-white p-3 rounded-xl shadow-md">
                <img
                  src={logoPath}
                  alt="Done For You Pros"
                  className="h-12 w-auto"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Admin Dashboard
                </h1>
                <p className="text-blue-100 mt-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Welcome {authData?.user?.username?.split('@')[0]} - Control Center
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Live Stats Badge */}
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/30">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="font-semibold" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  {totalRegistrations} Users
                </span>
              </div>
              
              {/* Quick Actions */}
              <div className="flex space-x-2">
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white backdrop-blur-sm"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] })}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white backdrop-blur-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Settings */}
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white backdrop-blur-sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#2C5CDC" }}>
                      <Settings className="w-5 h-5" />
                      <span>Admin Settings</span>
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdateCredentials} className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription style={{ fontFamily: "Montserrat, sans-serif" }}>
                        Leave fields blank to keep current credentials
                      </AlertDescription>
                    </Alert>
                    <div>
                      <Label htmlFor="newUsername" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        New Email Address
                      </Label>
                      <Input
                        id="newUsername"
                        type="email"
                        placeholder="admin@doneforyoupros.com"
                        value={credentials.username}
                        onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                        className="focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new secure password"
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        className="focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2 pt-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold"
                        disabled={updateCredentialsMutation.isPending}
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {updateCredentialsMutation.isPending ? (
                          <div className="flex items-center space-x-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Updating...</span>
                          </div>
                        ) : (
                          "Update Credentials"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSettingsOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Logout */}
              <Button
                onClick={() => logoutMutation.mutate()}
                variant="outline"
                size="sm"
                className="bg-red-500/20 hover:bg-red-500/30 border-red-300/50 text-red-100 hover:text-white backdrop-blur-sm"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabbed Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 bg-white/50 backdrop-blur-sm border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Tools
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    Total Users
                  </CardTitle>
                  <Users className="h-5 w-5 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    {totalRegistrations}
                  </div>
                  <p className="text-xs opacity-80 mt-1">
                    {thisWeekCount > 0 && `+${thisWeekCount} this week`}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    Video Engagement
                  </CardTitle>
                  <Video className="h-5 w-5 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    {Math.round(conversionRate)}%
                  </div>
                  <div className="mt-2">
                    <Progress value={conversionRate} className="h-2 bg-orange-400/30" />
                  </div>
                  <p className="text-xs opacity-80 mt-1">
                    {videoWatchedCount}/{totalRegistrations} watched video
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    Today's Growth
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    {todayCount}
                  </div>
                  <p className="text-xs opacity-80 mt-1">
                    New registrations today
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    This Week
                  </CardTitle>
                  <Calendar className="h-5 w-5 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    {thisWeekCount}
                  </div>
                  <p className="text-xs opacity-80 mt-1">
                    Last 7 days
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-orange-50">
                  <CardTitle style={{ fontFamily: "Montserrat, sans-serif", color: "#2C5CDC" }}>
                    <Activity className="w-5 h-5 inline mr-2" />
                    Registration Trend (7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {getRegistrationTrend().map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          {formatShortDate(day.date)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max((day.count / Math.max(...getRegistrationTrend().map(d => d.count), 1)) * 100, 5)}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-700 w-8 text-right" style={{ fontFamily: "Montserrat, sans-serif" }}>
                            {day.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardTitle style={{ fontFamily: "Montserrat, sans-serif", color: "#2C5CDC" }}>
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {registrations?.slice(0, 5).map((reg, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {reg.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate" style={{ fontFamily: "Montserrat, sans-serif" }}>
                            {reg.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {reg.email} • {formatShortDate(reg.createdAt)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {reg.videoWatched ? (
                            <Video className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Search and Filter Controls */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-orange-50">
                <CardTitle style={{ fontFamily: "Montserrat, sans-serif", color: "#2C5CDC" }}>
                  <Search className="w-5 h-5 inline mr-2" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 focus:border-blue-500 focus:ring-blue-500"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 bg-white"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      <option value="all">All Users</option>
                      <option value="video-watched">Video Watched</option>
                      <option value="no-video">No Video</option>
                      <option value="today">Today</option>
                      <option value="this-week">This Week</option>
                    </select>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 bg-white"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name A-Z</option>
                      <option value="email">Email A-Z</option>
                    </select>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600" style={{ fontFamily: "Montserrat, sans-serif" }}>
                      Showing {filteredRegistrations.length} of {totalRegistrations} users
                    </span>
                    {selectedUsers.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {selectedUsers.length} selected
                        </Badge>
                        <Button
                          onClick={handleBulkDelete}
                          variant="destructive"
                          size="sm"
                          disabled={bulkDeleteMutation.isPending}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Selected
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={exportToCSV}
                      variant="outline"
                      size="sm"
                      className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      onClick={exportToJSON}
                      variant="outline"
                      size="sm"
                      className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Users Table */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-orange-50 border-b">
                <CardTitle style={{ fontFamily: "Montserrat, sans-serif", color: "#2C5CDC" }}>
                  User Database
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredRegistrations && filteredRegistrations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700" style={{ fontFamily: "Montserrat, sans-serif" }}>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <span>Select All</span>
                            </div>
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700" style={{ fontFamily: "Montserrat, sans-serif" }}>User</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700" style={{ fontFamily: "Montserrat, sans-serif" }}>Contact</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700" style={{ fontFamily: "Montserrat, sans-serif" }}>Status</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700" style={{ fontFamily: "Montserrat, sans-serif" }}>Registered</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700" style={{ fontFamily: "Montserrat, sans-serif" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRegistrations.map((registration, index) => (
                          <tr 
                            key={registration.id} 
                            className={`border-b hover:bg-gradient-to-r hover:from-blue-25 hover:to-orange-25 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                            }`}
                          >
                            <td className="py-4 px-6">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(registration.id)}
                                onChange={() => handleUserSelect(registration.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {registration.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
                                    {registration.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ID: #{registration.id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <a 
                                    href={`mailto:${registration.email}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm"
                                    style={{ fontFamily: "Montserrat, sans-serif" }}
                                  >
                                    {registration.email}
                                  </a>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <a 
                                    href={`tel:${registration.phone}`}
                                    className="text-orange-600 hover:text-orange-800 hover:underline transition-colors text-sm"
                                    style={{ fontFamily: "Montserrat, sans-serif" }}
                                  >
                                    {registration.phone}
                                  </a>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={registration.videoWatched ? "default" : "secondary"}
                                  className={registration.videoWatched ? 
                                    "bg-green-100 text-green-800 hover:bg-green-200" : 
                                    "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }
                                >
                                  {registration.videoWatched ? (
                                    <>
                                      <Video className="w-3 h-3 mr-1" />
                                      Engaged
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3 h-3 mr-1" />
                                      Pending
                                    </>
                                  )}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm text-gray-500" style={{ fontFamily: "Montserrat, sans-serif" }}>
                                <div>{formatDate(registration.createdAt)}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {Math.floor((new Date().getTime() - new Date(registration.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(registration.id)}
                                  disabled={deleteRegistration.isPending}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg" style={{ fontFamily: "Montserrat, sans-serif" }}>
                      {searchTerm || filterType !== "all" ? "No users match your filters" : "No registrations found"}
                    </p>
                    <p className="text-gray-400 text-sm mt-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                      {searchTerm || filterType !== "all" ? "Try adjusting your search or filters" : "Users will appear here once they register"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardTitle style={{ fontFamily: "Montserrat, sans-serif", color: "#2C5CDC" }}>
                    <PieChart className="w-5 h-5 inline mr-2" />
                    Video Engagement Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-600 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        {Math.round(conversionRate)}%
                      </div>
                      <p className="text-gray-600" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        Video Completion Rate
                      </p>
                      <Progress value={conversionRate} className="h-4 mt-4" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          {videoWatchedCount}
                        </div>
                        <p className="text-sm text-green-700">Watched Video</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          {totalRegistrations - videoWatchedCount}
                        </div>
                        <p className="text-sm text-gray-700">Pending</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle style={{ fontFamily: "Montserrat, sans-serif", color: "#2C5CDC" }}>
                    <Globe className="w-5 h-5 inline mr-2" />
                    Registration Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm text-blue-700">Average Daily</p>
                        <p className="text-lg font-bold text-blue-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          {Math.round(totalRegistrations / 7)} users
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm text-orange-700">Peak Day</p>
                        <p className="text-lg font-bold text-orange-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          {Math.max(...getRegistrationTrend().map(d => d.count))} users
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-green-700">Growth Rate</p>
                        <p className="text-lg font-bold text-green-800" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          +{thisWeekCount > 0 ? Math.round((thisWeekCount / Math.max(totalRegistrations - thisWeekCount, 1)) * 100) : 0}%
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#059669" }}>
                    <FileSpreadsheet className="w-5 h-5" />
                    <span>Export Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={exportToCSV}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as CSV
                  </Button>
                  <Button
                    onClick={exportToJSON}
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as JSON
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#2C5CDC" }}>
                    <RefreshCw className="w-5 h-5" />
                    <span>Data Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] })}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("all");
                      setSortBy("newest");
                    }}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#7C3AED" }}>
                    <Settings className="w-5 h-5" />
                    <span>System Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setSettingsOpen(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Settings
                  </Button>
                  <Button
                    onClick={() => logoutMutation.mutate()}
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    disabled={logoutMutation.isPending}
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#D97706" }}>
                    <Mail className="w-5 h-5" />
                    <span>Email Testing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Email Testing Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          Email Testing Notice
                        </h4>
                        <p className="text-sm text-amber-700 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          Currently using development mode with <code className="bg-amber-100 px-1 rounded">onboarding@resend.dev</code>
                        </p>
                        <p className="text-xs text-amber-600" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          • For testing: Use your own verified email address<br/>
                          • For production: Verify your domain at resend.com/domains
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleTestEmail} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter your verified email address"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="focus:border-yellow-500 focus:ring-yellow-500"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                      required
                    />
                    <Button
                      type="submit"
                      disabled={!testEmail || testEmailMutation.isPending}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {testEmailMutation.isPending ? "Sending..." : "Send Test Email"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Game Settings */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#7C3AED" }}>
                    <Settings className="w-5 h-5" />
                    <span>Game Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Video Requirement Toggle */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex-1">
                      <Label className="text-sm font-semibold text-purple-800 mb-1 block" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        Video Requirement
                      </Label>
                      <p className="text-xs text-purple-600" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        Require users to watch video before registration form unlocks
                      </p>
                    </div>
                    <Switch
                      checked={settings?.find(s => s.key === 'video_requirement_enabled')?.value === 'true'}
                      onCheckedChange={(checked) => {
                        updateSettingMutation.mutate({
                          key: 'video_requirement_enabled',
                          value: checked ? 'true' : 'false'
                        });
                      }}
                      disabled={updateSettingMutation.isPending}
                    />
                  </div>

                  {/* Duplicate Email Check Toggle */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex-1">
                      <Label className="text-sm font-semibold text-purple-800 mb-1 block" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        Duplicate Email Check
                      </Label>
                      <p className="text-xs text-purple-600" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        Prevent users from playing multiple times with the same email
                      </p>
                    </div>
                    <Switch
                      checked={settings?.find(s => s.key === 'duplicate_email_check')?.value === 'true'}
                      onCheckedChange={(checked) => {
                        updateSettingMutation.mutate({
                          key: 'duplicate_email_check',
                          value: checked ? 'true' : 'false'
                        });
                      }}
                      disabled={updateSettingMutation.isPending}
                    />
                  </div>

                  {/* Status Indicators */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-center space-x-2 p-2 bg-white rounded-lg border border-purple-200">
                      <div className={`w-3 h-3 rounded-full ${
                        settings?.find(s => s.key === 'video_requirement_enabled')?.value === 'true' 
                          ? 'bg-green-500 animate-pulse' 
                          : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-purple-700" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        {settings?.find(s => s.key === 'video_requirement_enabled')?.value === 'true' 
                          ? 'Video Required' 
                          : 'Video Optional'}
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-2 bg-white rounded-lg border border-purple-200">
                      <div className={`w-3 h-3 rounded-full ${
                        settings?.find(s => s.key === 'duplicate_email_check')?.value === 'true' 
                          ? 'bg-green-500 animate-pulse' 
                          : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-purple-700" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        {settings?.find(s => s.key === 'duplicate_email_check')?.value === 'true' 
                          ? 'Email Check Enabled' 
                          : 'Email Check Disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Settings Info */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-purple-700" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          <strong>Video Required:</strong> Users must watch video to unlock registration<br/>
                          <strong>Video Optional:</strong> Users can register without watching video<br/>
                          <strong>Email Check:</strong> Prevents duplicate registrations with same email
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle style={{ fontFamily: "Montserrat, sans-serif", color: "#2C5CDC" }}>
                  <Activity className="w-5 h-5 inline mr-2" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                      Database Status
                    </h4>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-700">Connected</span>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                      Total Records
                    </h4>
                    <div className="text-2xl font-bold text-orange-600" style={{ fontFamily: "Montserrat, sans-serif" }}>
                      {totalRegistrations}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                      Last Updated
                    </h4>
                    <div className="text-sm text-green-700">
                      {registrations && registrations.length > 0 ? formatShortDate(registrations[0].createdAt) : "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Registration</h3>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Are you sure you want to delete this registration? This will permanently remove the user's information from the system.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="px-6"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bulk Delete Users</h3>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Are you sure you want to delete <span className="font-semibold text-red-600">{selectedUsers.length}</span> selected users? This will permanently remove their information from the system.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-sm text-red-700 font-medium">This action is irreversible</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              className="px-6"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              className="px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedUsers.length} Users
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}