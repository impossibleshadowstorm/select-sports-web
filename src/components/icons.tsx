import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircuitBoardIcon,
  Command,
  CreditCard,
  File,
  FileText,
  HelpCircle,
  Image,
  Laptop,
  LayoutDashboardIcon,
  Loader2,
  LogIn,
  LucideIcon,
  LucideProps,
  LucideShoppingBag,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  User,
  UserCircle2Icon,
  UserPen,
  UserX2Icon,
  X,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  dashboard: LayoutDashboardIcon,
  logo: Command,
  login: LogIn,
  close: X,
  product: LucideShoppingBag,
  spinner: Loader2,
  kanban: CircuitBoardIcon,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  employee: UserX2Icon,
  post: FileText,
  page: File,
  userPen: UserPen,
  user2: UserCircle2Icon,
  media: Image,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertTriangle,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  gitHub: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="github"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 496 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
      ></path>
    </svg>
  ),
  football_ground: ({ ...props }: LucideProps) => (
    <svg
      fill="#000000"
      height="800px"
      width="800px"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      {...props}
    >
      <g>
        <g>
          <path
            fill="currentColor"
            d="M501.801,100.738H10.199C4.566,100.738,0,105.304,0,110.937v290.126c0,5.633,4.566,10.199,10.199,10.199h491.602
			c5.633,0,10.199-4.566,10.199-10.199V110.937C512,105.304,507.434,100.738,501.801,100.738z M266.199,219.674
			c15.867,4.462,27.538,19.051,27.538,36.326c0,17.274-11.671,31.863-27.538,36.326V219.674z M20.398,206.74h43.388v98.519H20.398
			V206.74z M20.398,325.657h53.588c5.633,0,10.199-4.566,10.199-10.199V196.541c0-5.633-4.566-10.199-10.199-10.199H20.398v-15.794
			h80.574v170.904H20.398V325.657z M491.602,305.259h-43.388v-98.519h43.388V305.259z M491.602,186.342h-53.588
			c-5.633,0-10.199,4.566-10.199,10.199v118.918c0,5.633,4.566,10.199,10.199,10.199h53.588v15.794h-80.574V170.548h80.574V186.342z
			 M491.602,150.148h-90.773c-5.633,0-10.199,4.566-10.199,10.199V351.65c0,5.633,4.566,10.199,10.199,10.199h90.773v29.013H20.398
			V361.85h90.773c5.633,0,10.199-4.566,10.199-10.199V160.348c0-5.633-4.566-10.199-10.199-10.199H20.398v-29.013h225.402v77.642
			c-27.206,4.837-47.936,28.646-47.936,57.222s20.73,52.384,47.936,57.222v22.331c0,5.633,4.566,10.199,10.199,10.199
			c5.633,0,10.199-4.566,10.199-10.199v-22.332c27.206-4.837,47.936-28.646,47.936-57.222c0-28.575-20.73-52.384-47.936-57.222
			v-77.642h225.402V150.148z M245.801,219.674v72.651c-15.867-4.462-27.538-19.051-27.538-36.326S229.934,224.136,245.801,219.674z"
          />
        </g>
      </g>
      <g>
        <g>
          <path
            fill="currentColor"
            d="M256,355.952c-5.633,0-10.199,4.566-10.199,10.199v2.04c0,5.633,4.566,10.199,10.199,10.199
			c5.633,0,10.199-4.566,10.199-10.199v-2.04C266.199,360.518,261.633,355.952,256,355.952z"
          />
        </g>
      </g>
    </svg>
  ),
  twitter: Twitter,
  check: Check,
};
