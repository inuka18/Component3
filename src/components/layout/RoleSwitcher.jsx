import { useNavigate } from "react-router-dom";
import { Check, LogOut, ShieldCheck, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useRole } from "../../context/RoleContext";
import { cn } from "../../lib/utils";

const ROLE_OPTIONS = [
  { value: "pm", label: "Project Manager", icon: ShieldCheck },
  { value: "member", label: "Team Member", icon: User },
];

export function RoleSwitcher() {
  const { currentUser, role, switchRole, logout } = useRole();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{currentUser.initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">{currentUser.name}</span>
            <span className="text-xs text-muted-foreground">{currentUser.title}</span>
            <span className="text-xs text-muted-foreground">{currentUser.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wide">
          Viewing as
        </DropdownMenuLabel>
        {ROLE_OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt.value} onSelect={() => switchRole(opt.value)} className="gap-2.5">
            <opt.icon className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">{opt.label}</span>
            {role === opt.value && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} className={cn("gap-2.5 text-destructive")}>
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
