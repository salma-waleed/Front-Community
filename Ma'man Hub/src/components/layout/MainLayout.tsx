// if logged in
import { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "My Learning", href: "/dashboard", icon: GraduationCap },
  { name: "Messages", href: "/messages", icon: MessageSquare },
];

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen] = useState(false);
  const { items } = useCartStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b-4 border-indigo-200 bg-white/95 backdrop-blur-xl shadow-2xl shadow-indigo-200/50">
        <div className="container mx-auto px-4 flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 shadow-2xl ring-4 ring-white/70">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="hidden font-display text-2xl font-extrabold tracking-wide text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text sm:inline-block">
              EduPlatform
            </span>
          </Link>

          {user && (
            <nav className="hidden items-center gap-2 md:flex">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-extrabold tracking-wide transition-all hover:bg-gradient-to-r hover:from-indigo-200 hover:to-pink-200 hover:shadow-lg hover:scale-105",
                    location.pathname === item.href
                      ? "bg-gradient-to-r from-indigo-300 to-pink-300 shadow-xl ring-2 ring-indigo-200/50 scale-105"
                      : "text-indigo-700 hover:text-indigo-900",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-indigo-200 to-pink-200"
                  >
                    <User className="h-7 w-7 text-indigo-700" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-pink-200 to-red-200"
                  onClick={handleLogout}
                >
                  <LogOut className="h-7 w-7 text-pink-700" />
                </Button>
              </div>
            ) : (
              <div className="hidden items-center gap-3 sm:flex">
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="px-6 py-3 rounded-2xl text-lg font-extrabold tracking-wide border-2 border-indigo-300"
                  >
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="px-8 py-3 rounded-2xl text-lg font-extrabold tracking-wide bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 rounded-full md:hidden shadow-lg bg-gradient-to-br from-yellow-200 to-pink-200"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-7 w-7 text-yellow-700" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t-2 border-indigo-200 lg:hidden bg-gradient-to-r from-indigo-50 to-pink-50"
            >
              <div className="container py-6 px-4">
                <Input
                  placeholder="Search fun courses..."
                  className="pl-12 py-6 text-lg rounded-2xl border-2 border-indigo-200"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed right-0 top-0 z-50 h-full w-80 bg-card p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-xl font-bold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {user && (
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium",
                        location.pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              )}

              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                {!user && (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full">Sign up</Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1">{children}</main>
    </div>
  );
}

// ************************************************************************************************//

// import { ReactNode, useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Home,
//   BookOpen,
//   ShoppingCart,
//   MessageSquare,
//   User,
//   Settings,
//   LogOut,
//   Menu,
//   X,
//   Search,
//   Bell,
//   GraduationCap,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { useCartStore } from "@/stores/cartStore";
// import { useAuthStore } from "@/stores/authStore";
// import { cn } from "@/lib/utils";

// interface MainLayoutProps {
//   children: ReactNode;
// }

// const navigation = [
//   // { name: "Home", href: "/", icon: Home },
//   // { name: "Courses", href: "/courses", icon: BookOpen },
//   // { name: "My Learning", href: "/dashboard", icon: GraduationCap },
//   // { name: "Messages", href: "/messages", icon: MessageSquare },
// ];

// export function MainLayout({ children }: MainLayoutProps) {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const { items } = useCartStore();
//   const { user, logout } = useAuthStore();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}{" "}
//       <header className="sticky top-0 z-50 border-b-4 border-indigo-200 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-2xl shadow-indigo-200/50">
//         {" "}
//         <div className="container mx-auto px-4 flex h-20 items-center justify-between gap-4">
//           {" "}
//           {/* Logo */}{" "}
//           <Link to="/" className="flex items-center gap-3">
//             {" "}
//             <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 shadow-2xl ring-4 ring-white/70 drop-shadow-lg">
//               {" "}
//               <GraduationCap className="h-7 w-7 text-white drop-shadow-md" />{" "}
//             </div>{" "}
//             <span className="hidden font-display text-2xl font-extrabold tracking-wide text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text sm:inline-block">
//               {" "}
//               EduPlatform{" "}
//             </span>{" "}
//           </Link>{" "}
//           {/* Desktop Navigation */}{" "}
//           <nav className="hidden items-center gap-2 md:flex">
//             {" "}
//             {navigation.map((item) => (
//               <Link
//                 key={item.name}
//                 to={item.href}
//                 className={cn(
//                   "flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-extrabold tracking-wide transition-all hover:bg-gradient-to-r hover:from-indigo-200 hover:to-pink-200 hover:shadow-lg hover:scale-105",
//                   location.pathname === item.href
//                     ? "bg-gradient-to-r from-indigo-300 to-pink-300 shadow-xl ring-2 ring-indigo-200/50 scale-105"
//                     : "text-indigo-700 hover:text-indigo-900",
//                 )}
//               >
//                 {" "}
//                 <item.icon className="h-5 w-5 drop-shadow-sm" />{" "}
//                 {item.name}{" "}
//               </Link>
//             ))}{" "}
//           </nav>{" "}
//           {/* Right Actions */}{" "}
//           <div className="flex items-center gap-3">
//             {" "}
//             {/* User Menu */}{" "}
//             {user ? (
//               <div className="flex items-center gap-2">
//                 {" "}
//                 <Link to="/profile">
//                   {" "}
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all bg-gradient-to-br from-indigo-200 to-pink-200 hover:from-indigo-300 hover:to-pink-300"
//                   >
//                     {" "}
//                     <User className="h-7 w-7 text-indigo-700 drop-shadow-sm" />{" "}
//                   </Button>{" "}
//                 </Link>{" "}
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all bg-gradient-to-br from-pink-200 to-red-200 hover:from-pink-300 hover:to-red-300"
//                   onClick={handleLogout}
//                 >
//                   {" "}
//                   <LogOut className="h-7 w-7 text-pink-700 drop-shadow-sm" />{" "}
//                 </Button>{" "}
//               </div>
//             ) : (
//               <div className="hidden items-center gap-3 sm:flex">
//                 {" "}
//                 <Link to="/login">
//                   {" "}
//                   <Button
//                     variant="outline"
//                     className="px-6 py-3 rounded-2xl text-lg font-extrabold tracking-wide shadow-lg hover:shadow-xl hover:scale-105 transition-all hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 border-2 border-indigo-300"
//                   >
//                     {" "}
//                     Log in{" "}
//                   </Button>{" "}
//                 </Link>{" "}
//                 <Link to="/register">
//                   {" "}
//                   <Button className="px-8 py-3 rounded-2xl text-lg font-extrabold tracking-wide shadow-2xl hover:shadow-3xl hover:scale-105 transition-all bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600">
//                     {" "}
//                     Sign up{" "}
//                   </Button>{" "}
//                 </Link>{" "}
//               </div>
//             )}{" "}
//             {/* Mobile Menu Toggle */}{" "}
//             <Button
//               variant="ghost"
//               size="icon"
//               className="h-14 w-14 rounded-full md:hidden shadow-lg hover:shadow-xl hover:scale-110 transition-all bg-gradient-to-br from-yellow-200 to-pink-200 hover:from-yellow-300 hover:to-pink-300"
//               onClick={() => setMobileMenuOpen(true)}
//             >
//               {" "}
//               <Menu className="h-7 w-7 text-yellow-700" />{" "}
//             </Button>{" "}
//           </div>{" "}
//         </div>{" "}
//         {/* Mobile Search */}{" "}
//         <AnimatePresence>
//           {" "}
//           {searchOpen && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               className="border-t-2 border-indigo-200 lg:hidden bg-gradient-to-r from-indigo-50 to-pink-50"
//             >
//               {" "}
//               <div className="container py-6 px-4">
//                 {" "}
//                 <Input
//                   placeholder="Search fun courses..."
//                   className="pl-12 py-6 text-lg rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-white to-indigo-50 shadow-inner focus:shadow-xl transition-all"
//                 />{" "}
//               </div>{" "}
//             </motion.div>
//           )}{" "}
//         </AnimatePresence>{" "}
//       </header>
//       {/* Mobile Menu */}
//       <AnimatePresence>
//         {mobileMenuOpen && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 z-50 bg-black/50"
//               onClick={() => setMobileMenuOpen(false)}
//             />
//             <motion.div
//               initial={{ x: "100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "100%" }}
//               transition={{ type: "spring", damping: 20 }}
//               className="fixed right-0 top-0 z-50 h-full w-80 bg-card p-6"
//             >
//               <div className="flex items-center justify-between mb-8">
//                 <span className="font-display text-xl font-bold">Menu</span>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   <X className="h-5 w-5" />
//                 </Button>
//               </div>

//               <nav className="space-y-2">
//                 {navigation.map((item) => (
//                   <Link
//                     key={item.name}
//                     to={item.href}
//                     onClick={() => setMobileMenuOpen(false)}
//                     className={cn(
//                       "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
//                       location.pathname === item.href
//                         ? "bg-accent text-accent-foreground"
//                         : "hover:bg-muted",
//                     )}
//                   >
//                     <item.icon className="h-5 w-5" />
//                     {item.name}
//                   </Link>
//                 ))}
//               </nav>

//               <div className="absolute bottom-6 left-6 right-6 space-y-2">
//                 {!user && (
//                   <>
//                     <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
//                       <Button variant="outline" className="w-full">
//                         Log in
//                       </Button>
//                     </Link>
//                     <Link
//                       to="/register"
//                       onClick={() => setMobileMenuOpen(false)}
//                     >
//                       <Button className="w-full">Sign up</Button>
//                     </Link>
//                   </>
//                 )}
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//       {/* Main Content */}
//       <main>{children}</main>
//       {/* Footer */}
//       <footer className="border-t border-border bg-card mt-auto">
//         <div className="container py-12">
//           <div className="grid gap-8 md:grid-cols-4">
//             <div>
//               <Link to="/" className="flex items-center gap-2 mb-4">
//                 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
//                   <GraduationCap className="h-4 w-4 text-primary-foreground" />
//                 </div>
//                 <span className="font-display text-lg font-bold">
//                   EduPlatform
//                 </span>
//               </Link>
//               <p className="text-sm text-muted-foreground">
//                 Transform your future with world-class online education.
//               </p>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Platform</h4>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 <li>
//                   <Link to="/courses" className="hover:text-foreground">
//                     Browse Courses
//                   </Link>
//                 </li>
//                 <li>
//                   <Link
//                     to="/become-instructor"
//                     className="hover:text-foreground"
//                   >
//                     Become an Instructor
//                   </Link>
//                 </li>
//                 <li>
//                   <Link to="/pricing" className="hover:text-foreground">
//                     Pricing
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Resources</h4>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 <li>
//                   <Link to="/help" className="hover:text-foreground">
//                     Help Center
//                   </Link>
//                 </li>
//                 <li>
//                   <Link to="/blog" className="hover:text-foreground">
//                     Blog
//                   </Link>
//                 </li>
//                 <li>
//                   <Link to="/community" className="hover:text-foreground">
//                     Community
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Legal</h4>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 <li>
//                   <Link to="/terms" className="hover:text-foreground">
//                     Terms of Service
//                   </Link>
//                 </li>
//                 <li>
//                   <Link to="/privacy" className="hover:text-foreground">
//                     Privacy Policy
//                   </Link>
//                 </li>
//                 <li>
//                   <Link to="/cookies" className="hover:text-foreground">
//                     Cookie Policy
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//           </div>
//           <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
//             © {new Date().getFullYear()} EduPlatform. All rights reserved.
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }
