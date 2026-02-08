import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Users,
  Bell,
  Shield,
  CreditCard,
  Settings,
  Plus,
  BookOpen,
  CheckCircle2,
  Loader2,
  MoreVertical,
  Trash2,
  Check,
  Search,
  UserPlus,
  Send,
  Eye,
  Calendar,
  Lock,
  AlertCircle,
  XCircle,
  Clock,
  Wallet,
  Building,
  Smartphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  authService,
  UserDto,
  Child,
  ChildStatus,
  NotificationPreferences,
  PaymentMethod,
} from "@/services/authService";

// List of countries
const COUNTRIES = [
  "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// Payment method types for Egypt
enum PaymentMethodType {
  VODAFONE_CASH = "vodafone_cash",
  INSTAPAY = "instapay",
  FAWRY = "fawry",
  BANK_ACCOUNT = "bank_account",
}

// // Child status types
// enum ChildStatus {
//   ACTIVE = "active",
//   SUSPENDED = "suspended",
//   EMAIL_NOT_VERIFIED = "email_not_verified",
// }

// Child linking flow steps
enum LinkingStep {
  SEARCH_EMAIL = "search_email",
  EXISTING_FOUND = "existing_found",
  CREATE_NEW = "create_new",
  VERIFICATION_SENT = "verification_sent",
  COMPLETED = "completed"
}

export default function ParentProfilePage() {
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserDto | null>(null);
  const [linkedChildren, setLinkedChildren] = useState<Child[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Remove child state
  const [childToRemove, setChildToRemove] = useState<Child | null>(null);
  const [isRemovingChild, setIsRemovingChild] = useState(false);

  // Remove payment method state
  const [paymentToRemove, setPaymentToRemove] = useState<PaymentMethod | null>(null);
  const [isRemovingPayment, setIsRemovingPayment] = useState(false);

  // Set default payment state
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);

  // Child linking state
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
  const [linkingStep, setLinkingStep] = useState<LinkingStep>(LinkingStep.SEARCH_EMAIL);
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundChild, setFoundChild] = useState<any>(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isCreatingChild, setIsCreatingChild] = useState(false);

  // Password change state
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // New child creation data
  const [newChildData, setNewChildData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    country: "",
  });

  // Split fullName into firstName and lastName
  const getNameParts = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
      };
    }
    return {
      firstName: fullName,
      lastName: "",
    };
  };

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    progressUpdates: true,
    weeklyReports: true,
    achievementAlerts: true,
    paymentReminders: true,
  });

  // Add payment method dialog state
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentMethodType>(
    PaymentMethodType.VODAFONE_CASH
  );
  const [newPaymentData, setNewPaymentData] = useState({
    // Vodafone Cash
    vodafoneNumber: "",
    
    // Instapay
    instapayId: "",
    
    // Fawry
    fawryNumber: "",
    
    // Bank Account
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    iban: "",
  });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await authService.getCurrentUser();
        setUserData(data);

        const parts = getNameParts(data.fullName);
        setProfile({
          firstName: parts.firstName,
          lastName: parts.lastName,
          email: data.email || "",
          phone: data.phone || "",
          location: data.country || "",
          bio: data.bio || "",
        });

        if (data.notificationPreferences) {
          setNotifications(data.notificationPreferences);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  // Fetch linked children
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsLoadingChildren(true);
        const children = await authService.getLinkedChildren();
        setLinkedChildren(children);
      } catch (error: any) {
        console.error("Failed to load children:", error);
        setLinkedChildren([]);
      } finally {
        setIsLoadingChildren(false);
      }
    };

    fetchChildren();
  }, []);

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoadingPayments(true);
        const methods = await authService.getPaymentMethods();
        setPaymentMethods(methods);
      } catch (error: any) {
        console.error("Failed to load payment methods:", error);
        setPaymentMethods([]);
      } finally {
        setIsLoadingPayments(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const updateData = {
        fullName: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        phone: profile.phone,
        country: profile.location,
        bio: profile.bio,
      };

      const updatedUser = await authService.updateProfile(updateData);
      setUserData(updatedUser);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.fullName = updatedUser.fullName;
      localStorage.setItem("user", JSON.stringify(user));

      const parts = getNameParts(updatedUser.fullName);
      setProfile({
        firstName: parts.firstName,
        lastName: parts.lastName,
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        location: updatedUser.country || "",
        bio: updatedUser.bio || "",
      });

      setIsEditing(false);

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      const parts = getNameParts(userData.fullName);
      setProfile({
        firstName: parts.firstName,
        lastName: parts.lastName,
        email: userData.email || "",
        phone: userData.phone || "",
        location: userData.country || "",
        bio: userData.bio || "",
      });
    }
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setIsChangePasswordDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNotificationChange = async (
    key: keyof NotificationPreferences,
    checked: boolean
  ) => {
    const updatedNotifications = { ...notifications, [key]: checked };
    setNotifications(updatedNotifications);

    try {
      await authService.updateNotificationPreferences(updatedNotifications);
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error: any) {
      setNotifications(notifications);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  const handleSearchChild = async () => {
    if (!searchEmail || !searchEmail.includes("@")) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      const result = await authService.searchChildByEmail(searchEmail);
      
      if (result.exists) {
        setFoundChild(result.child);
        setLinkingStep(LinkingStep.EXISTING_FOUND);
      } else {
        setLinkingStep(LinkingStep.CREATE_NEW);
        setNewChildData({ ...newChildData, email: searchEmail });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to search for child",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendInvite = async () => {
    try {
      setIsSendingInvite(true);
      await authService.sendChildLinkInvite(foundChild.id);
      
      toast({
        title: "Invite Sent",
        description: `An invitation has been sent to ${foundChild.email}. You'll be notified when they accept.`,
      });
      
      resetAddChildDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send invite",
        variant: "destructive",
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleCreateChild = async () => {
    // Validation
    if (!newChildData.fullName || !newChildData.email || !newChildData.password || 
        !newChildData.confirmPassword || !newChildData.dateOfBirth || !newChildData.country) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newChildData.password !== newChildData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newChildData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingChild(true);
      const result = await authService.createAndLinkChild(newChildData);
      
      setLinkingStep(LinkingStep.VERIFICATION_SENT);
      
      // Auto-close after showing success message
      setTimeout(() => {
        toast({
          title: "Child Account Created",
          description: `${newChildData.fullName} can now log in with ${newChildData.email}`,
        });
        
        // Refresh children list
        authService.getLinkedChildren().then(setLinkedChildren);
        
        resetAddChildDialog();
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create child account",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChild(false);
    }
  };

  const resetAddChildDialog = () => {
    setIsAddChildDialogOpen(false);
    setLinkingStep(LinkingStep.SEARCH_EMAIL);
    setSearchEmail("");
    setFoundChild(null);
    setNewChildData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      country: "",
    });
  };

  const handleRemoveChild = async () => {
    if (!childToRemove) return;

    try {
      setIsRemovingChild(true);
      await authService.removeChild(childToRemove.id);
      
      setLinkedChildren(linkedChildren.filter(child => child.id !== childToRemove.id));
      
      toast({
        title: "Child Removed",
        description: `${childToRemove.name} has been unlinked from your account.`,
      });
      
      setChildToRemove(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove child",
        variant: "destructive",
      });
    } finally {
      setIsRemovingChild(false);
    }
  };

  const handleViewProgress = (child: Child) => {
    // Only allow if child is active or suspended (not email_not_verified)
    if (child.status === ChildStatus.EMAIL_NOT_VERIFIED) {
      toast({
        title: "Email Not Verified",
        description: "This child must verify their email before you can view their progress.",
        variant: "destructive",
      });
      return;
    }
    // Navigate to child progress page
    window.location.href = `/parent/child-progress/${child.id}`;
  };

  const getChildStatusBadge = (status: ChildStatus) => {
    switch (status) {
      case ChildStatus.ACTIVE:
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case ChildStatus.SUSPENDED:
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Suspended
          </Badge>
        );
      case ChildStatus.EMAIL_NOT_VERIFIED:
        return (
          <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="mr-1 h-3 w-3" />
            Email Not Verified
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleAddPaymentMethod = async () => {
    let paymentMethodData: any = {
      type: selectedPaymentType,
    };

    // Validate based on payment type
    switch (selectedPaymentType) {
      case PaymentMethodType.VODAFONE_CASH:
        if (!newPaymentData.vodafoneNumber) {
          toast({
            title: "Validation Error",
            description: "Please enter your Vodafone Cash number",
            variant: "destructive",
          });
          return;
        }
        paymentMethodData.phoneNumber = newPaymentData.vodafoneNumber;
        break;

      case PaymentMethodType.INSTAPAY:
        if (!newPaymentData.instapayId) {
          toast({
            title: "Validation Error",
            description: "Please enter your Instapay ID",
            variant: "destructive",
          });
          return;
        }
        paymentMethodData.instapayId = newPaymentData.instapayId;
        break;

      case PaymentMethodType.FAWRY:
        if (!newPaymentData.fawryNumber) {
          toast({
            title: "Validation Error",
            description: "Please enter your Fawry reference number",
            variant: "destructive",
          });
          return;
        }
        paymentMethodData.referenceNumber = newPaymentData.fawryNumber;
        break;

      case PaymentMethodType.BANK_ACCOUNT:
        if (!newPaymentData.accountHolderName || !newPaymentData.bankName || 
            !newPaymentData.accountNumber) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required bank account details",
            variant: "destructive",
          });
          return;
        }
        paymentMethodData.accountHolderName = newPaymentData.accountHolderName;
        paymentMethodData.bankName = newPaymentData.bankName;
        paymentMethodData.accountNumber = newPaymentData.accountNumber;
        paymentMethodData.iban = newPaymentData.iban;
        break;
    }

    try {
      setIsAddingPayment(true);
      const newPaymentMethod = await authService.addPaymentMethod(paymentMethodData);
      
      setPaymentMethods([...paymentMethods, newPaymentMethod]);
      
      setNewPaymentData({
        vodafoneNumber: "",
        instapayId: "",
        fawryNumber: "",
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        iban: "",
      });
      setIsAddPaymentDialogOpen(false);
      
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add payment method",
        variant: "destructive",
      });
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleSetDefaultPayment = async (paymentMethodId: string) => {
    try {
      setIsSettingDefault(paymentMethodId);
      await authService.setDefaultPaymentMethod(paymentMethodId);
      
      setPaymentMethods(paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === paymentMethodId
      })));
      
      toast({
        title: "Default Payment Set",
        description: "Your default payment method has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to set default payment method",
        variant: "destructive",
      });
    } finally {
      setIsSettingDefault(null);
    }
  };

  const handleRemovePaymentMethod = async () => {
    if (!paymentToRemove) return;

    try {
      setIsRemovingPayment(true);
      await authService.removePaymentMethod(paymentToRemove.id);
      
      setPaymentMethods(paymentMethods.filter(method => method.id !== paymentToRemove.id));
      
      toast({
        title: "Payment Method Removed",
        description: "Your payment method has been removed successfully.",
      });
      
      setPaymentToRemove(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove payment method",
        variant: "destructive",
      });
    } finally {
      setIsRemovingPayment(false);
    }
  };

  const getInitials = (): string => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;
    }
    if (profile.firstName) {
      return profile.firstName.charAt(0);
    }
    return "U";
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case PaymentMethodType.VODAFONE_CASH:
        return <Smartphone className="h-5 w-5" />;
      case PaymentMethodType.INSTAPAY:
        return <Wallet className="h-5 w-5" />;
      case PaymentMethodType.FAWRY:
        return <CreditCard className="h-5 w-5" />;
      case PaymentMethodType.BANK_ACCOUNT:
        return <Building className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPaymentMethodLabel = (type: string) => {
    switch (type) {
      case PaymentMethodType.VODAFONE_CASH:
        return "Vodafone Cash";
      case PaymentMethodType.INSTAPAY:
        return "Instapay";
      case PaymentMethodType.FAWRY:
        return "Fawry";
      case PaymentMethodType.BANK_ACCOUNT:
        return "Bank Account";
      default:
        return "Payment Method";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={userData.profilePictureUrl}
                    alt={userData.fullName}
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-muted-foreground">Parent Account</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge variant="secondary">
                    <Users className="mr-1 h-3 w-3" />
                    {userData.childrenCount || linkedChildren.length} Children
                  </Badge>
                  <Badge variant="secondary">
                    <Shield className="mr-1 h-3 w-3" />
                    Parental Controls{" "}
                    {userData.parentalControlsActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              {/* Only show edit button when on profile tab */}
              {activeTab === "profile" && (
                <div className="flex gap-2">
                  {isEditing && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Save Changes" : "Edit Profile"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9 bg-muted"
                      value={profile.email}
                      disabled={true}
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-9"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Country</Label>
                    <Select
                      value={profile.location}
                      onValueChange={(value) =>
                        setProfile({ ...profile, location: value })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger id="location">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select country" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="Tell us about yourself"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password *</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password *</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Min. 6 characters"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword">Confirm New Password *</Label>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          placeholder="Re-enter new password"
                          value={passwordData.confirmNewPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsChangePasswordDialogOpen(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmNewPassword: "",
                          });
                        }}
                        disabled={isChangingPassword}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                        {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Change Password
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Children Tab */}
          <TabsContent value="children">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Linked Children</CardTitle>
                  <CardDescription>
                    Manage your children's accounts
                  </CardDescription>
                </div>
                <Dialog open={isAddChildDialogOpen} onOpenChange={(open) => {
                  if (!open) resetAddChildDialog();
                  setIsAddChildDialogOpen(open);
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Link Child
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {linkingStep === LinkingStep.SEARCH_EMAIL && "Search for Child Account"}
                        {linkingStep === LinkingStep.EXISTING_FOUND && "Child Account Found"}
                        {linkingStep === LinkingStep.CREATE_NEW && "Create Child Account"}
                        {linkingStep === LinkingStep.VERIFICATION_SENT && "Account Created Successfully"}
                      </DialogTitle>
                      <DialogDescription>
                        {linkingStep === LinkingStep.SEARCH_EMAIL && "Enter your child's email to search for an existing account or create a new one."}
                        {linkingStep === LinkingStep.EXISTING_FOUND && "We found an existing account. Send an invite to link this child to your account."}
                        {linkingStep === LinkingStep.CREATE_NEW && "No account found with this email. Create a new student account for your child."}
                        {linkingStep === LinkingStep.VERIFICATION_SENT && "A verification email has been sent. Your child can now log in with the provided credentials."}
                      </DialogDescription>
                    </DialogHeader>

                    {/* Step 1: Search Email */}
                    {linkingStep === LinkingStep.SEARCH_EMAIL && (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="searchEmail">Child's Email Address *</Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="searchEmail"
                                type="email"
                                className="pl-9"
                                placeholder="child@example.com"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSearchChild()}
                              />
                            </div>
                            <Button onClick={handleSearchChild} disabled={isSearching}>
                              {isSearching ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Search className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Enter the email address to search for an existing account or create a new one.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Existing Child Found */}
                    {linkingStep === LinkingStep.EXISTING_FOUND && foundChild && (
                      <div className="space-y-4 py-4">
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={foundChild.profilePictureUrl} />
                              <AvatarFallback>{foundChild.fullName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">{foundChild.fullName}</h4>
                              <p className="text-sm text-muted-foreground">{foundChild.email}</p>
                              <p className="text-sm text-muted-foreground">
                                Age: {foundChild.age} • Student
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                          <div className="flex gap-3">
                            <Send className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Link Request
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                An invitation will be sent to {foundChild.email}. Once accepted, you'll be able to monitor their learning progress.
                              </p>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={resetAddChildDialog}>
                            Cancel
                          </Button>
                          <Button onClick={handleSendInvite} disabled={isSendingInvite}>
                            {isSendingInvite && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Send className="mr-2 h-4 w-4" />
                            Send Invite
                          </Button>
                        </DialogFooter>
                      </div>
                    )}

                    {/* Step 3: Create New Child */}
                    {linkingStep === LinkingStep.CREATE_NEW && (
                      <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 border border-red-200 dark:border-red-800">
                          <div className="flex gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                No Account Found
                              </p>
                              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                No existing account was found with the email <strong>{searchEmail}</strong>. You can create a new account for your child below.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="fullName"
                                className="pl-9"
                                placeholder="John Doe"
                                value={newChildData.fullName}
                                onChange={(e) =>
                                  setNewChildData({ ...newChildData, fullName: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="childEmail">Email Address *</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="childEmail"
                                type="email"
                                className="pl-9"
                                value={newChildData.email}
                                onChange={(e) =>
                                  setNewChildData({ ...newChildData, email: e.target.value })
                                }
                                readOnly
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="password"
                                type="password"
                                className="pl-9"
                                placeholder="Min. 6 characters"
                                value={newChildData.password}
                                onChange={(e) =>
                                  setNewChildData({ ...newChildData, password: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="confirmPassword"
                                type="password"
                                className="pl-9"
                                placeholder="Re-enter password"
                                value={newChildData.confirmPassword}
                                onChange={(e) =>
                                  setNewChildData({ ...newChildData, confirmPassword: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="dateOfBirth"
                                type="date"
                                className="pl-9"
                                value={newChildData.dateOfBirth}
                                onChange={(e) =>
                                  setNewChildData({ ...newChildData, dateOfBirth: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="country">Country *</Label>
                            <Select
                              value={newChildData.country}
                              onValueChange={(value) =>
                                setNewChildData({ ...newChildData, country: value })
                              }
                            >
                              <SelectTrigger id="country">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4">
                          <div className="flex gap-3">
                            <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                Email Verification Required
                              </p>
                              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                A verification email will be sent to {newChildData.email}. Your child must verify their email before they can log in.
                              </p>
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setLinkingStep(LinkingStep.SEARCH_EMAIL)}
                          >
                            Back
                          </Button>
                          <Button onClick={handleCreateChild} disabled={isCreatingChild}>
                            {isCreatingChild && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                          </Button>
                        </DialogFooter>
                      </div>
                    )}

                    {/* Step 4: Verification Sent */}
                    {linkingStep === LinkingStep.VERIFICATION_SENT && (
                      <div className="space-y-4 py-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Account Created Successfully!</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                              A verification email has been sent to <strong>{newChildData.email}</strong>
                            </p>
                          </div>
                          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 w-full text-left">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                              Login Credentials
                            </p>
                            <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                              <p><strong>Email:</strong> {newChildData.email}</p>
                              <p><strong>Password:</strong> (Set by you)</p>
                              <p className="mt-2 text-xs">
                                Your child can change their password after logging in for the first time.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingChildren ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : linkedChildren.length > 0 ? (
                  linkedChildren.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={child.profilePictureUrl || child.avatar}
                            alt={child.name}
                          />
                          <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{child.name}</h3>
                            {getChildStatusBadge(child.status || ChildStatus.ACTIVE)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Age: {child.age} • {child.courses} courses enrolled
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProgress(child)}
                          disabled={child.status === ChildStatus.EMAIL_NOT_VERIFIED}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Progress
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setChildToRemove(child)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Child
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No children linked
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Link your children's accounts to monitor their progress and
                      manage their learning.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Control how you receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for{" "}
                        {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        handleNotificationChange(
                          key as keyof NotificationPreferences,
                          checked
                        )
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Payments
                </CardTitle>
                <CardDescription>Manage your payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingPayments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => (
                    <div key={method.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded bg-muted p-2">
                            {getPaymentMethodIcon(method.type)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {getPaymentMethodLabel(method.type)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {method.displayInfo}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.isDefault ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Default
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefaultPayment(method.id)}
                              disabled={isSettingDefault === method.id}
                            >
                              {isSettingDefault === method.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Set as Default"
                              )}
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!method.isDefault && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleSetDefaultPayment(method.id)}
                                    disabled={isSettingDefault === method.id}
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Set as Default
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setPaymentToRemove(method)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Method
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No payment methods
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Add a payment method to manage subscriptions and purchases.
                    </p>
                  </div>
                )}
                <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                      <DialogDescription>
                        Choose a payment method and enter your details
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Payment Method Type *</Label>
                        <Select
                          value={selectedPaymentType}
                          onValueChange={(value) => setSelectedPaymentType(value as PaymentMethodType)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PaymentMethodType.VODAFONE_CASH}>
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                Vodafone Cash
                              </div>
                            </SelectItem>
                            <SelectItem value={PaymentMethodType.INSTAPAY}>
                              <div className="flex items-center gap-2">
                                <Wallet className="h-4 w-4" />
                                Instapay
                              </div>
                            </SelectItem>
                            <SelectItem value={PaymentMethodType.FAWRY}>
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Fawry
                              </div>
                            </SelectItem>
                            <SelectItem value={PaymentMethodType.BANK_ACCOUNT}>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Bank Account
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Vodafone Cash Fields */}
                      {selectedPaymentType === PaymentMethodType.VODAFONE_CASH && (
                        <div className="space-y-2">
                          <Label htmlFor="vodafoneNumber">Vodafone Cash Number *</Label>
                          <Input
                            id="vodafoneNumber"
                            placeholder="01XXXXXXXXX"
                            value={newPaymentData.vodafoneNumber}
                            onChange={(e) =>
                              setNewPaymentData({ ...newPaymentData, vodafoneNumber: e.target.value })
                            }
                          />
                        </div>
                      )}

                      {/* Instapay Fields */}
                      {selectedPaymentType === PaymentMethodType.INSTAPAY && (
                        <div className="space-y-2">
                          <Label htmlFor="instapayId">Instapay ID *</Label>
                          <Input
                            id="instapayId"
                            placeholder="Your Instapay ID"
                            value={newPaymentData.instapayId}
                            onChange={(e) =>
                              setNewPaymentData({ ...newPaymentData, instapayId: e.target.value })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter your phone number or email registered with Instapay
                          </p>
                        </div>
                      )}

                      {/* Fawry Fields */}
                      {selectedPaymentType === PaymentMethodType.FAWRY && (
                        <div className="space-y-2">
                          <Label htmlFor="fawryNumber">Fawry Reference Number *</Label>
                          <Input
                            id="fawryNumber"
                            placeholder="Your Fawry number"
                            value={newPaymentData.fawryNumber}
                            onChange={(e) =>
                              setNewPaymentData({ ...newPaymentData, fawryNumber: e.target.value })
                            }
                          />
                        </div>
                      )}

                      {/* Bank Account Fields */}
                      {selectedPaymentType === PaymentMethodType.BANK_ACCOUNT && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                            <Input
                              id="accountHolderName"
                              placeholder="John Doe"
                              value={newPaymentData.accountHolderName}
                              onChange={(e) =>
                                setNewPaymentData({ ...newPaymentData, accountHolderName: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bankName">Bank Name *</Label>
                            <Input
                              id="bankName"
                              placeholder="e.g., National Bank of Egypt"
                              value={newPaymentData.bankName}
                              onChange={(e) =>
                                setNewPaymentData({ ...newPaymentData, bankName: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number *</Label>
                            <Input
                              id="accountNumber"
                              placeholder="XXXXXXXXXXXX"
                              value={newPaymentData.accountNumber}
                              onChange={(e) =>
                                setNewPaymentData({ ...newPaymentData, accountNumber: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="iban">IBAN (Optional)</Label>
                            <Input
                              id="iban"
                              placeholder="EGXXXXXXXXXXXXXXXXXXXXXXXXX"
                              value={newPaymentData.iban}
                              onChange={(e) =>
                                setNewPaymentData({ ...newPaymentData, iban: e.target.value })
                              }
                            />
                          </div>
                        </>
                      )}

                      <p className="text-xs text-muted-foreground">
                        🔒 Your payment information is encrypted and stored securely.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddPaymentDialogOpen(false);
                          setNewPaymentData({
                            vodafoneNumber: "",
                            instapayId: "",
                            fawryNumber: "",
                            accountHolderName: "",
                            bankName: "",
                            accountNumber: "",
                            iban: "",
                          });
                        }}
                        disabled={isAddingPayment}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddPaymentMethod} disabled={isAddingPayment}>
                        {isAddingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Payment Method
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Remove Child Confirmation Dialog */}
      <AlertDialog open={!!childToRemove} onOpenChange={() => setChildToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Child?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{childToRemove?.name}</strong> from your account? 
              This will unlink the account but won't delete it. You can re-link it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingChild}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveChild}
              disabled={isRemovingChild}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRemovingChild && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Child
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Payment Method Confirmation Dialog */}
      <AlertDialog open={!!paymentToRemove} onOpenChange={() => setPaymentToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? 
              This action cannot be undone and you'll need to add it again if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingPayment}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemovePaymentMethod}
              disabled={isRemovingPayment}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRemovingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Method
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}